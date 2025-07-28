import { Router } from "express";
import { createProductElement } from "../controllers/newProduct/createProductElement";
import { getAllProduct } from "../controllers/newProduct/getAllProduct";
import { deleteNewProduct } from "../controllers/newProduct/deleteNewProduct";
import { updateNewProduct } from "../controllers/newProduct/updateNewProduct";
import upload from "../utils/multerConfig"; // Importer Multer
import { getNewProductById } from "../controllers/newProduct/getNewProductById";
import { toggleStatus } from "../controllers/newProduct/toggleStatus";
import { duplicateProduct } from "../controllers/newProduct/duplicateProduct";
const router = Router();
router.post("/newproducts", upload.array("images", 10), createProductElement);
router.get("/newproducts", getAllProduct);
router.delete("/newproducts/:id", deleteNewProduct);
router.put("/newproducts/:id", upload.array("images", 10), updateNewProduct);
router.get("/newproducts/:id", getNewProductById);
router.patch("/newproducts/:id/toggle-status", toggleStatus);
router.post("/newproducts/:id/duplicate", duplicateProduct);
export default router;
