import { Request, Response } from "express";
import NewProduct from "../../models/NewProduct";
import ProductElement from "../../models/ProductElement";

export async function deleteNewProduct(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  try {
    // 🔹 Vérifie si le produit existe
    const product = await NewProduct.findByPk(id);
    if (!product) {
      res.status(404).json({ message: "Produit non trouvé" });
      return;
    }

    // 🔹 Supprime d'abord tous les éléments liés
    await ProductElement.destroy({
      where: { productId: id },
    });

    // 🔹 Puis supprime le produit
    await product.destroy();

    res.status(200).json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression du produit :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
}
