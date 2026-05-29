const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = Number(process.env.PORT || 1312);
const ROOT = __dirname;
const HTML_FILE = path.join(ROOT, "caderneta_mundial_2026.html");
const CROMOS_FILE = path.join(ROOT, "cromos.txt");
const BASE_FILE = path.join(ROOT, "cromos_base.txt");
const BACKUP_FILE = path.join(ROOT, "backup_cromos.txt");
const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "caderneta";
const IS_HOSTED = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID || MONGODB_URI);

let shutdownTimer = null;
let liveCollectionPromise = null;

const emptyAlbum = [
  "pais,codigo,nome,tenho"
];

function ensureCromosFile() {
  if (!fs.existsSync(CROMOS_FILE)) {
    const initialData = fs.existsSync(BASE_FILE)
      ? fs.readFileSync(BASE_FILE, "utf8")
      : emptyAlbum.join("\n") + "\n";
    fs.writeFileSync(CROMOS_FILE, initialData.endsWith("\n") ? initialData : `${initialData}\n`, "utf8");
  }
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

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload), "application/json; charset=utf-8");
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

function cleanProfileName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 40);
}

function profileKey(value) {
  const key = cleanProfileName(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return key || "colecao";
}

async function getLiveCollection() {
  if (!MONGODB_URI) return null;

  if (!liveCollectionPromise) {
    liveCollectionPromise = (async () => {
      let MongoClient;
      try {
        ({ MongoClient } = require("mongodb"));
      } catch {
        throw new Error("A dependencia mongodb nao esta instalada. Corre npm install.");
      }

      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const collection = client.db(MONGODB_DB).collection("colecoes");
      await collection.createIndex({ updatedAt: -1 });
      return collection;
    })();
  }

  return liveCollectionPromise;
}

async function handleLiveRoute(req, res, url) {
  if (url.pathname === "/api/live/status") {
    return sendJson(res, 200, { enabled: Boolean(MONGODB_URI) });
  }

  if (url.pathname === "/api/live/profiles") {
    if (!MONGODB_URI) return sendJson(res, 200, { profiles: [] });
    const collection = await getLiveCollection();
    const profiles = await collection
      .find({}, { projection: { _id: 0, profile: 1, updatedAt: 1 } })
      .sort({ profile: 1 })
      .limit(100)
      .toArray();
    return sendJson(res, 200, { profiles });
  }

  if (url.pathname === "/api/live/state") {
    if (!MONGODB_URI) return sendJson(res, 503, { error: "Modo live nao configurado" });
    const collection = await getLiveCollection();

    if (req.method === "GET") {
      const profile = cleanProfileName(url.searchParams.get("profile"));
      if (!profile) return sendJson(res, 400, { error: "Perfil em falta" });

      const doc = await collection.findOne(
        { _id: profileKey(profile) },
        { projection: { _id: 0, profile: 1, csv: 1, updatedAt: 1 } }
      );

      return sendJson(res, 200, {
        enabled: true,
        exists: Boolean(doc),
        profile,
        csv: doc?.csv || "",
        updatedAt: doc?.updatedAt || ""
      });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const profile = cleanProfileName(payload.profile);
      const csv = String(payload.csv || "");

      if (!profile) return sendJson(res, 400, { error: "Perfil em falta" });
      if (!csv.trim()) return sendJson(res, 400, { error: "Caderneta vazia" });
      if (csv.length > 5_000_000) return sendJson(res, 413, { error: "Pedido demasiado grande" });

      const updatedAt = new Date().toISOString();
      await collection.updateOne(
        { _id: profileKey(profile) },
        { $set: { profile, csv, updatedAt } },
        { upsert: true }
      );

      return sendJson(res, 200, { ok: true, profile, updatedAt });
    }
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

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

    if (url.pathname === "/cromos.txt" || url.pathname === "/api/cromos") {
      if (req.method === "GET") {
        cancelShutdown();
        ensureCromosFile();
        return send(res, 200, fs.readFileSync(CROMOS_FILE, "utf8"), "text/plain; charset=utf-8");
      }

      if (req.method === "POST") {
        cancelShutdown();
        const body = await readBody(req);
        if (fs.existsSync(CROMOS_FILE)) {
          fs.copyFileSync(CROMOS_FILE, BACKUP_FILE);
        }
        fs.writeFileSync(CROMOS_FILE, body.endsWith("\n") ? body : `${body}\n`, "utf8");
        return send(res, 200, "ok");
      }
    }

    return send(res, 404, "Nao encontrado");
  } catch (error) {
    console.error(error);
    const wantsJson = req.url && req.url.startsWith("/api/live/");
    if (wantsJson) return sendJson(res, 500, { error: "Erro interno" });
    return send(res, 500, "Erro interno");
  }
});

server.listen(PORT, () => {
  ensureCromosFile();
  console.log(`Caderneta pronta em http://localhost:${PORT}`);
});