const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 8080);
const pocketbaseOrigin = process.env.PB_ORIGIN || "http://127.0.0.1:8090";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function proxyToPocketBase(req, res, url) {
  const target = new URL(url.pathname + url.search, pocketbaseOrigin);
  const proxyReq = http.request(target, {
    method: req.method,
    headers: {
      ...req.headers,
      host: target.host,
    },
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", () => {
    send(res, 502, "PocketBase API is not available");
  });

  req.pipe(proxyReq);
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      proxyToPocketBase(req, res, url);
      return;
    }

    const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const filePath = path.normalize(path.join(root, requested));

    if (!filePath.startsWith(root)) {
      send(res, 403, "Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        send(res, 404, "Not found");
        return;
      }

      send(res, 200, data, types[path.extname(filePath).toLowerCase()] || "application/octet-stream");
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Frontend running at http://127.0.0.1:${port}/index.html`);
  });
