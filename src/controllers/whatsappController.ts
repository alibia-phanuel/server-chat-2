import { Request, Response } from "express";
import { WhatsAppService } from "../config/initializeWppClient";

export const connectWhatsapp = async (req: Request, res: Response) => {
  try {
    console.log("📥 Requête reçue pour connectWhatsapp:", req.body);
    const { sessionName } = req.body;
    if (!sessionName) {
      console.log("❌ Nom de session manquant");
      return res
        .status(400)
        .json({ success: false, message: "Nom de session requis" });
    }
    const client = await WhatsAppService.initializeWhatsApp(sessionName);
    if (!client) {
      console.log("❌ Client déjà en initialisation");
      return res
        .status(400)
        .json({ success: false, message: "Client déjà en initialisation" });
    }
    console.log("✅ Réponse envoyée pour connectWhatsapp");
    return res.json({ success: true, message: "Client en cours de connexion" });
  } catch (error: any) {
    console.error("❌ Erreur dans connectWhatsapp:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
      error: error.message || "Erreur inconnue",
    });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    console.log("📥 Requête reçue pour getStatus");
    const status = await WhatsAppService.getStatus();
    console.log("✅ Réponse envoyée pour getStatus:", status);
    return res.json({ connected: status === "CONNECTED", status });
  } catch (error: any) {
    console.error("❌ Erreur dans getStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du statut",
      error: error.message || "Erreur inconnue",
    });
  }
};

export const disconnectWhatsapp = async (req: Request, res: Response) => {
  try {
    console.log("📥 Requête reçue pour disconnectWhatsapp");
    await WhatsAppService.disconnectWhatsApp();
    console.log("✅ Réponse envoyée pour disconnectWhatsapp");
    return res.json({ success: true, message: "Déconnecté avec succès" });
  } catch (error: any) {
    console.error("❌ Erreur dans disconnectWhatsapp:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Erreur de déconnexion",
    });
  }
};
