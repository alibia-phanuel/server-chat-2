import { Request, Response } from "express";
import NewProduct from "../../models/NewProduct";
import ProductElement from "../../models/ProductElement";
import type { Multer } from "multer";

export async function createProductElement(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { keyword, name, createdBy, elements, idPostFacebook, synonym } = req.body;
    console.log("les donne du produit", req.body);
    const files = req.files as Express.Multer.File[];

    const parsedElements = JSON.parse(elements); // Tableau d’objets { type, content, caption, order, imageIndex }

    // 🔹 Création du produit
    const product = await NewProduct.create({
      keyword,
      name,
      createdBy,
      idPostFacebook,
      synonym,
    });

    // 🔹 Construction des éléments
    for (const el of parsedElements) {
      if (el.type === "image") {
        const imageFile = files[el.imageIndex]; // 👈 Index correspond à l'ordre des images dans FormData
        await ProductElement.create({
          productId: product.id,
          type: "image",
          caption: el.caption,
          imageUrl: imageFile ? `/images/products/${imageFile.filename}` : null,
          order: el.order,
        });
      } else if (el.type === "text") {
        await ProductElement.create({
          productId: product.id,
          type: "text",
          content: el.content,
          order: el.order,
        });
      }
    }

    res
      .status(201)
      .json({ message: "Produit créé avec succès", productId: product.id });
  } catch (err) {
    console.error("Erreur création produit :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
}
