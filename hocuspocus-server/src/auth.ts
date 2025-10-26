import jwt from "jsonwebtoken";
import type { AuthToken } from "./types";

export const verifyToken = (token: string, secret: string): AuthToken | null => {
  try {
    const payload = jwt.verify(token, secret) as AuthToken & { iat: number; exp: number };
    return { id: payload.id, username: payload.username, email: payload.email };
  } catch {
    return null;
  }
};
