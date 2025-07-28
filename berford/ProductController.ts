import Products from "../models/Product";
import { v4 as uuidv4 } from "uuid";
// import { Op } from "sequelize";
import User from "../models/User";

// Importation des types nécessaires depuis Express
import { Request, Response, NextFunction } from "express";
interface CustomRequest extends Request {
  user?: {
    role: string;
    userId: number;
  };
  role?: string;
  userId?: number;
}
interface UserProps extends Request {
  userId: number;
}

/**
 * Contrôleur pour afficher la page d'accueil.
 * @param req - Objet de requête HTTP.
 * @param res - Objet de réponse HTTP.
 * @param next - Fonction pour passer au middleware suivant (gestion des erreurs).
 */
export const getProducts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let response;

    // Vérification du rôle de l'utilisateur
    if (req.role === "admin") {
      response = await Products.findAll({
        attributes: [
          "uuid",
          "name",
          "price",
          "shippingFee",
          "extraQuestions",
          "productIdOrKeyword",
        ],
        include: [
          {
            model: User,
            attributes: ["name", "email"], // Inclut uniquement les attributs nécessaires de l'utilisateur
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } else {
      response = await Products.findAll({
        attributes: [
          "uuid",
          "name",
          "price",
          "shippingFee",
          "extraQuestions",
          "productIdOrKeyword",
        ],
        // where: {
        //   userId: req.role,
        // },
        include: [
          {
            model: User,
            attributes: ["name", "email", "role"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    // ✅ Réponse avec les produits récupérés
    res.status(200).json(response);
    return; // Ajout de return pour éviter toute exécution supplémentaire
  } catch (error: any) {
    // ✅ Passage de l'erreur au middleware d'Express
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

// Création d'un produit
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, price, shippingFee, extraQuestions, productIdOrKeyword } =
      req.body;

    // Validation des données
    if (!name || name.trim().length < 3 || name.trim().length > 100) {
      res.status(400).json({
        error: "Le nom du produit doit avoir entre 3 et 100 caractères.",
      });
      return;
    }

    if (!price || isNaN(price) || price <= 0) {
      res.status(400).json({ error: "Le prix doit être un nombre positif." });
      return;
    }

    if (!shippingFee || isNaN(shippingFee) || shippingFee < 0) {
      res.status(400).json({
        error: "Les frais de livraison doivent être un nombre positif ou zéro.",
      });
      return;
    }

    if (
      productIdOrKeyword &&
      (typeof productIdOrKeyword !== "string" ||
        productIdOrKeyword.trim().length === 0)
    ) {
      res.status(400).json({
        error:
          "Le champ productIdOrKeyword est obligatoire et ne doit pas être vide.",
      });
      return;
    }

    // Création du produit dans la base de données
    await Products.create({
      name: name.trim(),
      price,
      shippingFee,
      extraQuestions,
      productIdOrKeyword,
      userId: 2,
      uuid: uuidv4(),
    });

    res.status(201).json({ msg: "Produit créé avec succès !" });
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

export const getProductById = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Vérifier si le produit existe avant de continuer
    const product = await Products.findOne({
      where: { uuid: req.params.id },
    });

    if (!product) {
      res.status(404).json({ msg: "Produit non trouvé" });
      return;
    }

    // // Vérifier que `req.role` et `req.userId` existent
    // if (!req.role || !req.userId) {
    //   res.status(400).json({ msg: "Informations utilisateur manquantes" });
    //   return;
    // }

    // // Vérification des permissions
    // if (req.role !== "admin" && req.userId !== product.userId) {
    //   res.status(403).json({ msg: "Accès non autorisé" });
    //   return;
    // }

    // Définition des attributs de retour
    const attributes =
      req.role === "admin"
        ? [
            "uuid",
            "name",
            "price",
            "shippingFee",
            "extraQuestions",
            "productIdOrKeyword",
          ]
        : ["uuid", "name", "price"];

    // Inclure les informations de l'utilisateur uniquement pour les admins
    const include =
      req.role === "admin"
        ? [{ model: User, attributes: ["name", "email"] }]
        : [];

    // Récupération des données du produit
    const response = await Products.findOne({
      attributes,
      where: { id: product.id },
      include,
    });

    if (!response) {
      res.status(404).json({ msg: "Produit non autorisé ou introuvable" });
      return;
    }

    // Retourner la réponse
    res.status(200).json(response);
  } catch (error: any) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

export const updateProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Vérifier si le produit existe avant de continuer
    const product = await Products.findOne({
      where: { uuid: req.params.id },
    });

    if (!product) {
      res.status(404).json({ msg: "Produit non trouvé" });
      return;
    }

    let updateData: any = {};

    // Logique basée sur le rôle de l'utilisateur

    // Mettre à jour tous les champs autorisés pour un administrateur
    updateData = (({
      name,
      price,
      shippingFee,
      extraQuestions,
      productIdOrKeyword,
    }) => ({
      name,
      price,
      shippingFee,
      extraQuestions,
      productIdOrKeyword,
    }))(req.body);

    // Mise à jour du produit avec retour des nouvelles valeurs
    const [updatedRows, updatedProducts] = await Products.update(updateData, {
      where: { uuid: req.params.id },
      returning: true, // Permet de récupérer les nouvelles valeurs
    });

    // Vérifier si la mise à jour a bien été effectuée
    if (updatedRows === 0) {
      res.status(400).json({ msg: "Aucune modification effectuée" });
      return;
    }

    res.status(200).json({
      msg: "Produit modifié avec succès !",
      product: updatedProducts[0], // Retourne le produit mis à jour
    });
  } catch (error: any) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

export const deleteProducts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let deleteCondition: any = { uuid: req.params.id };
    // Supprimer le produit
    const deletedRows = await Products.destroy({ where: deleteCondition });

    if (deletedRows === 0) {
      res.status(404).json({ msg: "Produit non trouvé ou accès refusé" });
      return;
    }

    res.status(200).json({ msg: "Produit supprimé avec succès" });
  } catch (error: any) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
};
