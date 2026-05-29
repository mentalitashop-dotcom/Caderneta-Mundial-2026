const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = Number(process.env.PORT || 1312);
const ROOT = __dirname;
const HTML_FILE = path.join(ROOT, "caderneta_mundial_2026.html");
const CROMOS_FILE = path.join(ROOT, "cromos.txt");
const BASE_FILE = path.join(ROOT, "cromos_base.txt");
const BACKUP_FILE = path.join(ROOT, "backup_cromos.txt");
let shutdownTimer = null;

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

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

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
    return send(res, 500, "Erro interno");
  }
});

server.listen(PORT, () => {
  ensureCromosFile();
  console.log(`Caderneta pronta em http://localhost:${PORT}`);
});
