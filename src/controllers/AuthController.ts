import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config(); // Charger les variables d'environnement dès le début
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User"; // Assure-toi que ce modèle est bien défini
const SECRET_KEY = process.env.JWT_SECRET || "Kx8Zm4VqT9NcY7PwJ2Bd5H6G3RLMAQX";
// ✅ Étendre `Request` pour inclure `user`

// ➤ Interface pour typer `req.user`
interface AuthRequest extends Request {
  user?: {
    id: number;
    role: "employee" | "admin";
  };
}
const SALT_ROUNDS = 10; // Niveau de hashage

// ➤ Fonction d'inscription d'un utilisateur

export const Login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(400).json({ message: "Identifiants incorrects" });
      return; // Ajoutez un return ici
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Identifiants incorrects" });
      return; // Ajoutez un return ici
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "7d",
    });
    res.json({ message: "Connexion réussie", token });
    return; // Ajoutez un return ici pour expliciter que la fonction se termine ici
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
    return; // Ajoutez un return ici
  }
};
