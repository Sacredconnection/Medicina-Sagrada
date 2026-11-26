// CommonJS entry point for cPanel / CloudLinux Passenger.
// Build first with NODE_ENV=production and the staging environment variables.
process.env.NODE_ENV = "production";

async function start() {
  const { createServer } = await import("node:http");
  const { default: next } = await import("next");
  const app = next({ dev: false, dir: __dirname });
  const handle = app.getRequestHandler();

  await app.prepare();
  const server = createServer((req, res) => {
    handle(req, res).catch((error) => {
      console.error("Request failed:", error);
      if (!res.headersSent) res.writeHead(500);
      res.end("Internal server error");
    });
  });
  server.on("error", (error) => {
    console.error("Server failed:", error);
    process.exit(1);
  });
  // Passenger intercepts listen() and manages the public connection.
  server.listen(Number(process.env.PORT) || 3000);
}

start().catch((error) => {
  console.error("Application startup failed:", error);
  process.exit(1);
});
