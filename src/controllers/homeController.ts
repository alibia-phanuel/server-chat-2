// Importation des types nécessaires depuis Express
import { Request, Response, NextFunction } from "express";

/**
 * Contrôleur pour afficher la page d'accueil.
 * @param req - Objet de requête HTTP.
 * @param res - Objet de réponse HTTP.
 * @param next - Fonction pour passer au middleware suivant (gestion des erreurs).
 */
export const getHomePage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Rendu de la vue "home.ejs" avec des variables dynamiques
    res.render("home", {
      title: "business-chat-backend", // Titre affiché sur la page
      message: "business-chat-backend", // Message de bienvenue
    });
  } catch (error) {
    // Transmission de l'erreur au middleware global
    next(error instanceof Error ? error : new Error(String(error)));
  }
};
