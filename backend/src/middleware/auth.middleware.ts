import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, JwtUser } from "../types";

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Missing Authorization header" });
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Invalid Authorization header" });
    const secret = process.env.JWT_SECRET as string;
    const payload = jwt.verify(token, secret) as JwtUser & { iat: number; exp: number };
    req.user = { id: payload.id, username: payload.username, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
