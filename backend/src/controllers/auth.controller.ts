import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../models/prisma";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as { username: string; email: string; password: string };
    if (!username || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const hashed = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: { username, email, password: hashed },
      select: { id: true, username: true, email: true },
    });
    const token = jwt.sign(
      { id: created.id, username: created.username, email: created.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );
    return res.status(201).json({ token, user: created });
  } catch (err: unknown) {
    if (typeof err === "object" && err && (err as any).code === "P2002") {
      return res.status(409).json({ message: "User already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, username: true, email: true, password: true } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const publicUser = { id: user.id, username: user.username, email: user.email };
    const token = jwt.sign(publicUser, process.env.JWT_SECRET as string, { expiresIn: "7d" });

    res.cookie("token", token, { httpOnly: true });
    return res.json({ token, user: publicUser });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signup = register;
