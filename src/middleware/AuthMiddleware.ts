import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config(); // Charger les variables d'environnement

// Interface pour req.user
interface AuthRequest extends Request {
  user?: {
    id: string;
    uuid: string;
    role: string;
    name: string;
    email: string;
    profilePicture: string | null;
    createdBy: string | null;
  };
}

const SECRET_KEY: string =
  process.env.JWT_SECRET ||
  "c480d778c8e612ee004c25d62af12405da22359c28967c90f4145760987dd19c"; // Clé par défaut (à éviter en production)

export const AuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    console.log("Token reçu:", token); // Log activé pour déboguer
    if (!token) {
      res.status(401).json({ message: "Accès refusé, token manquant" });
      return;
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    console.log("Decoded token:", decoded); // Log activé pour déboguer
    const user = await User.findByPk(decoded.id);

    if (!user) {
      console.log("Utilisateur non trouvé pour l'ID:", decoded.id);
      res.status(401).json({ message: "Utilisateur non trouvé" });
      return;
    }

    req.user = {
      id: user.id,
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "employee",
      profilePicture: user.profilePicture,
      createdBy: user.createdBy,
    };

    next();
  } catch (error: unknown) {
    let message = "Erreur inconnue";

    if (error instanceof Error) {
      message = error.message;
    }

    res.status(401).json({ message: "Token invalide", error: message });
  }
};

// Middleware pour vérifier si l'utilisateur est un administrateur
export const AdminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    res
      .status(403)
      .json({ message: "Accès refusé. Vous devez être administrateur." });
    return;
  }
  next();
};
