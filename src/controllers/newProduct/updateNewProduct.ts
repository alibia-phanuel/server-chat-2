import { Request, Response } from "express";
import NewProduct from "../../models/NewProduct";
import ProductElement from "../../models/ProductElement";

interface MulterRequest extends Request {
  files?: any[]; // fallback any pour éviter l'erreur bloquante
}

export async function updateNewProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id, name, createdBy, elements, keyword, idPostFacebook, synonym } = req.body;
    const files = (req as MulterRequest).files || [];
    const parsedElements = JSON.parse(elements); // [{id?, type, content, caption, order, imageUrl}]

    // Vérifie si le produit existe
    const product = await NewProduct.findByPk(id);
    if (!product) {
      res.status(404).json({ message: "Produit non trouvé" });
      return;
    }

    // Mise à jour des infos du produit
    await product.update({ name, createdBy, keyword, idPostFacebook, synonym });

    // Récupère les éléments existants
    const existingElements = await ProductElement.findAll({ where: { productId: id } });
    const existingIds = existingElements.map(el => el.id);

    // Pour suivre les fichiers images uploadés
    let imageFileIndex = 0;

    // Gérer update/ajout
    for (const el of parsedElements) {
      if (el.type === "image") {
        if (el.id && existingIds.includes(el.id)) {
          // Modification d'une image existante
          let imageUrl = el.imageUrl;
          if (el.fileReplace) { // Champ custom côté client pour signaler remplacement
            const imageFile = files[imageFileIndex++];
            imageUrl = imageFile ? `/images/products/${imageFile.filename}` : el.imageUrl;
          }
          await ProductElement.update(
            {
              caption: el.caption,
              imageUrl,
              order: el.order,
            },
            { where: { id: el.id } }
          );
        } else {
          // Nouvelle image
          const imageFile = files[imageFileIndex++];
          await ProductElement.create({
            productId: id,
            type: "image",
            caption: el.caption,
            imageUrl: imageFile ? `/images/products/${imageFile.filename}` : null,
            order: el.order,
          });
        }
      } else if (el.type === "text") {
        if (el.id && existingIds.includes(el.id)) {
          // Modification d'un texte existant
          await ProductElement.update(
            {
              content: el.content,
              order: el.order,
            },
            { where: { id: el.id } }
          );
        } else {
          // Nouveau texte
          await ProductElement.create({
            productId: id,
            type: "text",
            content: el.content,
            order: el.order,
          });
        }
      }
    }

    // Suppression des éléments retirés côté client
    const sentIds = parsedElements.filter((e: any) => e.id).map((e: any) => e.id);
    const toDelete = existingElements.filter((e: any) => !sentIds.includes(e.id));
    for (const el of toDelete) {
      await el.destroy();
    }

    res.status(200).json({ message: "Produit mis à jour avec succès" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du produit :", err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
}
