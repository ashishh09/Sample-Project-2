// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var port = parseInt(process.env.PORT || "3000", 10);
var host = "0.0.0.0";
app.use(express.json());
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "healthy", app: "Restaurant Management System" });
});
var distPath = path.resolve(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Application bundle not found. Please run npm run build.");
    }
  });
} else {
  app.get("*", (_req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>RMS Server</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Restaurant Management System</h2>
          <p>Application is initializing. If dist is missing, build the client using <code>npm run build</code>.</p>
        </body>
      </html>
    `);
  });
}
var server = app.listen(port, host, () => {
  console.log(`[RMS Server] Production server running at http://${host}:${port}`);
});
var handleShutdown = (signal) => {
  console.log(`[RMS Server] Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log("[RMS Server] Closed out remaining connections.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("[RMS Server] Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 1e4);
};
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
var server_default = app;
export {
  server_default as default
};
