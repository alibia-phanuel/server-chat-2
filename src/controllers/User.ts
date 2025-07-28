import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User"; // Assure-toi que ce modèle est bien défini

// ➤ Interface pour typer `req.user`
interface AuthRequest extends Request {
  user?: {
    id: number;
    role: "employee" | "admin";
  };
}
const SALT_ROUNDS = 10; // Niveau de hashage

// ➤ Fonction d'inscription d'un utilisateur
export const createUser = async (
  req: AuthRequest, // Utilisation de l'interface AuthRequest ici
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email déjà utilisé" });
      return;
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Création de l'utilisateur
    const newUser = await User.create({
      uuid: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role,
      createdBy: req.user?.id, // Vérifie que `req.user` est bien défini
    });

    // Récupération des infos de l'admin qui a ajouté l'utilisateur
    const createdByUser = req.user?.id
      ? await User.findByPk(req.user.id, {
          attributes: ["name", "email", "role"], // On récupère les infos essentielles
        })
      : null;

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: newUser,
      createdBy: createdByUser, // On inclut les détails de l'administrateur (ou employeur)
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: ["uuid", "name", "email", "role", "profilePicture"],
    });

    if (!users || users.length === 0) {
      res.status(404).json({ message: "Aucun utilisateur trouvé" });
      return;
    }

    res.status(200).json(users);
  } catch (error: any) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);

    if (error.name === "SequelizeConnectionError") {
      res.status(500).json({
        message: "Erreur de connexion à la base de données",
        error: error.message,
      });
    } else if (error.name === "SequelizeDatabaseError") {
      res.status(500).json({
        message: "Erreur de base de données",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Erreur serveur lors de la récupération des utilisateurs",
        error: error.message,
      });
    }
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Vérifier si l'ID est bien fourni
    if (!id) {
      res.status(400).json({ message: "L'ID de l'utilisateur est requis" });
      return;
    }

    // Récupération de l'utilisateur
    const user = await User.findOne({
      attributes: ["uuid", "name", "email", "role"],
      where: { uuid: id },
    });

    // Vérifier si l'utilisateur existe
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);

    if (error.name === "SequelizeConnectionError") {
      res.status(500).json({
        message: "Erreur de connexion à la base de données",
        error: error.message,
      });
    } else if (error.name === "SequelizeDatabaseError") {
      res.status(500).json({
        message: "Erreur de base de données",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Erreur serveur lors de la récupération de l'utilisateur",
        error: error.message,
      });
    }
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, password, role, profilePicture } = req.body;

    // Vérifier si l'ID est fourni
    if (!id) {
      res.status(400).json({ message: "L'ID de l'utilisateur est requis" });
      return;
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { uuid: id } });
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    let hashPassword = user.password; // Garder le mot de passe existant par défaut

    // Si un nouveau mot de passe est fourni, le hasher avec bcrypt
    if (password) {
      const saltRounds = 10;
      hashPassword = await bcrypt.hash(password, saltRounds);
    }

    // Mise à jour de l'utilisateur
    await User.update(
      { name, email, password: hashPassword, role, profilePicture },
      { where: { uuid: id } }
    );

    res.status(200).json({ message: "Utilisateur mis à jour avec succès" });
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);

    if (error.name === "SequelizeValidationError") {
      res.status(400).json({
        message: "Erreur de validation des données",
        error: error.errors.map((err: any) => err.message),
      });
    } else if (error.name === "SequelizeConnectionError") {
      res.status(500).json({
        message: "Erreur de connexion à la base de données",
        error: error.message,
      });
    } else if (error.name === "SequelizeDatabaseError") {
      res.status(500).json({
        message: "Erreur de base de données",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Erreur serveur lors de la mise à jour de l'utilisateur",
        error: error.message,
      });
    }
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Vérifier si l'UUID est fourni
    if (!id) {
      res.status(400).json({ message: "L'UUID de l'utilisateur est requis" });
      return;
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { uuid: id } });
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    // Suppression de l'utilisateur
    await User.destroy({ where: { uuid: id } });

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error: any) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      res.status(400).json({
        message:
          "Impossible de supprimer cet utilisateur car il est lié à d'autres données",
        error: error.message,
      });
    } else if (error.name === "SequelizeConnectionError") {
      res.status(500).json({
        message: "Erreur de connexion à la base de données",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Erreur serveur lors de la suppression de l'utilisateur",
        error: error.message,
      });
    }
  }
};
