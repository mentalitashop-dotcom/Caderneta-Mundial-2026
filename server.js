const fs = require("fs");
const http = require("http");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
loadLocalEnv(path.join(ROOT, ".env"));
const PORT = Number(process.env.PORT || 1312);
const HTML_FILE = path.join(ROOT, "caderneta_mundial_2026.html");
const BASE_FILE = path.join(ROOT, "cromos_base.txt");
const MANIFEST_FILE = path.join(ROOT, "manifest.webmanifest");
const SERVICE_WORKER_FILE = path.join(ROOT, "sw.js");
const ICON_FILE = path.join(ROOT, "icon.svg");
const APP_ICON_FILE = path.join(ROOT, "app-icon.png");
const APP_ICON_192_FILE = path.join(ROOT, "app-icon-192.png");
const APP_ICON_512_FILE = path.join(ROOT, "app-icon-512.png");
const PACKAGE_FILE = path.join(ROOT, "package.json");
const APP_BUILD_ID = buildAppVersion();
const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "caderneta";
const COOKIE_NAME = "caderneta_session";
const SESSION_IDLE_MINUTES = Number(process.env.SESSION_IDLE_MINUTES || 43200);
const REGISTER_PIN = String(process.env.REGISTER_PIN || "").trim();
const MAX_BODY_BYTES = 5_000_000;
const MAX_TRADE_STICKERS_PER_SIDE = 50;
const MONGO_CONNECT_TIMEOUT_MS = Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 8000);
const AUTH_RATE_WINDOW_MS = 10 * 60 * 1000;
const AUTH_RATE_MAX_FAILURES = 8;
const DEFAULT_USER_COLOR = "#111827";
const USER_COLOR_PALETTE = [
  DEFAULT_USER_COLOR,
  "#7f1d1d",
  "#dc2626",
  "#ea580c",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#16a34a",
  "#059669",
  "#0d9488",
  "#0891b2",
  "#0284c7",
  "#1d4ed8",
  "#312e81",
  "#7c3aed",
  "#a21caf",
  "#db2777",
  "#be123c",
  "#92400e",
  "#4b5563"
];
const IS_RENDER = process.env.RENDER === "true";
const IS_PRODUCTION = process.env.NODE_ENV === "production" || IS_RENDER;
const ONLINE_REQUIRED = process.env.ONLINE_REQUIRED !== "false";
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "same-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'none'",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'"
  ].join("; ")
};

if (IS_PRODUCTION) {
  SECURITY_HEADERS["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
}

const COLLECTIONS = {
  users: "users",
  sessions: "sessions",
  album: "album_stickers",
  userStickers: "user_stickers",
  trades: "trade_proposals",
  snapshots: "collection_snapshots",
  history: "activity_logs",
  legacyCollections: "colecoes"
};
const SNAPSHOT_SCHEMA_VERSION = 2;

const emptyAlbum = [
  "pais,codigo,nome,tenho,repetidos"
];

let mongoDbPromise = null;
let mongoClient = null;
let baseSyncPromise = null;
const authFailures = new Map();

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function loadLocalEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) || process.env[key] !== undefined) continue;

    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function readBaseAlbum() {
  if (fs.existsSync(BASE_FILE)) return fs.readFileSync(BASE_FILE, "utf8");
  return emptyAlbum.join("\n") + "\n";
}

function fileMtimeMs(filePath) {
  try {
    return fs.existsSync(filePath) ? Math.round(fs.statSync(filePath).mtimeMs) : 0;
  } catch {
    return 0;
  }
}

function buildAppVersion() {
  let packageVersion = "0.0.0";
  try {
    packageVersion = JSON.parse(fs.readFileSync(PACKAGE_FILE, "utf8")).version || packageVersion;
  } catch {}

  const newestAsset = Math.max(
    fileMtimeMs(HTML_FILE),
    fileMtimeMs(SERVICE_WORKER_FILE),
    fileMtimeMs(MANIFEST_FILE),
    fileMtimeMs(APP_ICON_FILE),
    fileMtimeMs(APP_ICON_192_FILE),
    fileMtimeMs(APP_ICON_512_FILE),
    fileMtimeMs(ICON_FILE)
  );
  return `${packageVersion}-${newestAsset || Date.now()}`;
}

function serviceWorkerBody() {
  const body = fs.existsSync(SERVICE_WORKER_FILE) ? fs.readFileSync(SERVICE_WORKER_FILE, "utf8") : "";
  return body.replace(/__APP_BUILD__/g, APP_BUILD_ID);
}
function send(res, status, body, type = "text/plain; charset=utf-8", extraHeaders = {}) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    ...SECURITY_HEADERS,
    ...extraHeaders
  });
  res.end(body);
}

function sendJson(res, status, payload, extraHeaders = {}) {
  send(res, status, JSON.stringify(payload), "application/json; charset=utf-8", extraHeaders);
}

function methodNotAllowed(res, allowedMethods) {
  return sendJson(
    res,
    405,
    { error: "Metodo nao permitido" },
    { Allow: allowedMethods.join(", ") }
  );
}

function onlineConfigStatus() {
  const missing = [];
  if (!MONGODB_URI) missing.push("MONGODB_URI");

  return {
    ok: missing.length === 0,
    missing,
    onlineRequired: ONLINE_REQUIRED,
    production: IS_PRODUCTION,
    render: IS_RENDER,
    databaseName: MONGODB_DB,
    registrationConfigured: Boolean(REGISTER_PIN)
  };
}

function assertOnlineConfig() {
  const status = onlineConfigStatus();
  if (ONLINE_REQUIRED && !status.ok) {
    throw new Error(`Configuracao online incompleta: falta ${status.missing.join(", ")}.`);
  }

  if (IS_PRODUCTION && !REGISTER_PIN) {
    console.warn("Aviso: REGISTER_PIN nao esta definido. O registo fica fechado e so contas existentes conseguem entrar.");
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      body += chunk;
      if (body.length > MAX_BODY_BYTES) {
        reject(new HttpError(413, "Pedido demasiado grande"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function readJson(req) {
  const body = await readBody(req);
  try {
    return JSON.parse(body || "{}");
  } catch {
    throw new HttpError(400, "JSON invalido");
  }
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
  return typeof password === "string" && password.length >= 8 && password.length <= 72;
}

function requestIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}

function authRateKey(req, action, username = "") {
  return `${action}:${requestIp(req)}:${userKey(username) || "-"}`;
}

function currentAuthFailures(key) {
  const now = Date.now();
  const attempts = (authFailures.get(key) || []).filter(time => now - time < AUTH_RATE_WINDOW_MS);
  if (attempts.length) authFailures.set(key, attempts);
  else authFailures.delete(key);
  return attempts;
}

function authRequestAllowed(req, res, action, username = "") {
  const key = authRateKey(req, action, username);
  const attempts = currentAuthFailures(key);
  if (attempts.length < AUTH_RATE_MAX_FAILURES) return true;

  const retrySeconds = Math.max(1, Math.ceil((AUTH_RATE_WINDOW_MS - (Date.now() - attempts[0])) / 1000));
  sendJson(
    res,
    429,
    { error: "Demasiadas tentativas. Espera alguns minutos e tenta novamente." },
    { "Retry-After": String(retrySeconds) }
  );
  return false;
}

function recordAuthFailure(req, action, username = "") {
  const key = authRateKey(req, action, username);
  const attempts = currentAuthFailures(key);
  attempts.push(Date.now());
  authFailures.set(key, attempts);
}

function clearAuthFailures(req, action, username = "") {
  authFailures.delete(authRateKey(req, action, username));
}

function normalizeColor(value) {
  return String(value || "").trim().toLowerCase();
}

function validateUserColor(value) {
  return USER_COLOR_PALETTE.includes(normalizeColor(value));
}

function cleanUserColor(value) {
  const color = normalizeColor(value);
  return validateUserColor(color) ? color : DEFAULT_USER_COLOR;
}


function cleanProfilePhoto(value) {
  const photo = String(value || "").trim();
  if (!photo) return "";
  if (photo.length > 180000) return "";
  return /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i.test(photo) ? photo : "";
}
async function usedUserColors(db, excludedUserId = "") {
  const docs = await db.collection(COLLECTIONS.users)
    .find(
      { _id: { $ne: excludedUserId } },
      { projection: { userColor: 1, themeColor: 1, profilePhoto: 1 } }
    )
    .toArray();

  return [...new Set(docs
    .map(doc => cleanUserColor(doc.userColor || doc.themeColor))
    .filter(color => color !== DEFAULT_USER_COLOR))];
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
}

function passwordMatches(password, salt, expectedHash) {
  if (
    typeof password !== "string" ||
    typeof salt !== "string" ||
    !salt ||
    typeof expectedHash !== "string" ||
    !/^[a-f0-9]{64}$/i.test(expectedHash)
  ) {
    return false;
  }

  try {
    const hash = Buffer.from(hashPassword(password, salt), "hex");
    const expected = Buffer.from(expectedHash, "hex");
    return hash.length === expected.length && crypto.timingSafeEqual(hash, expected);
  } catch {
    return false;
  }
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
  const maxAge = SESSION_IDLE_MINUTES * 60;
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAge}`,
    "Priority=High"
  ];
  if (IS_RENDER) parts.push("Secure");
  return parts.join("; ");
}

function clearSessionCookie() {
  const parts = [
    `${COOKIE_NAME}=`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0",
    "Priority=High"
  ];
  if (IS_RENDER) parts.push("Secure");
  return parts.join("; ");
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function normalizeOwned(value) {
  if (typeof value === "boolean") return value;
  const v = String(value || "").trim().toLowerCase();
  return ["sim", "s", "yes", "y", "true", "1", "obtido", "tenho"].includes(v);
}

function normalizeDuplicates(value) {
  const parsed = Number.parseInt(String(value ?? "0").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeReserved(value) {
  return normalizeDuplicates(value);
}

function normalizeReservationPerson(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 80) || "Sem nome";
}

function normalizeReservations(value) {
  let raw = value;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try { raw = JSON.parse(trimmed); } catch { return []; }
  }

  const list = Array.isArray(raw) ? raw : (raw && typeof raw === "object" ? [raw] : []);
  return list.map(item => ({
    person: normalizeReservationPerson(item?.person || item?.name || item?.reservedFor || item?.para),
    count: normalizeDuplicates(item?.count ?? item?.quantity ?? item?.qty ?? item?.total ?? item?.value ?? 1),
    createdAt: String(item?.createdAt || item?.date || "").slice(0, 40)
  })).filter(item => item.count > 0);
}

function reservationTotal(sticker) {
  return normalizeReservations(sticker?.reservas ?? sticker?.reservations).reduce((sum, item) => sum + item.count, 0);
}

function capReservations(reservations, duplicateCount) {
  let remaining = normalizeDuplicates(duplicateCount);
  return normalizeReservations(reservations).map(item => {
    const count = Math.min(item.count, remaining);
    remaining -= count;
    return { ...item, count };
  }).filter(item => item.count > 0);
}

function reservedDuplicates(sticker) {
  const reservations = normalizeReservations(sticker?.reservas ?? sticker?.reservations);
  const raw = reservations.length ? reservationTotal({ reservas: reservations }) : normalizeReserved(sticker?.reservados ?? sticker?.reserved);
  return Math.min(raw, normalizeDuplicates(sticker?.repetidos ?? sticker?.duplicates));
}

function availableDuplicates(sticker) {
  return Math.max(0, normalizeDuplicates(sticker?.repetidos ?? sticker?.duplicates) - reservedDuplicates(sticker));
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === "\"" && next === "\"") {
      current += "\"";
      i++;
    } else if (char === "\"") {
      insideQuotes = !insideQuotes;
    } else if ((char === "," || char === ";") && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function makeStickerId(sticker) {
  return `${sticker.pais}__${sticker.codigo}`.toLowerCase().replace(/\s+/g, "_");
}

function cleanSticker(item, albumOrder = 0) {
  const sticker = {
    pais: String(item.pais || item.country || "SEM").trim(),
    codigo: String(item.codigo || item.code || item.id || "").trim(),
    nome: String(item.nome || item.name || item.jogador || item.player || "").trim(),
    tenho: normalizeOwned(item.tenho ?? item.owned ?? item.obtido ?? item.have),
    repetidos: normalizeDuplicates(item.repetidos ?? item.duplicados ?? item.duplicates ?? item.duplicatesCount),
    reservados: normalizeReserved(item.reservados ?? item.suspensos ?? item.guardados ?? item.reserved ?? item.held ?? item.inativos),
    reservas: normalizeReservations(item.reservas ?? item.reservations ?? item.reservedFor ?? item.reservasjson ?? item.reservasJson),
    albumOrder
  };

  if (!sticker.codigo) sticker.codigo = `${sticker.pais}-${albumOrder + 1}`;
  if (!sticker.nome) sticker.nome = "Sem nome definido";

  if (!sticker.tenho) {
    sticker.repetidos = 0;
    sticker.reservados = 0;
    sticker.reservas = [];
  } else {
    sticker.reservas = capReservations(sticker.reservas, sticker.repetidos);
    sticker.reservados = sticker.reservas.length
      ? reservationTotal({ reservas: sticker.reservas })
      : Math.min(sticker.reservados, sticker.repetidos);
  }

  sticker.id = makeStickerId(sticker);
  return sticker;
}

function parseTextFile(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const json = JSON.parse(trimmed);
    const arr = Array.isArray(json) ? json : json.cromos || json.stickers || [];
    return arr.map((item, index) => cleanSticker(item, index));
  }

  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  const firstLine = parseCSVLine(lines[0]);
  const knownHeaders = ["pais", "country", "codigo", "code", "nome", "name", "tenho", "owned", "repetidos", "duplicados", "duplicates", "reservados", "suspensos", "guardados", "reserved", "held", "inativos", "reservas", "reservations", "reservedfor", "reservasjson"];
  const hasHeader = firstLine.some(header => knownHeaders.includes(header.trim().toLowerCase()));

  let headers = ["pais", "codigo", "nome", "tenho", "repetidos"];
  let start = 0;

  if (hasHeader) {
    headers = firstLine.map(header => header.trim().toLowerCase());
    start = 1;
  }

  return lines.slice(start).map((line, index) => {
    const values = parseCSVLine(line);
    const item = {};
    headers.forEach((header, headerIndex) => item[header] = values[headerIndex] || "");
    return cleanSticker(item, index);
  });
}

function csvEscape(value) {
  return `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
}

function stickersToCSV(stickers) {
  const header = "pais,codigo,nome,tenho,repetidos,reservados,reservas";
  const rows = stickers.map(sticker => [
    sticker.pais,
    sticker.codigo,
    sticker.nome,
    sticker.tenho ? "sim" : "nao",
    sticker.repetidos || 0,
    reservedDuplicates(sticker),
    JSON.stringify(normalizeReservations(sticker.reservas ?? sticker.reservations))
  ].map(csvEscape).join(","));

  return [header, ...rows].join("\n");
}

function countStickerState(stickers) {
  return stickers.reduce((counts, sticker) => {
    counts.total += 1;
    if (sticker.tenho) counts.owned += 1;
    if (!sticker.tenho) counts.missing += 1;
    counts.duplicates += availableDuplicates(sticker);
    counts.reserved += reservedDuplicates(sticker);
    return counts;
  }, { total: 0, owned: 0, missing: 0, duplicates: 0, reserved: 0 });
}

function baseDocToSticker(doc) {
  return cleanSticker({
    pais: doc.countryCode || doc.pais,
    codigo: doc.code || doc.codigo,
    nome: doc.name || doc.nome,
    tenho: false,
    repetidos: 0
  }, doc.albumOrder || 0);
}

function userProgressDoc(user, sticker, now, source = "base") {
  const owned = Boolean(sticker.tenho);
  const duplicates = normalizeDuplicates(sticker.repetidos);
  const reservations = capReservations(sticker.reservas ?? sticker.reservations, duplicates);
  const reserved = Math.min(reservations.length ? reservationTotal({ ...sticker, reservas: reservations }) : normalizeReserved(sticker.reservados), duplicates);
  return {
    _id: `${user.id}:${sticker.id}`,
    userId: user.id,
    username: user.username,
    stickerId: sticker.id,
    countryCode: sticker.pais,
    code: sticker.codigo,
    name: sticker.nome,
    albumOrder: sticker.albumOrder || 0,
    owned,
    missing: !owned,
    duplicates,
    reserved,
    reservations,
        status: owned ? "obtido" : "em_falta",
    source,
    createdAt: now,
    updatedAt: now
  };
}

async function ensureUsernameIndex(db) {
  const users = db.collection(COLLECTIONS.users);
  let indexes = [];

  try {
    indexes = await users.indexes();
  } catch (error) {
    if (error?.code !== 26 && error?.codeName !== "NamespaceNotFound") throw error;
  }

  const existing = indexes.find(index => {
    const keys = Object.keys(index.key || {});
    return keys.length === 1 && index.key.usernameLower === 1;
  });

  if (existing?.unique) return;
  if (existing?.name) await users.dropIndex(existing.name);

  await users.createIndex({ usernameLower: 1 }, { unique: true });
}

async function ensureIndexes(db) {
  await ensureUsernameIndex(db);
  await db.collection(COLLECTIONS.users).createIndex({ role: 1, verified: 1 });
  await db.collection(COLLECTIONS.sessions).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection(COLLECTIONS.sessions).createIndex({ userId: 1 });
  await db.collection(COLLECTIONS.album).createIndex({ active: 1, albumOrder: 1 });
  await db.collection(COLLECTIONS.album).createIndex({ countryCode: 1, code: 1 });
  await db.collection(COLLECTIONS.userStickers).createIndex({ userId: 1, stickerId: 1 }, { unique: true });
  await db.collection(COLLECTIONS.userStickers).createIndex({ userId: 1, owned: 1 });
  await db.collection(COLLECTIONS.userStickers).createIndex({ userId: 1, missing: 1 });
  await db.collection(COLLECTIONS.userStickers).createIndex({ userId: 1, duplicates: 1 });
  await db.collection(COLLECTIONS.userStickers).createIndex({ userId: 1, reserved: 1 });
  await db.collection(COLLECTIONS.userStickers).createIndex({ userId: 1, countryCode: 1, albumOrder: 1 });
  await db.collection(COLLECTIONS.trades).createIndex({ fromUserId: 1, createdAt: -1 });
  await db.collection(COLLECTIONS.trades).createIndex({ toUserId: 1, createdAt: -1 });
  await db.collection(COLLECTIONS.trades).createIndex({ status: 1, updatedAt: -1 });
  await db.collection(COLLECTIONS.snapshots).createIndex({ updatedAt: -1 });
  await db.collection(COLLECTIONS.history).createIndex({ userId: 1, createdAt: -1 });
  await db.collection(COLLECTIONS.history).createIndex({ userId: 1, clientId: 1 });
  await db.collection(COLLECTIONS.history).createIndex({ tradeId: 1 });
}

async function normalizeExistingUsersForIndexes(db) {
  await db.collection(COLLECTIONS.users).updateMany(
    { usernameLower: { $exists: false }, username: { $type: "string" } },
    [
      {
        $set: {
          usernameLower: { $toLower: "$username" },
          role: { $ifNull: ["$role", "verificado"] },
          verified: { $ifNull: ["$verified", true] },
          userColor: { $ifNull: ["$userColor", { $ifNull: ["$themeColor", DEFAULT_USER_COLOR] }] },
          verifiedByLegacyUpgrade: true
        }
      }
    ]
  );

  await db.collection(COLLECTIONS.users).updateMany(
    { $or: [{ role: { $exists: false } }, { verified: { $exists: false } }, { userColor: { $exists: false } }] },
    [
      {
        $set: {
          role: { $ifNull: ["$role", "verificado"] },
          verified: { $ifNull: ["$verified", true] },
          userColor: { $ifNull: ["$userColor", { $ifNull: ["$themeColor", DEFAULT_USER_COLOR] }] },
          verifiedByLegacyUpgrade: true
        }
      }
    ]
  );
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

      const client = new MongoClient(MONGODB_URI, {
        appName: "caderneta-mundial-2026",
        serverSelectionTimeoutMS: MONGO_CONNECT_TIMEOUT_MS
      });

      try {
        await client.connect();
        const db = client.db(MONGODB_DB);
        await normalizeExistingUsersForIndexes(db);
        await ensureIndexes(db);
        mongoClient = client;
        return db;
      } catch (error) {
        await client.close().catch(() => {});
        throw error;
      }
    })().catch(error => {
      mongoDbPromise = null;
      mongoClient = null;
      throw error;
    });
  }

  return mongoDbPromise;
}

async function openMongoDbForRequest(res) {
  try {
    return await getMongoDb();
  } catch (error) {
    console.error("Erro ao ligar a MongoDB:", error);
    sendJson(res, 503, { error: "Nao foi possivel ligar a MongoDB. Confirma a variavel MONGODB_URI no Render." });
    return null;
  }
}

function loadBaseStickersFromFile() {
  return parseTextFile(readBaseAlbum()).map((sticker, index) => ({
    ...sticker,
    tenho: false,
    repetidos: 0,
    albumOrder: index
  }));
}

async function syncBaseAlbum(db) {
  if (baseSyncPromise) return baseSyncPromise;

  baseSyncPromise = (async () => {
    const stickers = loadBaseStickersFromFile();
    if (!stickers.length) return stickers;

    const now = new Date();
    const ids = stickers.map(sticker => sticker.id);
    const operations = stickers.map(sticker => ({
      updateOne: {
        filter: { _id: sticker.id },
        update: {
          $set: {
            stickerId: sticker.id,
            countryCode: sticker.pais,
            code: sticker.codigo,
            name: sticker.nome,
            albumOrder: sticker.albumOrder,
            active: true,
            updatedAt: now
          },
          $setOnInsert: { createdAt: now }
        },
        upsert: true
      }
    }));

    await db.collection(COLLECTIONS.album).bulkWrite(operations, { ordered: false });
    await db.collection(COLLECTIONS.album).updateMany(
      { _id: { $nin: ids } },
      { $set: { active: false, updatedAt: now } }
    );

    return stickers;
  })().catch(error => {
    baseSyncPromise = null;
    throw error;
  });

  return baseSyncPromise;
}

async function getAlbumStickers(db) {
  await syncBaseAlbum(db);

  const docs = await db.collection(COLLECTIONS.album)
    .find({ active: true })
    .sort({ albumOrder: 1 })
    .toArray();

  if (!docs.length) return loadBaseStickersFromFile();
  return docs.map(baseDocToSticker);
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user._id || user.id,
    username: user.username,
    role: user.role || "verificado",
    verified: user.verified !== false,
    userColor: cleanUserColor(user.userColor || user.themeColor),
    profilePhoto: cleanProfilePhoto(user.profilePhoto)
  };
}

async function normalizeUserAccount(db, user) {
  if (!user) return null;
  const changes = {};
  if (!user.role) changes.role = "verificado";
  if (user.verified === undefined) changes.verified = true;
  if (!user.userColor) changes.userColor = cleanUserColor(user.themeColor);
  if (!Object.keys(changes).length) return user;

  await db.collection(COLLECTIONS.users).updateOne({ _id: user._id }, { $set: changes });
  return { ...user, ...changes };
}

async function findUserAccount(db, username, options = {}) {
  const key = userKey(username);
  if (!key) return null;

  const users = db.collection(COLLECTIONS.users);
  return (await users.findOne({ _id: key }, options)) ||
    (await users.findOne({ usernameLower: key }, options));
}

async function findVerifiedUser(db, username) {
  let user = await findUserAccount(
    db,
    username,
    { projection: { username: 1, usernameLower: 1, role: 1, verified: 1, userColor: 1, themeColor: 1, profilePhoto: 1 } }
  );

  user = await normalizeUserAccount(db, user);
  if (!user || user.role !== "verificado" || user.verified !== true) return null;
  return publicUser(user);
}

async function getAuthUser(req, res) {
  if (!MONGODB_URI) return null;
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;

  let db;
  try {
    db = await getMongoDb();
  } catch (error) {
    console.error("Erro ao validar sessao MongoDB:", error);
    return null;
  }

  const session = await db.collection(COLLECTIONS.sessions).findOne({ _id: tokenHash(token) });
  const now = new Date();
  if (!session || new Date(session.expiresAt) <= now) {
    if (session) await db.collection(COLLECTIONS.sessions).deleteOne({ _id: session._id });
    return null;
  }

  const expiresAt = new Date(now.getTime() + SESSION_IDLE_MINUTES * 60 * 1000);
  await db.collection(COLLECTIONS.sessions).updateOne(
    { _id: session._id },
    { $set: { lastSeenAt: now, expiresAt } }
  );

  if (res) res.setHeader("Set-Cookie", sessionCookie(token));

  return findVerifiedUser(db, session.userId);
}

async function createSession(db, user) {
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_IDLE_MINUTES * 60 * 1000);

  await db.collection(COLLECTIONS.sessions).insertOne({
    _id: tokenHash(token),
    userId: user._id || user.id,
    username: user.username,
    role: user.role,
    createdAt: now,
    lastSeenAt: now,
    expiresAt
  });

  return token;
}

async function requireVerifiedUser(req, res) {
  const user = await getAuthUser(req, res);
  if (!user) {
    sendJson(res, 401, { error: "Acesso bloqueado. Inicia sessao com uma conta verificada." });
    return null;
  }
  return user;
}

async function migrateLegacyCollectionIfNeeded(db, user) {
  const existingCount = await db.collection(COLLECTIONS.userStickers).countDocuments(userProgressOwnerQuery(user), { limit: 1 });
  if (existingCount > 0) return;

  const legacy = await db.collection(COLLECTIONS.legacyCollections).findOne(
    {
      $or: [
        { _id: user.id },
        { _id: user.username },
        { profile: user.username },
        { username: user.username }
      ]
    },
    { projection: { csv: 1, updatedAt: 1, profile: 1 } }
  );

  if (!legacy || !legacy.csv) return;

  const now = new Date();
  const stickers = parseTextFile(legacy.csv);
  if (!stickers.length) return;

  const operations = stickers.map((sticker, index) => {
    const normalizedSticker = { ...sticker, albumOrder: sticker.albumOrder ?? index };
    return {
      updateOne: {
        filter: { userId: user.id, stickerId: normalizedSticker.id },
        update: {
          $setOnInsert: userProgressDoc(user, normalizedSticker, now, "legacy_csv")
        },
        upsert: true
      }
    };
  });

  await db.collection(COLLECTIONS.userStickers).bulkWrite(operations, { ordered: false });
}

function userProgressOwnerQuery(user) {
  return {
    $or: [
      { userId: user.id },
      { userId: user.username },
      { username: user.username }
    ]
  };
}

async function ensureUserStickerRows(db, user) {
  await migrateLegacyCollectionIfNeeded(db, user);

  const album = await getAlbumStickers(db);
  const existing = await db.collection(COLLECTIONS.userStickers)
    .find(userProgressOwnerQuery(user), { projection: { stickerId: 1, countryCode: 1, pais: 1, code: 1, codigo: 1 } })
    .toArray();
  const existingIds = new Set();
  existing.forEach(item => {
    if (item.stickerId) existingIds.add(item.stickerId);
    if ((item.countryCode || item.pais) && (item.code || item.codigo)) {
      existingIds.add(makeStickerId({
        pais: item.countryCode || item.pais,
        codigo: item.code || item.codigo
      }));
    }
  });
  const missing = album.filter(sticker => !existingIds.has(sticker.id));

  if (!missing.length) return;

  const now = new Date();
  await db.collection(COLLECTIONS.userStickers).bulkWrite(
    missing.map(sticker => ({
      updateOne: {
        filter: { userId: user.id, stickerId: sticker.id },
        update: {
          $setOnInsert: userProgressDoc(user, sticker, now, "album_base")
        },
        upsert: true
      }
    })),
    { ordered: false }
  );
}

async function getUserStickerState(db, user) {
  await ensureUserStickerRows(db, user);

  const album = await getAlbumStickers(db);
  const progressDocs = await db.collection(COLLECTIONS.userStickers)
    .find(userProgressOwnerQuery(user))
    .sort({ updatedAt: 1 })
    .toArray();
  const progressByStickerId = new Map();
  progressDocs.forEach(doc => {
    if (doc.stickerId) progressByStickerId.set(doc.stickerId, doc);
    if ((doc.countryCode || doc.pais) && (doc.code || doc.codigo)) {
      progressByStickerId.set(makeStickerId({
        pais: doc.countryCode || doc.pais,
        codigo: doc.code || doc.codigo
      }), doc);
    }
  });

  return album.map(sticker => {
    const progress = progressByStickerId.get(sticker.id);
    const owned = normalizeOwned(progress?.owned ?? progress?.tenho ?? progress?.obtido ?? progress?.have);
    const duplicates = normalizeDuplicates(progress?.duplicates ?? progress?.repetidos ?? progress?.duplicados ?? progress?.duplicatesCount);
    const reservations = normalizeReservations(progress?.reservations ?? progress?.reservas ?? progress?.reservedFor);
    const reserved = Math.min(
      reservations.length
        ? reservationTotal({ reservas: reservations })
        : normalizeReserved(progress?.reserved ?? progress?.reservados ?? progress?.guardados),
      duplicates
    );
    return {
      ...sticker,
      tenho: owned,
      repetidos: owned ? duplicates : 0,
      reservados: owned ? reserved : 0,
      reservas: owned ? capReservations(reservations, duplicates) : [],
      albumOrder: sticker.albumOrder
    };
  });
}

async function saveSnapshot(db, user, stickers, updatedAt = new Date().toISOString()) {
  await db.collection(COLLECTIONS.snapshots).updateOne(
    { _id: user.id },
    {
      $set: {
        schemaVersion: SNAPSHOT_SCHEMA_VERSION,
        userId: user.id,
        profile: user.username,
        csv: stickersToCSV(stickers),
        counts: countStickerState(stickers),
        updatedAt
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );
}

async function updateUserStickerRowsFromCsv(db, user, csv) {
  const incoming = parseTextFile(csv);
  if (!incoming.length) return { stickers: [], updatedAt: new Date().toISOString() };

  const now = new Date();
  const updatedAt = now.toISOString();
  const album = await getAlbumStickers(db);
  const albumById = new Map(album.map(sticker => [sticker.id, sticker]));

  await db.collection(COLLECTIONS.userStickers).bulkWrite(
    incoming.map((incomingSticker, index) => {
      const baseSticker = albumById.get(incomingSticker.id) || incomingSticker;
      const sticker = {
        ...baseSticker,
        tenho: Boolean(incomingSticker.tenho),
        repetidos: normalizeDuplicates(incomingSticker.repetidos),
        reservados: normalizeReserved(incomingSticker.reservados),
        reservas: normalizeReservations(incomingSticker.reservas),
        albumOrder: baseSticker.albumOrder ?? index
      };
      const owned = Boolean(sticker.tenho);
      const duplicates = normalizeDuplicates(sticker.repetidos);
      const reservations = normalizeReservations(sticker.reservas ?? sticker.reservations);
  const reserved = Math.min(reservations.length ? reservationTotal({ ...sticker, reservas: reservations }) : normalizeReserved(sticker.reservados), duplicates);

      return {
        updateOne: {
          filter: { userId: user.id, stickerId: sticker.id },
          update: {
            $set: {
              username: user.username,
              countryCode: sticker.pais,
              code: sticker.codigo,
              name: sticker.nome,
              albumOrder: sticker.albumOrder,
              owned,
              missing: !owned,
              duplicates,
              reserved,
    reservations,
                  status: owned ? "obtido" : "em_falta",
              source: "online_app",
              updatedAt: now
            },
            $setOnInsert: {
              _id: `${user.id}:${sticker.id}`,
              userId: user.id,
              stickerId: sticker.id,
              createdAt: now
            }
          },
          upsert: true
        }
      };
    }),
    { ordered: false }
  );

  const stickers = await getUserStickerState(db, user);
  await saveSnapshot(db, user, stickers, updatedAt);
  return { stickers, updatedAt };
}

function cleanStickerIdList(value) {
  const list = Array.isArray(value) ? value : [value];
  return [...new Set(
    list
      .map(item => String(item || "").trim().slice(0, 160))
      .filter(Boolean)
  )];
}

function publicTradeSticker(sticker) {
  return {
    id: sticker.id,
    pais: sticker.pais,
    codigo: sticker.codigo,
    nome: sticker.nome
  };
}

function publicTrade(doc, viewer) {
  return {
    id: doc._id,
    fromUser: doc.fromUser,
    toUser: doc.toUser,
    direction: doc.fromUserId === viewer.id ? "outgoing" : "incoming",
    status: doc.status,
    give: doc.give || [],
    receive: doc.receive || [],
    message: doc.message || "",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    acceptedAt: doc.acceptedAt || null,
    rejectedAt: doc.rejectedAt || null,
    cancelledAt: doc.cancelledAt || null
  };
}

function tradeStickerLabel(sticker) {
  const country = String(sticker.pais || "").split(" ")[0];
  const code = String(sticker.codigo || "").trim();
  const prefixPattern = new RegExp(`^${country.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i");
  const withoutPrefix = country ? code.replace(prefixPattern, "").trim() : code;
  const displayCode = withoutPrefix === "00"
    ? "00"
    : (withoutPrefix.match(/(\d+)\s*$/) ? String(Number(withoutPrefix.match(/(\d+)\s*$/)[1])) : withoutPrefix || code);
  return `${country} ${displayCode} - ${sticker.nome}`;
}

function cleanHistoryText(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 500);
}

function cleanHistoryAction(value) {
  return String(value || "sticker_update").replace(/[^a-z0-9_-]/gi, "").slice(0, 60) || "sticker_update";
}

function cleanHistorySticker(sticker = {}) {
  return {
    id: String(sticker.id || "").slice(0, 160),
    pais: String(sticker.pais || sticker.countryCode || "").slice(0, 80),
    codigo: String(sticker.codigo || sticker.code || "").slice(0, 80),
    nome: String(sticker.nome || sticker.name || "").slice(0, 160)
  };
}

function cleanHistoryStickerList(value) {
  const list = Array.isArray(value) ? value : [];
  return list.slice(0, 120).map(cleanHistorySticker).filter(sticker => sticker.id || sticker.codigo || sticker.nome);
}

function publicHistoryLog(doc) {
  return {
    id: doc._id,
    clientId: doc.clientId || "",
    type: doc.type || "sticker",
    action: doc.action || "sticker_update",
    text: doc.text || "",
    stickers: doc.stickers || [],
    given: doc.given || [],
    received: doc.received || [],
    partner: doc.partner || "",
    tradeId: doc.tradeId || "",
    source: doc.source || "server",
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt
  };
}

async function insertHistoryLogs(db, docs) {
  const list = docs.filter(Boolean).map(doc => ({
    _id: doc._id || crypto.randomUUID(),
    userId: doc.userId,
    username: doc.username,
    clientId: cleanHistoryText(doc.clientId),
    type: cleanHistoryAction(doc.type || "sticker"),
    action: cleanHistoryAction(doc.action),
    text: cleanHistoryText(doc.text),
    stickers: cleanHistoryStickerList(doc.stickers),
    given: cleanHistoryStickerList(doc.given),
    received: cleanHistoryStickerList(doc.received),
    partner: cleanHistoryText(doc.partner),
    tradeId: cleanHistoryText(doc.tradeId),
    source: doc.source || "server",
    createdAt: doc.createdAt || new Date()
  })).filter(doc => doc.userId && doc.text);

  if (!list.length) return [];
  await db.collection(COLLECTIONS.history).insertMany(list, { ordered: false });
  return list;
}

async function createHistoryLog(db, user, payload) {
  const now = new Date();
  const [doc] = await insertHistoryLogs(db, [{
    userId: user.id,
    username: user.username,
    clientId: payload.clientId,
    type: payload.type || "sticker",
    action: payload.action || "sticker_update",
    text: payload.text,
    stickers: payload.stickers,
    given: payload.given,
    received: payload.received,
    partner: payload.partner,
    tradeId: payload.tradeId,
    source: "client",
    createdAt: now
  }]);
  return doc;
}

async function findUserById(db, userId) {
  const user = await db.collection(COLLECTIONS.users).findOne(
    { _id: userId },
    { projection: { username: 1, usernameLower: 1, role: 1, verified: 1 } }
  );
  const normalized = await normalizeUserAccount(db, user);
  if (!normalized || normalized.role !== "verificado" || normalized.verified !== true) return null;
  return publicUser(normalized);
}

async function applyAcceptedTrade(db, trade, fromUser, toUser, session) {
  const stickerIds = [...new Set([
    ...(trade.give || []).map(sticker => sticker.id),
    ...(trade.receive || []).map(sticker => sticker.id)
  ])];
  const progressDocs = await db.collection(COLLECTIONS.userStickers)
    .find(
      {
        userId: { $in: [fromUser.id, toUser.id] },
        stickerId: { $in: stickerIds }
      },
      { session }
    )
    .toArray();
  const progressByKey = new Map(progressDocs.map(doc => [`${doc.userId}:${doc.stickerId}`, doc]));
  const progressFor = (user, sticker) => progressByKey.get(`${user.id}:${sticker.id}`);

  for (const sticker of trade.give || []) {
    const fromSticker = progressFor(fromUser, sticker);
    const toSticker = progressFor(toUser, sticker);
    if (!fromSticker || !toSticker) throw new HttpError(409, "A troca ja nao e valida.");
    if (!fromSticker.owned || availableDuplicates(fromSticker) <= 0) {
      throw new HttpError(409, `${fromUser.username} ja nao tem ${tradeStickerLabel(sticker)} repetido.`);
    }
  }

  for (const sticker of trade.receive || []) {
    const fromSticker = progressFor(fromUser, sticker);
    const toSticker = progressFor(toUser, sticker);
    if (!fromSticker || !toSticker) throw new HttpError(409, "A troca ja nao e valida.");
    if (fromSticker.owned) {
      throw new HttpError(409, `${fromUser.username} ja tem ${tradeStickerLabel(sticker)}.`);
    }
    if (!toSticker.owned || availableDuplicates(toSticker) <= 0) {
      throw new HttpError(409, `${toUser.username} ja nao tem ${tradeStickerLabel(sticker)} repetido.`);
    }
  }

  const now = new Date();
  const operations = [];
  const decrementDuplicate = (user, sticker) => operations.push({
    updateOne: {
      filter: { userId: user.id, stickerId: sticker.id, owned: true, duplicates: { $gt: 0 }, $expr: { $gt: ["$duplicates", { $ifNull: ["$reserved", 0] }] } },
      update: {
        $inc: { duplicates: -1 },
        $set: { updatedAt: now, tradeUpdatedAt: now }
      }
    }
  });
  const addReceivedSticker = (user, sticker, alreadyOwned) => {
    const update = {
      $set: {
        owned: true,
        missing: false,
        status: "obtido",
        updatedAt: now,
        tradeUpdatedAt: now
      }
    };

    if (alreadyOwned) update.$inc = { duplicates: 1 };

    operations.push({
      updateOne: {
        filter: { userId: user.id, stickerId: sticker.id },
        update
      }
    });
  };

  (trade.give || []).forEach(sticker => {
    decrementDuplicate(fromUser, sticker);
    addReceivedSticker(toUser, sticker, Boolean(progressFor(toUser, sticker)?.owned));
  });

  (trade.receive || []).forEach(sticker => {
    decrementDuplicate(toUser, sticker);
    addReceivedSticker(fromUser, sticker, Boolean(progressFor(fromUser, sticker)?.owned));
  });

  if (operations.length) {
    const result = await db.collection(COLLECTIONS.userStickers).bulkWrite(
      operations,
      { ordered: true, session }
    );
    if (result.modifiedCount !== operations.length) {
      throw new HttpError(409, "A troca ja nao pode ser aplicada. Atualiza as cadernetas e tenta outra proposta.");
    }
  }
}

async function refreshAcceptedTradeArtifacts(db, trade, fromUser, toUser, now) {
  const updatedAt = now.toISOString();
  try {
    const [fromStickers, toStickers] = await Promise.all([
      getUserStickerState(db, fromUser),
      getUserStickerState(db, toUser)
    ]);
    await Promise.all([
      saveSnapshot(db, fromUser, fromStickers, updatedAt),
      saveSnapshot(db, toUser, toStickers, updatedAt)
    ]);
  } catch (error) {
    console.warn("Nao foi possivel atualizar os snapshots da troca.", error?.message || error);
  }

  try {
    await insertHistoryLogs(db, [
      {
        userId: fromUser.id,
        username: fromUser.username,
        type: "trade",
        action: "trade_accepted",
        text: "Troca aceite com " + toUser.username,
        given: trade.give || [],
        received: trade.receive || [],
        partner: toUser.username,
        tradeId: trade._id,
        createdAt: now
      },
      {
        userId: toUser.id,
        username: toUser.username,
        type: "trade",
        action: "trade_accepted",
        text: "Troca aceite com " + fromUser.username,
        given: trade.receive || [],
        received: trade.give || [],
        partner: fromUser.username,
        tradeId: trade._id,
        createdAt: now
      }
    ]);
  } catch (error) {
    console.warn("Nao foi possivel gravar historico da troca.", error?.message || error);
  }
}

async function createTradeProposal(db, user, payload) {
  const targetUsername = cleanUsername(payload.toUser || payload.friend || payload.profile);
  const targetUser = await findVerifiedUser(db, targetUsername);
  if (!targetUser) throw new HttpError(404, "User nao encontrado.");
  if (targetUser.id === user.id) throw new HttpError(400, "Nao podes propor uma troca a ti proprio.");

  const giveIds = cleanStickerIdList(payload.giveStickerIds || payload.giveIds || payload.give);
  const receiveIds = cleanStickerIdList(payload.receiveStickerIds || payload.receiveIds || payload.receive);
  if (!giveIds.length || !receiveIds.length) throw new HttpError(400, "Escolhe pelo menos um cromo para dar e um para receber.");
  if (giveIds.length !== receiveIds.length) throw new HttpError(400, "A troca tem de ter o mesmo numero de cromos dos dois lados.");
  if (giveIds.length > MAX_TRADE_STICKERS_PER_SIDE) throw new HttpError(400, `A troca pode ter no maximo ${MAX_TRADE_STICKERS_PER_SIDE} cromos de cada lado.`);

  const [myStickers, friendStickers] = await Promise.all([
    getUserStickerState(db, user),
    getUserStickerState(db, targetUser)
  ]);
  const mineById = new Map(myStickers.map(sticker => [sticker.id, sticker]));
  const friendById = new Map(friendStickers.map(sticker => [sticker.id, sticker]));

  const give = giveIds.map(id => {
    const mine = mineById.get(id);
    const friend = friendById.get(id);
    if (!mine || !friend) throw new HttpError(400, "Um dos cromos para dar nao existe.");
    if (!mine.tenho || availableDuplicates(mine) <= 0) {
      throw new HttpError(400, `${tradeStickerLabel(mine)} nao esta nos teus repetidos.`);
    }
    return publicTradeSticker(mine);
  });

  const receive = receiveIds.map(id => {
    const mine = mineById.get(id);
    const friend = friendById.get(id);
    if (!mine || !friend) throw new HttpError(400, "Um dos cromos para receber nao existe.");
    if (mine.tenho) {
      throw new HttpError(400, `Tu ja tens ${tradeStickerLabel(mine)}.`);
    }
    if (!friend.tenho || availableDuplicates(friend) <= 0) {
      throw new HttpError(400, `${targetUser.username} nao tem ${tradeStickerLabel(friend)} repetido.`);
    }
    return publicTradeSticker(friend);
  });

  const now = new Date();
  const trade = {
    _id: crypto.randomBytes(12).toString("hex"),
    fromUserId: user.id,
    fromUser: user.username,
    toUserId: targetUser.id,
    toUser: targetUser.username,
    give,
    receive,
    message: String(payload.message || "").trim().slice(0, 300),
    status: "pending",
    createdAt: now,
    updatedAt: now
  };

  await db.collection(COLLECTIONS.trades).insertOne(trade);
  return trade;
}

async function updateTradeProposalStatus(db, user, payload) {
  const tradeId = String(payload.tradeId || payload.id || "").trim();
  const status = String(payload.status || "").trim().toLowerCase();
  if (!tradeId) throw new HttpError(400, "Falta o id da troca.");
  if (!["accepted", "rejected", "cancelled"].includes(status)) throw new HttpError(400, "Estado de troca invalido.");

  const trade = await db.collection(COLLECTIONS.trades).findOne({ _id: tradeId });
  if (!trade) throw new HttpError(404, "Troca nao encontrada.");
  if (trade.status !== "pending") throw new HttpError(400, "Esta troca ja foi respondida.");

  const isSender = trade.fromUserId === user.id;
  const isReceiver = trade.toUserId === user.id;
  if (status === "cancelled" && !isSender) throw new HttpError(403, "So quem criou a proposta pode cancelar.");
  if ((status === "accepted" || status === "rejected") && !isReceiver) throw new HttpError(403, "So quem recebeu a proposta pode responder.");

  if (status === "accepted") {
    const fromUser = await findUserById(db, trade.fromUserId);
    const toUser = await findUserById(db, trade.toUserId);
    if (!fromUser || !toUser) throw new HttpError(404, "Um dos users desta troca ja nao existe.");
    if (!mongoClient) throw new HttpError(503, "A ligacao a MongoDB ainda nao esta pronta.");

    const session = mongoClient.startSession();
    let acceptedTrade = null;
    const acceptedAt = new Date();

    try {
      await session.withTransaction(async () => {
        const currentTrade = await db.collection(COLLECTIONS.trades).findOne(
          { _id: tradeId, status: "pending" },
          { session }
        );
        if (!currentTrade) throw new HttpError(409, "Esta troca ja foi respondida.");

        await applyAcceptedTrade(db, currentTrade, fromUser, toUser, session);
        acceptedTrade = await db.collection(COLLECTIONS.trades).findOneAndUpdate(
          { _id: tradeId, status: "pending" },
          {
            $set: {
              status: "accepted",
              updatedAt: acceptedAt,
              respondedBy: user.username,
              acceptedAt
            }
          },
          { session, returnDocument: "after" }
        );
        if (!acceptedTrade) throw new HttpError(409, "Esta troca ja foi respondida.");
      }, {
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" }
      });
    } finally {
      await session.endSession();
    }

    await refreshAcceptedTradeArtifacts(db, acceptedTrade || trade, fromUser, toUser, acceptedAt);
    return acceptedTrade;
  }

  const updatedAt = new Date();
  const updatedTrade = await db.collection(COLLECTIONS.trades).findOneAndUpdate(
    { _id: tradeId, status: "pending" },
    {
      $set: {
        status,
        updatedAt,
        respondedBy: user.username,
        ...(status === "rejected" ? { rejectedAt: updatedAt } : {}),
        ...(status === "cancelled" ? { cancelledAt: updatedAt } : {})
      }
    },
    { returnDocument: "after" }
  );
  if (!updatedTrade) throw new HttpError(409, "Esta troca ja foi respondida.");

  return updatedTrade;
}

async function handleAuthRoute(req, res, url) {
  if (url.pathname === "/api/auth/status") {
    if (req.method !== "GET" && req.method !== "HEAD") return methodNotAllowed(res, ["GET"]);
    const user = await getAuthUser(req, res);
    return sendJson(res, 200, {
      enabled: Boolean(MONGODB_URI),
      registrationEnabled: Boolean(REGISTER_PIN),
      loggedIn: Boolean(user),
      user
    });
  }

  if (url.pathname === "/api/auth/invite") {
    if (req.method !== "GET" && req.method !== "HEAD") return methodNotAllowed(res, ["GET"]);
    const inviteToken = String(
      url.searchParams.get("convite") ||
      url.searchParams.get("invite") ||
      url.searchParams.get("pin") ||
      ""
    ).trim();

    return sendJson(res, 200, {
      enabled: Boolean(MONGODB_URI),
      registrationEnabled: Boolean(REGISTER_PIN),
      valid: Boolean(REGISTER_PIN && inviteToken === REGISTER_PIN),
      role: REGISTER_PIN && inviteToken === REGISTER_PIN ? "verificado" : null
    });
  }

  if (!url.pathname.startsWith("/api/auth/")) return false;
  if (!MONGODB_URI) return sendJson(res, 503, { error: "Login online nao configurado" });

  if (url.pathname === "/api/auth/settings") {
    const user = await requireVerifiedUser(req, res);
    if (!user) return;

    const db = await openMongoDbForRequest(res);
    if (!db) return;

    if (req.method === "GET" || req.method === "HEAD") {
      const account = await findUserAccount(
        db,
        user.username,
        { projection: { username: 1, usernameLower: 1, role: 1, verified: 1, userColor: 1, themeColor: 1, profilePhoto: 1 } }
      );
      const usedColors = await usedUserColors(db, user.id);
      const userColor = cleanUserColor(account?.userColor || account?.themeColor);

      return sendJson(res, 200, {
        ok: true,
        settings: {
          userColor,
          profilePhoto: cleanProfilePhoto(account?.profilePhoto),
          colorPalette: USER_COLOR_PALETTE,
          usedColors
        },
        user: publicUser(account || user)
      });
    }

    if (req.method === "POST") {
      const payload = await readJson(req);
      const rawUserColor = normalizeColor(payload.userColor || payload.themeColor);
      const hasProfilePhoto = Object.prototype.hasOwnProperty.call(payload, "profilePhoto");
      const profilePhoto = hasProfilePhoto ? cleanProfilePhoto(payload.profilePhoto) : undefined;

      if (!validateUserColor(rawUserColor)) {
        return sendJson(res, 400, { error: "Escolhe uma cor da paleta." });
      }

      const userColor = cleanUserColor(rawUserColor);

      if (userColor !== DEFAULT_USER_COLOR) {
        const alreadyUsed = await db.collection(COLLECTIONS.users).findOne({
          _id: { $ne: user.id },
          $or: [
            { userColor },
            { userColor: { $exists: false }, themeColor: userColor }
          ]
        }, { projection: { username: 1 } });

        if (alreadyUsed) {
          return sendJson(res, 409, { error: "Essa cor ja esta a ser usada por outro user." });
        }
      }

      await db.collection(COLLECTIONS.users).updateOne(
        { _id: user.id },
        {
          $set: {
            userColor,
            ...(hasProfilePhoto ? { profilePhoto } : {}),
            settingsUpdatedAt: new Date()
          },
          $unset: { themeColor: "" }
        }
      );

      const savedPhotoAccount = hasProfilePhoto ? null : await findUserAccount(db, user.username, { projection: { profilePhoto: 1 } });
      const savedProfilePhoto = hasProfilePhoto ? profilePhoto : cleanProfilePhoto(savedPhotoAccount?.profilePhoto);
      const usedColors = await usedUserColors(db, user.id);
      return sendJson(res, 200, {
        ok: true,
        settings: {
          userColor,
          profilePhoto: savedProfilePhoto,
          colorPalette: USER_COLOR_PALETTE,
          usedColors
        }
      });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  }

  if (url.pathname === "/api/auth/change-password" && req.method === "POST") {
    const payload = await readJson(req);
    const db = await openMongoDbForRequest(res);
    if (!db) return;

    const sessionUser = await getAuthUser(req, res);
    const username = sessionUser?.username || cleanUsername(payload.username);
    const currentPassword = String(payload.currentPassword || payload.password || "");
    const newPassword = String(payload.newPassword || "");

    if (!username || !currentPassword || !newPassword) {
      return sendJson(res, 400, { error: "Preenche o user, password atual e nova password." });
    }
    if (!authRequestAllowed(req, res, "change-password", username)) return;

    if (!validatePassword(newPassword)) {
      return sendJson(res, 400, { error: "A nova password deve ter entre 8 e 72 caracteres." });
    }

    let user = await findUserAccount(db, username);
    user = await normalizeUserAccount(db, user);

    if (!user || user.role !== "verificado" || user.verified !== true || !passwordMatches(currentPassword, user.salt, user.passwordHash)) {
      recordAuthFailure(req, "change-password", username);
      return sendJson(res, 401, { error: "User ou password atual errados." });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    await db.collection(COLLECTIONS.users).updateOne(
      { _id: user._id },
      {
        $set: {
          salt,
          passwordHash: hashPassword(newPassword, salt),
          passwordChangedAt: new Date()
        }
      }
    );

    clearAuthFailures(req, "change-password", username);
    return sendJson(res, 200, { ok: true });
  }

  if (url.pathname === "/api/auth/change-password") return methodNotAllowed(res, ["POST"]);

  if (url.pathname === "/api/auth/register" && req.method === "POST") {
    const payload = await readJson(req);
    const username = cleanUsername(payload.username);
    const usernameLower = userKey(username);
    const password = String(payload.password || "");
    const inviteToken = String(payload.inviteToken || payload.registerPin || payload.pin || "").trim();
    if (!authRequestAllowed(req, res, "register", username)) return;

    if (!REGISTER_PIN) {
      return sendJson(res, 503, { error: "Registo fechado. Define REGISTER_PIN no Render." });
    }

    if (inviteToken !== REGISTER_PIN) {
      recordAuthFailure(req, "register", username);
      return sendJson(res, 403, { error: "PIN de registo errado." });
    }

    if (!validateUsername(username)) {
      return sendJson(res, 400, { error: "O utilizador deve ter 3 a 24 letras, numeros, _ ou -." });
    }

    if (!validatePassword(password)) {
      return sendJson(res, 400, { error: "A password deve ter entre 8 e 72 caracteres." });
    }

    const db = await openMongoDbForRequest(res);
    if (!db) return;

    const salt = crypto.randomBytes(16).toString("hex");
    const now = new Date();
    const user = {
      _id: usernameLower,
      username,
      usernameLower,
      salt,
      passwordHash: hashPassword(password, salt),
      role: "verificado",
      verified: true,
      userColor: DEFAULT_USER_COLOR,
      verifiedAt: now,
      verifiedByInvite: true,
      createdAt: now
    };

    try {
      await db.collection(COLLECTIONS.users).insertOne(user);
    } catch (error) {
      if (error && error.code === 11000) {
        return sendJson(res, 409, { error: "Esse utilizador ja existe." });
      }
      throw error;
    }

    const token = await createSession(db, user);
    clearAuthFailures(req, "register", username);

    return sendJson(res, 200, {
      ok: true,
      user: publicUser(user)
    }, { "Set-Cookie": sessionCookie(token) });
  }

  if (url.pathname === "/api/auth/register") return methodNotAllowed(res, ["POST"]);

  if (url.pathname === "/api/auth/login" && req.method === "POST") {
    const payload = await readJson(req);
    const username = cleanUsername(payload.username);
    const password = String(payload.password || "");
    if (!authRequestAllowed(req, res, "login", username)) return;
    const db = await openMongoDbForRequest(res);
    if (!db) return;

    let user = await findUserAccount(db, username);
    user = await normalizeUserAccount(db, user);

    if (!user || !passwordMatches(password, user.salt, user.passwordHash)) {
      recordAuthFailure(req, "login", username);
      return sendJson(res, 401, { error: "Utilizador ou password errados." });
    }

    if (user.role !== "verificado" || user.verified !== true) {
      recordAuthFailure(req, "login", username);
      return sendJson(res, 403, { error: "Esta conta ainda nao esta verificada." });
    }

    const token = await createSession(db, user);
    clearAuthFailures(req, "login", username);
    return sendJson(res, 200, {
      ok: true,
      user: publicUser(user)
    }, { "Set-Cookie": sessionCookie(token) });
  }

  if (url.pathname === "/api/auth/login") return methodNotAllowed(res, ["POST"]);

  if (url.pathname === "/api/auth/logout" && req.method === "POST") {
    const db = await openMongoDbForRequest(res);
    if (!db) return;
    const token = parseCookies(req)[COOKIE_NAME];
    if (token) await db.collection(COLLECTIONS.sessions).deleteOne({ _id: tokenHash(token) });
    return sendJson(res, 200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
  }

  if (url.pathname === "/api/auth/logout") return methodNotAllowed(res, ["POST"]);

  return false;
}


function backupFileName(username) {
  const safeName = cleanUsername(username) || "user";
  return `caderneta-mundial-2026-backup-${safeName}-${new Date().toISOString().slice(0, 10)}.json`;
}

async function createUserBackup(db, user) {
  const [stickers, history, trades] = await Promise.all([
    getUserStickerState(db, user),
    db.collection(COLLECTIONS.history).find({ userId: user.id }).sort({ createdAt: -1 }).limit(1000).toArray(),
    db.collection(COLLECTIONS.trades).find({ $or: [{ fromUserId: user.id }, { toUserId: user.id }] }).sort({ updatedAt: -1, createdAt: -1 }).limit(500).toArray()
  ]);

  return {
    app: "Caderneta Mundial 2026",
    version: 1,
    exportedAt: new Date().toISOString(),
    user: publicUser(user),
    counts: countStickerState(stickers),
    stickers: stickers.map(sticker => ({
      id: sticker.id,
      pais: sticker.pais,
      codigo: sticker.codigo,
      nome: sticker.nome,
      tenho: Boolean(sticker.tenho),
      repetidos: Number(sticker.repetidos || 0),
      reservados: reservedDuplicates(sticker),
      reservas: normalizeReservations(sticker.reservas ?? sticker.reservations),
      disponiveis: availableDuplicates(sticker)
    })),
    csv: stickersToCSV(stickers),
    history: history.map(publicHistoryLog),
    trades: trades.map(trade => publicTrade(trade, user))
  };
}
async function handleLiveRoute(req, res, url) {
  if (url.pathname === "/api/live/status") {
    if (req.method !== "GET" && req.method !== "HEAD") return methodNotAllowed(res, ["GET"]);
    const user = await getAuthUser(req, res);
    return sendJson(res, 200, {
      enabled: Boolean(MONGODB_URI),
      registrationEnabled: Boolean(REGISTER_PIN),
      loggedIn: Boolean(user),
      user
    });
  }

  if (!url.pathname.startsWith("/api/live/")) return false;
  if (!MONGODB_URI) return sendJson(res, 503, { error: "Modo online nao configurado" });

  const user = await requireVerifiedUser(req, res);
  if (!user) return;

  const db = await openMongoDbForRequest(res);
  if (!db) return;

  if (url.pathname === "/api/live/backup") {
    if (req.method !== "GET" && req.method !== "HEAD") return methodNotAllowed(res, ["GET"]);
    const backup = await createUserBackup(db, user);
    return sendJson(res, 200, backup, {
      "Content-Disposition": `attachment; filename="${backupFileName(user.username)}"`
    });
  }

  if (url.pathname === "/api/live/profiles") {
    if (req.method !== "GET" && req.method !== "HEAD") return methodNotAllowed(res, ["GET"]);
    const users = await db.collection(COLLECTIONS.users)
      .find(
        { role: "verificado", verified: true },
        { projection: { _id: 1, id: 1, username: 1, userColor: 1, themeColor: 1, profilePhoto: 1 } }
      )
      .sort({ usernameLower: 1 })
      .limit(100)
      .toArray();

    const snapshotIds = users.map(item => item._id || item.id).filter(Boolean);
    const snapshots = snapshotIds.length
      ? await db.collection(COLLECTIONS.snapshots)
          .find({ _id: { $in: snapshotIds } }, { projection: { _id: 1, counts: 1, updatedAt: 1 } })
          .toArray()
      : [];
    const snapshotsById = new Map(snapshots.map(snapshot => [String(snapshot._id), snapshot]));

    return sendJson(res, 200, {
      profiles: users.map(item => {
        const snapshot = snapshotsById.get(String(item._id || item.id)) || {};
        return {
          profile: item.username || item.profile,
          userColor: cleanUserColor(item.userColor || item.themeColor),
          profilePhoto: cleanProfilePhoto(item.profilePhoto),
          counts: snapshot.counts || null,
          updatedAt: snapshot.updatedAt || ""
        };
      })
    });
  }

  if (url.pathname === "/api/live/trades") {
    if (req.method === "GET") {
      const docs = await db.collection(COLLECTIONS.trades)
        .find({
          $or: [
            { fromUserId: user.id },
            { toUserId: user.id }
          ]
        })
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(100)
        .toArray();

      return sendJson(res, 200, { trades: docs.map(doc => publicTrade(doc, user)) });
    }

    if (req.method === "POST") {
      const payload = await readJson(req);
      const trade = await createTradeProposal(db, user, payload);
      return sendJson(res, 201, { ok: true, trade: publicTrade(trade, user) });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  }

  if (url.pathname === "/api/live/trades/status") {
    if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
    const payload = await readJson(req);
    const trade = await updateTradeProposalStatus(db, user, payload);
    return sendJson(res, 200, { ok: true, trade: publicTrade(trade, user) });
  }

  if (url.pathname === "/api/live/history") {
    if (req.method === "GET") {
      const docs = await db.collection(COLLECTIONS.history)
        .find({ userId: user.id })
        .sort({ createdAt: -1 })
        .limit(250)
        .toArray();
      return sendJson(res, 200, { history: docs.map(publicHistoryLog) });
    }

    if (req.method === "POST") {
      const payload = await readJson(req);
      const log = await createHistoryLog(db, user, payload);
      return sendJson(res, 201, { ok: true, log: publicHistoryLog(log) });
    }

    return methodNotAllowed(res, ["GET", "POST"]);
  }

  if (url.pathname === "/api/live/state") {
    if (req.method === "GET") {
      const requestedProfile = cleanUsername(url.searchParams.get("profile")) || user.username;
      const profileUser = await findVerifiedUser(db, requestedProfile);

      if (!profileUser) {
        return sendJson(res, 200, {
          enabled: true,
          exists: false,
          profile: requestedProfile,
          userColor: DEFAULT_USER_COLOR,
          profilePhoto: "",
          csv: "",
          updatedAt: ""
        });
      }

      let snapshot = await db.collection(COLLECTIONS.snapshots).findOne({ _id: profileUser.id });
      if (snapshot?.csv && snapshot.schemaVersion === SNAPSHOT_SCHEMA_VERSION) {
        return sendJson(res, 200, {
          enabled: true,
          exists: true,
          profile: profileUser.username,
          userColor: profileUser.userColor || DEFAULT_USER_COLOR,
          profilePhoto: profileUser.profilePhoto || "",
          csv: snapshot.csv,
          counts: snapshot.counts || null,
          updatedAt: snapshot.updatedAt || ""
        });
      }

      const stickers = await getUserStickerState(db, profileUser);
      await saveSnapshot(db, profileUser, stickers);
      snapshot = await db.collection(COLLECTIONS.snapshots).findOne({ _id: profileUser.id });

      return sendJson(res, 200, {
        enabled: true,
        exists: true,
        profile: profileUser.username,
        userColor: profileUser.userColor || DEFAULT_USER_COLOR,
        profilePhoto: profileUser.profilePhoto || "",
        csv: stickersToCSV(stickers),
        counts: countStickerState(stickers),
        updatedAt: snapshot?.updatedAt || ""
      });
    }

    if (req.method === "POST") {
      const payload = await readJson(req);
      const csv = String(payload.csv || "");

      if (!csv.trim()) return sendJson(res, 400, { error: "Caderneta vazia" });
      if (csv.length > 5_000_000) return sendJson(res, 413, { error: "Pedido demasiado grande" });

      const result = await updateUserStickerRowsFromCsv(db, user, csv);

      return sendJson(res, 200, {
        ok: true,
        profile: user.username,
        counts: countStickerState(result.stickers),
        updatedAt: result.updatedAt
      });
    }
  }

  if (url.pathname === "/api/live/state") return methodNotAllowed(res, ["GET", "POST"]);

  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/api/health" || url.pathname === "/healthz") {
      if (req.method !== "GET" && req.method !== "HEAD") return methodNotAllowed(res, ["GET"]);
      const config = onlineConfigStatus();
      return sendJson(res, 200, {
        ok: true,
        service: "caderneta-mundial-2026",
        appVersion: APP_BUILD_ID,
        onlineConfigured: config.ok,
        onlineRequired: config.onlineRequired,
        missingConfig: config.missing,
        databaseName: config.databaseName,
        registrationConfigured: config.registrationConfigured,
        uptimeSeconds: Math.round(process.uptime())
      });
    }

    if (url.pathname === "/api/ready" || url.pathname === "/readyz") {
      if (req.method !== "GET" && req.method !== "HEAD") return methodNotAllowed(res, ["GET"]);
      const config = onlineConfigStatus();
      if (!config.ok) {
        return sendJson(res, 503, {
          ok: false,
          onlineReady: false,
          missingConfig: config.missing,
          databaseName: config.databaseName
        });
      }

      try {
        const db = await getMongoDb();
        await db.command({ ping: 1 });
        return sendJson(res, 200, {
          ok: true,
          onlineReady: true,
          mongoConnected: true,
          databaseName: config.databaseName,
          uptimeSeconds: Math.round(process.uptime())
        });
      } catch (error) {
        console.error("MongoDB readiness falhou:", error);
        return sendJson(res, 503, {
          ok: false,
          onlineReady: false,
          mongoConnected: false,
          databaseName: config.databaseName,
          error: "Nao foi possivel ligar a MongoDB."
        });
      }
    }

    const authHandled = await handleAuthRoute(req, res, url);
    if (authHandled !== false) return;

    const liveHandled = await handleLiveRoute(req, res, url);
    if (liveHandled !== false) return;

    if (url.pathname === "/manifest.webmanifest") {
      const body = fs.existsSync(MANIFEST_FILE) ? fs.readFileSync(MANIFEST_FILE, "utf8") : "{}";
      return send(res, 200, body, "application/manifest+json; charset=utf-8", { "Cache-Control": "public, max-age=3600" });
    }

    if (url.pathname === "/sw.js") {
      const body = serviceWorkerBody();
      return send(res, 200, body, "application/javascript; charset=utf-8", { "Cache-Control": "no-cache, no-store, must-revalidate" });
    }

    if (["/app-icon.png", "/app-icon-192.png", "/app-icon-512.png"].includes(url.pathname)) {
      const iconFile = url.pathname === "/app-icon-192.png" ? APP_ICON_192_FILE : url.pathname === "/app-icon-512.png" ? APP_ICON_512_FILE : APP_ICON_FILE;
      const body = fs.existsSync(iconFile) ? fs.readFileSync(iconFile) : Buffer.alloc(0);
      return send(res, 200, body, "image/png", { "Cache-Control": "public, max-age=86400" });
    }

    if (url.pathname === "/icon.svg") {
      const body = fs.existsSync(ICON_FILE) ? fs.readFileSync(ICON_FILE, "utf8") : "";
      return send(res, 200, body, "image/svg+xml; charset=utf-8", { "Cache-Control": "public, max-age=86400" });
    }

    if (url.pathname === "/" || url.pathname === "/caderneta_mundial_2026.html") {
      return send(res, 200, fs.readFileSync(HTML_FILE, "utf8"), "text/html; charset=utf-8");
    }

    if (url.pathname === "/api/base-cromos") {
      const user = await requireVerifiedUser(req, res);
      if (!user) return;

      if (req.method === "GET") {
        const db = await openMongoDbForRequest(res);
        if (!db) return;
        const stickers = await getAlbumStickers(db);
        return send(res, 200, stickersToCSV(stickers), "text/plain; charset=utf-8");
      }

      return methodNotAllowed(res, ["GET"]);
    }

    if (url.pathname.startsWith("/api/")) {
      return sendJson(res, 404, { error: "Nao encontrado" });
    }

    return send(res, 404, "ESTA APP NAO FOI CRIADA PARA SI");
  } catch (error) {
    const wantsJson = req.url && req.url.startsWith("/api/");
    if (error && error.statusCode) {
      if (wantsJson) return sendJson(res, error.statusCode, { error: error.message });
      return send(res, error.statusCode, error.message);
    }

    console.error(error);
    if (wantsJson) return sendJson(res, 500, { error: "Erro interno" });
    return send(res, 500, "Erro interno");
  }
});

assertOnlineConfig();

server.listen(PORT, () => {
  console.log(`Caderneta Mundial 2026 online na porta ${PORT}`);
  console.log(`Base de dados MongoDB: ${MONGODB_DB}`);
});

async function closeMongoClient() {
  if (!mongoClient) return;
  const client = mongoClient;
  mongoClient = null;
  mongoDbPromise = null;
  await client.close().catch(() => {});
}

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`A terminar servidor (${signal})...`);

  server.close(async () => {
    await closeMongoClient();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));


