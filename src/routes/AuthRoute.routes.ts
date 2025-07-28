import { Request, Response } from "express";
import express from "express";

import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { Login } from "../controllers/AuthController";
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
const router = express.Router();
/**
 * @route   POST /login
 * @desc    Authentifie l'utilisateur et renvoie un token
 * @access  Public (tout utilisateur peut se connecter)
 */
router.post("/login", Login);
// ---------------------------
router.get(
  "/me",
  AuthMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    res.json(req.user); // Renvoie les infos utilisateur
    // Pas besoin de return après res.json
  }
);

/**
 * @route   DELETE /logout
 * @desc    Déconnecte l'utilisateur en supprimant le token côté serveur
 * @access  Privé (nécessite un token d'authentification)
 */
// ✅ Déconnexion (optionnel)
router.post("/logout", (req, res) => {
  res.json({ message: "Déconnexion réussie" });
});
export default router;
