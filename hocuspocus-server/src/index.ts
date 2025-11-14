import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import chalk from "chalk";
import dotenv from "dotenv";
import { validateJoinAccess } from "./auth";

dotenv.config();

const PORT = Number(process.env.PORT || 1234);

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

  async onConnect({ documentName, context }) {
    console.log(
      chalk.green("🟢 Connected:"),
      chalk.cyan(context.user?.name),
      chalk.gray(`room=${documentName}`)
    );
  },

  async onDisconnect({ documentName, context }) {
    console.log(
      chalk.red("Disconnected: From the websocket server"),
      chalk.cyan(context.user?.name),
      chalk.gray(`room=${documentName}`)
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
