import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import dotenv from "dotenv";
import chalk from "chalk";
import { verifyToken } from "./auth";
import { AuthPayload, ConnectPayload, LoadPayload, ConnectionContext } from "./types";

dotenv.config();

const PORT = Number(process.env.PORT || 1234);
const JWT_SECRET = process.env.JWT_SECRET as string;

const server = new Server({
  port: PORT,
  async onAuthenticate(data: AuthPayload) {
    const docName = data.documentName;
    const rawAuth = data.requestHeaders?.authorization ?? data.requestHeaders?.Authorization;
    const authHeader = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth;
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const paramToken = data.requestParameters?.get("token") ?? undefined;
    const directToken = data.token;
    const token = directToken || paramToken || headerToken;
    
    if (!token) {
      console.log(chalk.yellow(" Auth attempt:") + " " + chalk.red("missing token"), chalk.gray(`doc=${docName}`));
      throw new Error("Unauthorized");
    }
    
    const user = verifyToken(token, JWT_SECRET);
    if (!user) {
      console.log(chalk.yellow(" Auth attempt:") + " " + chalk.red("invalid token"), chalk.gray(`doc=${docName}`));
      throw new Error("Unauthorized");
    }
    
    // Store user in context
    data.context.user = user;
    console.log(chalk.yellow(" Auth success:"), chalk.cyan(user.username), chalk.gray(`doc=${docName}`));
    
    return {
      user: {
        id: user.id,
        name: user.username,
      },
    };
  },

  async onConnect(data: ConnectPayload) {
    console.log(chalk.green(" Connect:"), chalk.gray(`doc=${data.documentName}`));
    
    // Ensure user context is set
    if (!data.context.user && data.connection?.token) {
      try {
        const user = verifyToken(data.connection.token, JWT_SECRET);
        if (user) {
          data.context.user = user;
        }
      } catch (error) {
        console.log(chalk.yellow(" Could not verify token in onConnect"), error);
      }
    }
  },

  async onDisconnect(data: ConnectPayload) {
    const doc = data.documentName || 'unknown-document';
    const username = data.context.user?.username || 'unknown';
    
    if (data.context.user) {
      console.log(chalk.red(" Disconnect:"), chalk.cyan(username), chalk.gray(`doc=${doc}`));
    } else {
      console.log(chalk.red(" Disconnect:"), chalk.gray(`doc=${doc} (no user context)`));
    }
  },

  async onLoadDocument(data: LoadPayload) {
    console.log(chalk.blue(" Load document:"), chalk.gray(data.documentName));
    return new Y.Doc();
  },
});

// Start the WebSocket server
server.listen()
  .then(() => {
    console.log(chalk.green(`✅ WebSocket server running on ws://localhost:${PORT}`));
  })
  .catch((error: Error) => {
    console.error(chalk.red('❌ Failed to start server:'), error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n🛑 Received SIGTERM. Shutting down gracefully...'));
  server.destroy().then(() => {
    console.log(chalk.green('✅ Server has been shut down'));
    process.exit(0);
  });
});