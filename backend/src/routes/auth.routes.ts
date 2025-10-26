import { Router } from "express";
import { login, register, signup } from "../controllers/auth.controller";

const router = Router();
router.post("/register", register);
router.post("/signup", signup);
router.post("/login", login);
export default router;
