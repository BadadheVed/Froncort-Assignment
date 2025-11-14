import { Router } from "express";
import {
  createDocument,
  joinDocument,
} from "@/controllers/document.controller";

const docsRouter = Router();

docsRouter.post("/create", createDocument);
docsRouter.post("/join", joinDocument);

export default docsRouter;
