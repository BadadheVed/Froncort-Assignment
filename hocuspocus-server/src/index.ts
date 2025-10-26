import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import dotenv from "dotenv";
import chalk from "chalk";
import { verifyToken } from "./auth";
import type { ConnectionContext } from "./types";

dotenv.config();

const PORT = Number(process.env.PORT || 1234);
const JWT_SECRET = process.env.JWT_SECRET as string;

// Minimal hook payload typings to keep strict TypeScript without relying on internal package types
type AuthPayload = {
  documentName: string;
  requestHeaders?: Record<string, string>;
  requestParameters?: Record<string, unknown>;
  token?: string;
  context: ConnectionContext;
};
type ConnectPayload = { documentName: string; connection: unknown; context: ConnectionContext };
type LoadPayload = { documentName: string; context: ConnectionContext };

const server = new Server({
  port: PORT,
  async onAuthenticate(data: AuthPayload) {
    const docName = data.documentName;
    const authHeader = data.requestHeaders?.authorization || (data.requestHeaders?.Authorization as unknown as string | undefined);
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const paramToken = (data.requestParameters?.token as string | undefined);
    const directToken = data.token;
    const token = directToken || paramToken || headerToken;
    if (!token) {
      console.log(chalk.yellow("🔐 Auth attempt:") + " " + chalk.red("missing token"), chalk.gray(`doc=${docName}`));
      throw new Error("Unauthorized");
    }
    const user = verifyToken(token, JWT_SECRET);
    if (!user) {
      console.log(chalk.yellow("🔐 Auth attempt:") + " " + chalk.red("invalid token"), chalk.gray(`doc=${docName}`));
      throw new Error("Unauthorized");
    }
    data.context.user = user;
    console.log(chalk.yellow("🔐 Auth success:"), chalk.cyan(user.username), chalk.gray(`doc=${docName}`));
  },
  async onConnect(data: ConnectPayload) {
    const user = data.context.user;
    if (!user) {
      console.log(chalk.red("[onConnect] Missing user in context"), chalk.gray(`doc=${data.documentName}`));
      return;
    }
    const doc = data.documentName;
    console.log(chalk.green("🟢 Connect:"), chalk.cyan(user.username), chalk.gray(`doc=${doc}`));
  },
  async onDisconnect(data: ConnectPayload) {
    const user = data.context.user;
    if (!user) {
      console.log(chalk.red("[onDisconnect] Missing user in context"), chalk.gray(`doc=${data.documentName}`));
      return;
    }
    const doc = data.documentName;
    console.log(chalk.red("🔴 Disconnect:"), chalk.cyan(user.username), chalk.gray(`doc=${doc}`));
  },
  async onLoadDocument(data: LoadPayload) {
    console.log(chalk.blue("📄 Load document:"), chalk.gray(data.documentName));
    return new Y.Doc();
  },
});

server.listen();
console.log(chalk.bold(`🚀 Hocuspocus server listening on ws://localhost:${PORT}`));

process.on("SIGINT", () => {
  console.log(chalk.gray("Graceful shutdown..."));
  server.destroy();
  process.exit(0);
});
