import express from "express";
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProducts,
} from "../controllers/ProductController";
const router = express.Router();
// Routes produit
router.get("/products", getProducts);
router.post("/products", createProduct); // Utilisation de multer pour les images
router.get("/products/:id", getProductById);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProducts);
export default router;
