const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

function loadEnv(filePath) {
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

function maskUri(uri) {
  return String(uri).replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
}

async function main() {
  loadEnv(path.join(__dirname, ".env"));

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "caderneta";

  if (!uri) {
    throw new Error("MONGODB_URI nao esta definido no .env");
  }

  console.log(`A testar MongoDB: ${maskUri(uri)}`);
  console.log(`Base alvo: ${dbName}`);

  const client = new MongoClient(uri, {
    appName: "caderneta-mundial-2026-test",
    serverSelectionTimeoutMS: 8000
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    await db.command({ ping: 1 });
    await db.collection("_connection_test").updateOne(
      { _id: "render-mongodb-test" },
      { $set: { ok: true, updatedAt: new Date() } },
      { upsert: true }
    );
    console.log("OK: ligacao e escrita na MongoDB funcionaram.");
  } finally {
    await client.close();
  }
}

main().catch(error => {
  console.error("ERRO:", error.message);
  process.exit(1);
});
