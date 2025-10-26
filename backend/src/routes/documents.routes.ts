import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { listDocuments, createDocument, getDocument, updateDocument, deleteDocument } from "../controllers/documents.controller";

const router = Router();
router.use(authMiddleware);
router.get("/", listDocuments);
router.post("/", createDocument);
router.get("/:id", getDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);
export default router;
