import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User";
import argon2 from "argon2";

/**
 * Interface du corps de requête pour les utilisateurs.
 */
export interface CustomRequest extends Request {
  userId?: number;
  role: string;
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}
interface CustomGetUsersRequest extends Request {
  name: string;
  email: string;
}

export const getUsers = async (
  req: Request<{}, {}, CustomRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // // Vérification stricte du rôle
    const users = await User.findAll({
      attributes: ["uuid", "name", "email", "role"],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

export const getUserById = async (
  req: CustomRequest, // Utiliser CustomRequest pour inclure req.userId et req.role
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Vérifier si l'utilisateur est admin ou s'il demande son propre profil
    if (
      req.role !== "admin" &&
      req.userId &&
      String(req.userId) === req.params.id
    ) {
      res.status(403).json({ msg: "Accès non autorisé" });
      return;
    }

    // Récupérer l'utilisateur
    const user = await User.findOne({
      attributes: ["uuid", "name", "email", "role"],
      where: { uuid: req.params.id },
    });

    // Vérifier si l'utilisateur existe
    if (!user) {
      res.status(404).json({ msg: "Utilisateur non trouvé" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

export const createUser = async (
  req: Request<{}, {}, CustomRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, email, password, confirmPassword, role } = req.body;

  // Vérification des champs obligatoires
  if (!password || !confirmPassword || password.trim() === "") {
    res.status(400).json({ msg: "Le mot de passe est requis" });
    return;
  }

  if (password !== confirmPassword) {
    res
      .status(400)
      .json({ msg: "Le mot de passe et la confirmation ne correspondent pas" });
    return;
  }

  try {
    const hashPassword = await argon2.hash(password); // Hasher le mot de passe

    await User.create({
      uuid: uuidv4(), // Génère un UUID unique
      name,
      email,
      password: hashPassword,
      role,
    });

    res.status(201).json({ msg: "Utilisateur créé avec succès" });
  } catch (error: any) {
    next(error instanceof Error ? error : new Error(String(error))); // Passe l'erreur au middleware d'erreur
  }
};

export const updateUser = async (
  req: Request<{ id: string }, {}, Partial<CustomRequest>>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { uuid: req.params.id } });
    if (!user) {
      res.status(404).json({ msg: "Utilisateur non trouvé" });
      return;
    }

    const { name, email, password, confirmPassword, role } = req.body;

    let hashPassword = user.password; // Garder l'ancien mot de passe par défaut

    // Vérifier si un nouveau mot de passe est fourni
    if (password) {
      if (password !== confirmPassword) {
        res.status(400).json({
          msg: "Le mot de passe et la confirmation ne correspondent pas",
        });
        return;
      }
      hashPassword = await argon2.hash(password);
    }

    // Mise à jour de l'utilisateur
    await User.update(
      { name, email, password: hashPassword, role },
      { where: { uuid: user.uuid } }
    );

    res.status(200).json({ msg: "Utilisateur mis à jour avec succès" });
  } catch (error: any) {
    next(error instanceof Error ? error : new Error(String(error))); // Passer l'erreur au middleware d'erreur
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await User.destroy({ where: { uuid: req.params.id } });
    res.status(200).json({ msg: "Utilisateur supprimé avec succès" });
  } catch (error: any) {
    next(error instanceof Error ? error : new Error(String(error))); // Passer l'erreur au middleware d'erreur
  }
};
