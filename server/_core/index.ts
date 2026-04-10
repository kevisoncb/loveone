import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../api/root"; // Updated import path
import { createContext } from "./context";
import { handleStripeWebhook } from "./stripeWebhook";
import adminRoutes from "./adminRoutes";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Helper to check if a port is available
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

// Helper to find an available port
async function findAvailablePort(startPort: number = 3001): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes
  app.use(cors());

  // API Routes
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use("/api/admin", adminRoutes);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // --- Static File Serving for Production ---
  if (process.env.NODE_ENV === "production") {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const publicDir = path.resolve(__dirname, "../../dist/public");

    // Serve all static files from the dist/public directory
    app.use(express.static(publicDir));

    // For any other request that doesn't match an API route or a static file,
    // serve the index.html. This is for client-side routing.
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(publicDir, "index.html"));
    });
  }

  const preferredPort = parseInt(process.env.PORT || "3001");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    if (process.env.NODE_ENV !== "production") {
      console.log(`tRPC API available at http://localhost:${port}/api/trpc`);
    }
  });
}

startServer().catch(console.error);
