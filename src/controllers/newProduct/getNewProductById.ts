import { Request, Response } from "express";
import { NewProduct, ProductElement } from "../../models";

export async function getNewProductById(
  req: Request<{ id: string }>, // ✅ ici on précise que les params contiennent un id
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const product = await NewProduct.findByPk(id, {
      include: [
        {
          model: ProductElement,
          as: "elements",
        },
      ],
      order: [["elements", "order", "ASC"]],
    });

    if (!product) {
      res.status(404).json({ message: "Produit non trouvé" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Erreur lors de la récupération du produit :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
}
