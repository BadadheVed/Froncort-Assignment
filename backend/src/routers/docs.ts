import { Router } from "express";
import { createDocument, joinDocument } from "@/controllers/document.controller";

const router = Router();

router.post("/create", createDocument);
router.post("/join", joinDocument);

export default router;