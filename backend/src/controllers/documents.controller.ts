import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import prisma from "../models/prisma";

export const listDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const docs = await prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, ownerId: true, createdAt: true, updatedAt: true },
    });
    return res.json(docs);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title } = req.body as { title: string };
    if (!title) return res.status(400).json({ message: "Title is required" });
    const doc = await prisma.document.create({
      data: { title, ownerId: userId, content: "" },
      select: { id: true, title: true, ownerId: true, createdAt: true, updatedAt: true },
    });
    return res.status(201).json(doc);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };
    const doc = await prisma.document.findFirst({
      where: { id, ownerId: userId },
      select: { id: true, title: true, ownerId: true, createdAt: true, updatedAt: true },
    });
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json(doc);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };
    const { title } = req.body as { title: string };
    if (!title) return res.status(400).json({ message: "Title is required" });
    const doc = await prisma.document.updateMany({
      where: { id, ownerId: userId },
      data: { title },
    });
    if (doc.count === 0) return res.status(404).json({ message: "Not found" });
    const updated = await prisma.document.findUnique({
      where: { id },
      select: { id: true, title: true, ownerId: true, createdAt: true, updatedAt: true },
    });
    return res.json(updated);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params as { id: string };
    const del = await prisma.document.deleteMany({ where: { id, ownerId: userId } });
    if (del.count === 0) return res.status(404).json({ message: "Not found" });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};
