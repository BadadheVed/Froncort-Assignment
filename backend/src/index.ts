import express from "express";
import cors from "cors";
import docsRouter from "@/routers/docs";

const app = express();
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());

app.use("/docs", docsRouter);

const PORT = Number(process.env.PORT || 3001);

(async () => {
  try {
    app.listen(PORT, () => {
      console.log(`API server running on ${frontendUrl}:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
})();
