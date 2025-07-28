import { Request, Response } from "express";
import Contact from "../models/Contact";

// GET /contacts - liste tous les contacts
export const getAllContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.findAll({
      attributes: ["name", "phone"],
      order: [["createdAt", "DESC"]],
    });
    res.json(contacts);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des contacts :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
