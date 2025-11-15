import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import chalk from "chalk";
import dotenv from "dotenv";
import http from "http";
import { validateJoinAccess } from "./auth";

dotenv.config();

const PORT = Number(process.env.PORT || 1234);
const HTTP_PORT = Number(process.env.HTTP_PORT || 1235);

// Track active connections per room
const roomConnections = new Map<string, Set<string>>();

/**
 * Each document's UUID acts as a WebSocket room name.
 * The backend validates docId + pin, and if valid, users
 * join the UUID-based room for real-time collaboration.
 */
const server = new Server({
  port: PORT,

  async onAuthenticate(data) {
    const roomUUID = data.documentName; // UUID = WebSocket room name

    // Get parameters from the connection request
    const docId = data.requestParameters.get("docId"); // 9-digit numeric code
    const pin = data.requestParameters.get("pin"); // 4-digit pin
    const name = data.requestParameters.get("name"); // user's display name

    console.log(chalk.yellow("🔍 Auth attempt:"), {
      docId,
      pin,
      name,
      roomUUID,
    });

    if (!docId || !pin || !name) {
      console.log(chalk.red("❌ Missing docId, pin, or name"));
      throw new Error("Unauthorized");
    }

    const document = await validateJoinAccess(Number(docId), Number(pin));

    if (!document) {
      console.log(
        chalk.red(`❌ Invalid access for docId=${docId}, pin=${pin}`)
      );
      throw new Error("Unauthorized");
    }

    // ✅ If backend confirms, user joins the UUID room
    console.log(
      chalk.green("✅ Auth success:"),
      chalk.cyan(name),
      chalk.gray(`room=${roomUUID}`)
    );

    data.context.user = { name };
    return { user: { name } };
  },

  async onConnect({ documentName, context, socketId }) {
    // Track connection
    if (!roomConnections.has(documentName)) {
      roomConnections.set(documentName, new Set());
    }
    roomConnections.get(documentName)?.add(socketId);

    console.log(
      chalk.green("🟢 Connected:"),
      chalk.cyan(context.user?.name),
      chalk.gray(`room=${documentName}`),
      chalk.gray(`users=${roomConnections.get(documentName)?.size}`)
    );
  },

  async onDisconnect({ documentName, context, socketId }) {
    // Remove connection
    roomConnections.get(documentName)?.delete(socketId);
    if (roomConnections.get(documentName)?.size === 0) {
      roomConnections.delete(documentName);
    }

    console.log(
      chalk.red("🔴 Disconnected:"),
      chalk.cyan(context.user?.name),
      chalk.gray(`room=${documentName}`),
      chalk.gray(`users=${roomConnections.get(documentName)?.size || 0}`)
    );
  },

  async onLoadDocument({ documentName }) {
    console.log(chalk.blue("📄 Loading document:"), chalk.gray(documentName));

    return new Y.Doc();
  },
});

server.listen().then(() => {
  console.log(
    chalk.green(`✅ WebSocket server running on ws://localhost:${PORT}`)
  );
});

// HTTP server for REST API to get user counts
const httpServer = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url?.startsWith("/room/") && req.method === "GET") {
    // Extract room UUID from URL: /room/{uuid}
    const roomId = req.url.split("/room/")[1];

    if (!roomId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Room ID required" }));
      return;
    }

    try {
      // Get user count from our tracking map
      const userCount = roomConnections.get(roomId)?.size || 0;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          roomId,
          userCount,
        })
      );
    } catch (error) {
      console.error("Error getting user count:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

httpServer.listen(HTTP_PORT, () => {
  console.log(
    chalk.blue(`📡 HTTP API server running on http://localhost:${HTTP_PORT}`)
  );
});
