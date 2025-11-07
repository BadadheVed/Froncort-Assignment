import { Request, Response } from "express";
import prisma from "@/client/db";
import { generateRoomCode, generatePin } from "@/utils/codes";

export const createDocument = async (req: Request, res: Response) => {
  try {
    const { title } = req.body as { title: string };

    if (!title) {
      return res.status(400).json({ message: "Missing title or user info" });
    }

    const docId = parseInt(generateRoomCode());
    const pin = parseInt(generatePin());
    const baseURL = process.env.BASE_URL || "http://localhost:3000";

    const doc = await prisma.document.create({
      data: {
        title,
        docId,
        pin,
        Content: "",
      },
      select: {
        id: true,
        title: true,
        docId: true,
        pin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const joinLink = `${baseURL}/join?docId=${doc.id}`;

    return res.status(201).json({
      message: "Document created successfully",
      document: doc,
      joinLink: joinLink,
      DocId: doc.docId,
      Pin: doc.pin,
    });
  } catch (err) {
    console.error("Error creating document:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const joinDocument = async (req: Request, res: Response) => {
  try {
    const { docId, pin } = req.body as { docId: number; pin: number };
    if (!docId || !pin) {
      return res.status(400).json({ message: "Missing document ID or pin" });
    }
    const document = await prisma.document.findFirst({
      where: {
        docId: docId,
        pin: pin,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    return res.status(200).json({
      message: "Document Ready To Join",
      document: document,
      id: document.id,
    });
  } catch (error) {
    console.error("Error joining document:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
