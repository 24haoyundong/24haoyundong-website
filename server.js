const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8080);
const PUBLIC_DIR = path.join(__dirname, "outputs");
const DATA_DIR = path.join(PUBLIC_DIR, "data");
const DATA_FILE = path.join(DATA_DIR, "site-data.json");
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, "admin-config.json");

function readAdminConfig() {
  const defaults = {
    user: process.env.ADMIN_USER || "admin",
    pass: process.env.ADMIN_PASS || "admin123456"
  };
  if (!fs.existsSync(ADMIN_CONFIG_FILE)) return defaults;
  try {
    const config = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, "utf8"));
    return {
      user: String(config.user || defaults.user),
      pass: String(config.pass || defaults.pass)
    };
  } catch (error) {
    return defaults;
  }
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, Object.assign({ "Cache-Control": "no-store" }, headers));
  res.end(body);
}

function isAdminPath(urlPath) {
  return urlPath === "/admin.html" || urlPath === "/admin.js" || urlPath === "/admin.css" || urlPath.startsWith("/api/");
}

function isAuthed(req) {
  const adminConfig = readAdminConfig();
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) return false;
  const raw = Buffer.from(header.slice(6), "base64").toString("utf8");
  return raw === `${adminConfig.user}:${adminConfig.pass}`;
}

function requireAuth(req, res) {
  if (isAuthed(req)) return true;
  send(res, 401, "需要登录管理后台", {
    "WWW-Authenticate": 'Basic realm="Admin"',
    "Content-Type": "text/plain; charset=utf-8"
  });
  return false;
}

function readBody(req, limit = 80 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function storeScript(dataJson) {
  return `
window.DEFAULT_SITE_DATA = ${dataJson};

window.siteDataStore = {
  key: "ecommerce-site-data-v1",
  clone(value) {
    return JSON.parse(JSON.stringify(value));
  },
  load() {
    return this.clone(window.DEFAULT_SITE_DATA);
  },
  save(data) {
    window.DEFAULT_SITE_DATA = this.clone(data);
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {}
    fetch("/api/site-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).catch(() => {
      alert("保存到服务器失败，请确认网站服务器正在运行。");
    });
  },
  reset() {
    localStorage.removeItem(this.key);
  }
};
`;
}

function serveSiteData(res) {
  if (fs.existsSync(DATA_FILE)) {
    const dataJson = fs.readFileSync(DATA_FILE, "utf8");
    send(res, 200, storeScript(dataJson), { "Content-Type": "application/javascript; charset=utf-8" });
    return;
  }
  const fallback = fs.readFileSync(path.join(PUBLIC_DIR, "site-data.js"));
  send(res, 200, fallback, { "Content-Type": "application/javascript; charset=utf-8" });
}

function serveStatic(urlPath, res) {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const relativePath = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const filePath = path.normalize(path.join(PUBLIC_DIR, relativePath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    send(res, 403, "Forbidden", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" || ext === ".js" || ext === ".css" ? "no-store" : "public, max-age=86400"
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const urlPath = url.pathname;

  if (isAdminPath(urlPath) && !requireAuth(req, res)) return;

  if (urlPath === "/api/site-data" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const data = JSON.parse(body);
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
      send(res, 200, JSON.stringify({ ok: true }), { "Content-Type": "application/json; charset=utf-8" });
    } catch (error) {
      send(res, 400, JSON.stringify({ ok: false }), { "Content-Type": "application/json; charset=utf-8" });
    }
    return;
  }

  if (urlPath === "/api/admin-config" && req.method === "POST") {
    try {
      const body = await readBody(req, 1024 * 1024);
      const config = JSON.parse(body);
      const user = String(config.user || "").trim();
      const pass = String(config.pass || "");
      if (!user || !pass || pass.length < 6) throw new Error("bad config");
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify({ user, pass }, null, 2), "utf8");
      send(res, 200, JSON.stringify({ ok: true }), { "Content-Type": "application/json; charset=utf-8" });
    } catch (error) {
      send(res, 400, JSON.stringify({ ok: false }), { "Content-Type": "application/json; charset=utf-8" });
    }
    return;
  }

  if (urlPath === "/site-data.js") {
    serveSiteData(res);
    return;
  }

  serveStatic(urlPath, res);
});

server.listen(PORT, "0.0.0.0", () => {
  const adminConfig = readAdminConfig();
  console.log(`网站已启动: http://127.0.0.1:${PORT}`);
  console.log(`管理后台: http://127.0.0.1:${PORT}/admin.html`);
  console.log(`后台账号: ${adminConfig.user}`);
});
