import express from "express";
import { getHomePage } from "../controllers/homeController";
const router = express.Router();
// Route pour afficher la page d'accueil
router.get("/", getHomePage);
export default router;
