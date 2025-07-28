import { Request, Response } from "express";
import NewProduct from "../../models/NewProduct";
import ProductElement from "../../models/ProductElement";
export async function getAllProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const products = await NewProduct.findAll();

    const productsWithElements = await Promise.all(
      products.map(async (product) => {
        const elements = await ProductElement.findAll({
          where: { productId: product.id },
          order: [["order", "ASC"]],
        });

        // 🔹 On récupère la première image (s’il y en a)
        const imageElement = elements.find((el) => el.type === "image");
        const imageUrl = imageElement?.imageUrl || null;

        return {
          ...product.toJSON(),
          elements,
          imageUrl, // <- on l'ajoute ici
        };
      })
    );

    res.status(200).json(productsWithElements);
  } catch (err) {
    console.error("Erreur récupération des produits :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
}
