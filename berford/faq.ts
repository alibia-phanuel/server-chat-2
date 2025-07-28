import { Request, Response, NextFunction } from "express";
import FAQ from "../models/faq.model";
import User from "../models/User";
import { Op } from "sequelize";

interface UserProps extends Request {
  userId?: number;
  role?: string;
}

export const getFAQs = async (
  req: UserProps,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let response;

    response = await FAQ.findAll({
      attributes: ["id", "question", "answer"],
      include: [
        {
          model: User,
          as: "user", // L'alias défini dans votre association
        },
      ],
      order: [["createdAt", "DESC"]], // Tri par date de création (du plus récent au moins récent)
    });

    res.status(200).json(response);
  } catch (error: any) {
    next(error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({ msg: error.message });
  }
};

export const createFAQ = async (
  req: UserProps,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { question, answer } = req.body;

    await FAQ.create({
      question: question,
      answer: answer,
      userId: 2,
    });
    res.status(201).json({ msg: "La question/reponse a créé avec succès !" });
  } catch (error) {
    // Transmission de l'erreur au middleware global
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

export const getFAQsById = async (
  req: UserProps,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Vérifier si le produit existe avant de continuer
    const question = await FAQ.findOne({
      where: {
        id: req.params.id, // Assurer que `uuid` est un paramètre correct
      },
    });

    if (!question) {
      res.status(404).json({ msg: "Questionaire non trouvé" });
    }

    // Vérifier que `req.role` et `req.userId` existent
    if (!req.role || !req.userId) {
      res.status(400).json({ msg: "Informations utilisateur manquantes" });
    }

    let response;

    // Logique basée sur le rôle de l'utilisateur
    if (req.role === "admin") {
      response = await FAQ.findOne({
        attributes: ["id", "question", "answer"],
        where: {
          id: question?.id,
        },
        include: [
          {
            model: User,
            attributes: ["name", "email"],
            as: "user", // L'alias défini dans votre association
          },
        ],
      });
    } else {
      if (req.userId !== question?.userId)
        res.status(403).json({ msg: "Accès non autorisé" });
      response = await FAQ.findOne({
        attributes: ["id", "question", "answer"],
        where: {
          [Op.and]: [{ id: question?.id }, { userId: req.userId }],
        },
      });
    }

    // Si le produit n'existe pas pour l'utilisateur, retour d'une erreur
    if (!response) {
      res.status(404).json({
        msg: "Questioniare non autorisé ou introuvable pour cet utilisateur",
      });
    }

    // Retourner la réponse si tout est OK
    res.status(200).json(response);
  } catch (error: any) {
    // Transmission de l'erreur au middleware global
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

export const updateFAQ = async (
  req: UserProps,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Vérifier si le produit existe avant de continuer
    const faq = await FAQ.findOne({
      where: {
        id: req.params.id, // Assurer que `id` est un paramètre correct
      },
    });

    if (!faq) {
      res.status(404).json({ msg: "Produit non trouvé" });
    }

    let response;

    const { question, answer } = req.body;
    await FAQ.update({ question, answer }, { where: { id: faq?.id } });

    response = await FAQ.findOne({
      attributes: ["id", "question", "answer"],
      where: {
        [Op.and]: [{ id: faq?.id }, { userId: req.userId }],
      },
    });

    // Retourner la réponse si tout est OK
    res.status(200).json({ msg: "Produit modifié avec succès !" });
  } catch (error: any) {
    // Transmission de l'erreur au middleware global
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

export const deleteFAQ = async (
  req: UserProps,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let deleteCondition: any = { uuid: req.params.id };
    // Supprimer le produit
    const deletedRows = await FAQ.destroy({ where: deleteCondition });

    if (deletedRows === 0) {
      res.status(404).json({ msg: "Questioniare non trouvé ou accès refusé" });
      return;
    }

    res.status(200).json({ msg: "Questioniare supprimé avec succès" });
  } catch (error: any) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
};
