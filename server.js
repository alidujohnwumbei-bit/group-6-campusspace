// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var port = process.env.PORT && process.env.PORT !== "8080" ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
var startServer = (targetPort) => {
  const server = app.listen(targetPort, "0.0.0.0", () => {
    console.log(`CampusSpace server running on http://0.0.0.0:${targetPort}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && targetPort !== 3e3) {
      console.warn(`Port ${targetPort} in use, attempting port 3000...`);
      startServer(3e3);
    } else {
      console.error("Server startup error:", err);
    }
  });
};
startServer(port);
