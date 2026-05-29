const fs = require("fs");
const http = require("http");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 1312);
const ROOT = __dirname;
const HTML_FILE = path.join(ROOT, "caderneta_mundial_2026.html");
const BASE_FILE = path.join(ROOT, "cromos_base.txt");
const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "caderneta";
const IS_HOSTED = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID || MONGODB_URI);
const COOKIE_NAME = "caderneta_session";
const SESSION_DAYS = 30;
const REGISTER_PIN = String(process.env.REGISTER_PIN || "").trim();

let shutdownTimer = null;
let mongoDbPromise = null;

const emptyAlbum = [
  "pais,codigo,nome,tenho"
];

function readBaseAlbum() {
  if (fs.existsSync(BASE_FILE)) return fs.readFileSync(BASE_FILE, "utf8");
  return emptyAlbum.join("\n") + "\n";
}

function cancelShutdown() {
  if (!shutdownTimer) return;
  clearTimeout(shutdownTimer);
  shutdownTimer = null;
}

function scheduleShutdown() {
  if (IS_HOSTED) return;
  cancelShutdown();
  shutdownTimer = setTimeout(() => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 700).unref();
  }, 3500);
  shutdownTimer.unref();
}

function send(res, status, body, type = "text/plain; charset=utf-8", extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    ...extraHeaders
  });
  res.end(body);
}

function sendJson(res, status, payload, extraHeaders = {}) {
  send(res, status, JSON.stringify(payload), "application/json; charset=utf-8", extraHeaders);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 5_000_000) {
        reject(new Error("Pedido demasiado grande"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function readJson(req) {
  const body = await readBody(req);
  return JSON.parse(body || "{}");
}

function cleanUsername(value) {
  return String(value || "").trim().replace(/\s+/g, "").slice(0, 24);
}

function userKey(value) {
  return cleanUsername(value).toLowerCase();
}

function validateUsername(username) {
  return /^[a-zA-Z0-9_-]{3,24}$/.test(username);
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 4 && password.length <= 72;
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
}

function passwordMatches(password, salt, expectedHash) {
  const hash = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return hash.length === expected.length && crypto.timingSafeEqual(hash, expected);
}

function parseCookies(req) {
  return String(req.headers.cookie || "")
    .split(";")
    .map(part => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const index = part.indexOf("=");
      if (index === -1) return cookies;
      cookies[part.slice(0, index)] = decodeURIComponent(part.slice(index + 1));
      return cookies;
    }, {});
}

function sessionCookie(token) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAge}`
  ];
  if (process.env.RENDER) parts.push("Secure");
  return parts.join("; ");
}

function clearSessionCookie() {
  const parts = [
    `${COOKIE_NAME}=`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0"
  ];
  if (process.env.RENDER) parts.push("Secure");
  return parts.join("; ");
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function getMongoDb() {
  if (!MONGODB_URI) return null;

  if (!mongoDbPromise) {
    mongoDbPromise = (async () => {
      let MongoClient;
      try {
        ({ MongoClient } = require("mongodb"));
      } catch {
        throw new Error("A dependencia mongodb nao esta instalada. Corre npm install.");
      }

      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db(MONGODB_DB);
      await db.collection("users").createIndex({ usernameLower: 1 }, { unique: true });
      await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      await db.collection("colecoes").createIndex({ updatedAt: -1 });
      return db;
    })();
  }

  return mongoDbPromise;
}

async function getAuthUser(req) {
  if (!MONGODB_URI) return null;
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;

  const db = await getMongoDb();
  const session = await db.collection("sessions").findOne({ _id: tokenHash(token) });
  if (!session || new Date(session.expiresAt) <= new Date()) return null;

  return {
    id: session.userId,
    username: session.username
  };
}

async function createSession(db, user) {
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.collection("sessions").insertOne({
    _id: tokenHash(token),
    userId: user._id,
    username: user.username,
    createdAt: now,
    expiresAt
  });

  return token;
}

async function handleAuthRoute(req, res, url) {
  if (url.pathname === "/api/auth/status") {
    const user = await getAuthUser(req);
    return sendJson(res, 200, {
      enabled: Boolean(MONGODB_URI),
      registrationEnabled: Boolean(REGISTER_PIN),
      loggedIn: Boolean(user),
      user
    });
  }

  if (url.pathname === "/api/auth/invite") {
    const inviteToken = String(
      url.searchParams.get("convite") ||
      url.searchParams.get("invite") ||
      url.searchParams.get("pin") ||
      ""
    ).trim();

    return sendJson(res, 200, {
      enabled: Boolean(MONGODB_URI),
      registrationEnabled: Boolean(REGISTER_PIN),
      valid: Boolean(REGISTER_PIN && inviteToken === REGISTER_PIN)
    });
  }

  if (!url.pathname.startsWith("/api/auth/")) return false;
  if (!MONGODB_URI) return sendJson(res, 503, { error: "Login online nao configurado" });

  const db = await getMongoDb();

  if (url.pathname === "/api/auth/register" && req.method === "POST") {
    const payload = await readJson(req);
    const username = cleanUsername(payload.username);
    const usernameLower = userKey(username);
    const password = String(payload.password || "");
    const inviteToken = String(payload.inviteToken || payload.registerPin || payload.pin || "").trim();

    if (!REGISTER_PIN) {
      return sendJson(res, 503, { error: "Registo fechado. Define REGISTER_PIN no Render." });
    }

    if (inviteToken !== REGISTER_PIN) {
      return sendJson(res, 403, { error: "PIN de registo errado." });
    }

    if (!validateUsername(username)) {
      return sendJson(res, 400, { error: "O utilizador deve ter 3 a 24 letras, numeros, _ ou -." });
    }

    if (!validatePassword(password)) {
      return sendJson(res, 400, { error: "A password deve ter entre 4 e 72 caracteres." });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const now = new Date();
    const user = {
      _id: usernameLower,
      username,
      usernameLower,
      salt,
      passwordHash: hashPassword(password, salt),
      createdAt: now
    };

    try {
      await db.collection("users").insertOne(user);
    } catch (error) {
      if (error && error.code === 11000) {
        return sendJson(res, 409, { error: "Esse utilizador ja existe." });
      }
      throw error;
    }

    const token = await createSession(db, user);
    return sendJson(res, 200, {
      ok: true,
      user: { id: user._id, username: user.username }
    }, { "Set-Cookie": sessionCookie(token) });
  }

  if (url.pathname === "/api/auth/login" && req.method === "POST") {
    const payload = await readJson(req);
    const username = cleanUsername(payload.username);
    const password = String(payload.password || "");
    const user = await db.collection("users").findOne({ _id: userKey(username) });

    if (!user || !passwordMatches(password, user.salt, user.passwordHash)) {
      return sendJson(res, 401, { error: "Utilizador ou password errados." });
    }

    const token = await createSession(db, user);
    return sendJson(res, 200, {
      ok: true,
      user: { id: user._id, username: user.username }
    }, { "Set-Cookie": sessionCookie(token) });
  }

  if (url.pathname === "/api/auth/logout" && req.method === "POST") {
    const token = parseCookies(req)[COOKIE_NAME];
    if (token) await db.collection("sessions").deleteOne({ _id: tokenHash(token) });
    return sendJson(res, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
  }

  return false;
}

async function handleLiveRoute(req, res, url) {
  if (url.pathname === "/api/live/status") {
    const user = await getAuthUser(req);
    return sendJson(res, 200, {
      enabled: Boolean(MONGODB_URI),
      registrationEnabled: Boolean(REGISTER_PIN),
      loggedIn: Boolean(user),
      user
    });
  }

  if (!url.pathname.startsWith("/api/live/")) return false;
  if (!MONGODB_URI) return sendJson(res, 503, { error: "Modo online nao configurado" });

  const user = await getAuthUser(req);
  if (!user) return sendJson(res, 401, { error: "Precisas de iniciar sessao." });

  const db = await getMongoDb();
  const collection = db.collection("colecoes");

  if (url.pathname === "/api/live/profiles") {
    const profiles = await collection
      .find({}, { projection: { _id: 0, profile: 1, updatedAt: 1 } })
      .sort({ profile: 1 })
      .limit(100)
      .toArray();
    return sendJson(res, 200, { profiles });
  }

  if (url.pathname === "/api/live/state") {
    if (req.method === "GET") {
      const requestedProfile = cleanUsername(url.searchParams.get("profile")) || user.username;
      const doc = await collection.findOne(
        { _id: userKey(requestedProfile) },
        { projection: { _id: 0, profile: 1, csv: 1, updatedAt: 1 } }
      );

      return sendJson(res, 200, {
        enabled: true,
        exists: Boolean(doc),
        profile: requestedProfile,
        csv: doc?.csv || "",
        updatedAt: doc?.updatedAt || ""
      });
    }

    if (req.method === "POST") {
      const payload = await readJson(req);
      const csv = String(payload.csv || "");

      if (!csv.trim()) return sendJson(res, 400, { error: "Caderneta vazia" });
      if (csv.length > 5_000_000) return sendJson(res, 413, { error: "Pedido demasiado grande" });

      const updatedAt = new Date().toISOString();
      await collection.updateOne(
        { _id: user.id },
        { $set: { profile: user.username, userId: user.id, csv, updatedAt } },
        { upsert: true }
      );

      return sendJson(res, 200, { ok: true, profile: user.username, updatedAt });
    }
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    const authHandled = await handleAuthRoute(req, res, url);
    if (authHandled !== false) return;

    const liveHandled = await handleLiveRoute(req, res, url);
    if (liveHandled !== false) return;

    if (url.pathname === "/api/manter-aberto") {
      cancelShutdown();
      return send(res, 200, "ok");
    }

    if (url.pathname === "/api/fechar") {
      scheduleShutdown();
      return send(res, 200, "ok");
    }

    if (url.pathname === "/" || url.pathname === "/caderneta_mundial_2026.html") {
      cancelShutdown();
      return send(res, 200, fs.readFileSync(HTML_FILE, "utf8"), "text/html; charset=utf-8");
    }

    if (url.pathname === "/api/base-cromos" || url.pathname === "/api/cromos" || url.pathname === "/cromos.txt") {
      if (req.method === "GET") {
        cancelShutdown();
        return send(res, 200, readBaseAlbum(), "text/plain; charset=utf-8");
      }
      return sendJson(res, 410, { error: "O modo local foi desativado. As alteracoes gravam apenas online." });
    }

    return send(res, 404, "Nao encontrado");
  } catch (error) {
    console.error(error);
    const wantsJson = req.url && req.url.startsWith("/api/");
    if (wantsJson) return sendJson(res, 500, { error: "Erro interno" });
    return send(res, 500, "Erro interno");
  }
});

server.listen(PORT, () => {
  console.log(`Caderneta online pronta em http://localhost:${PORT}`);
});