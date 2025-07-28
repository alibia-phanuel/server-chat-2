import { Request, Response } from "express";
import { NewProduct } from "../../models";
import { StatusCodes } from "http-status-codes";
export async function toggleStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Find the product by ID
    const product = await NewProduct.findByPk(id);

    if (!product) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Produit non trouvé",
      });
      return;
    }

    // Toggle the isActive status
    const newStatus = !product.isActive;
    await product.update({ isActive: newStatus });

    res.status(StatusCodes.OK).json({
      message: "Le statut du produit a été mis à jour avec succès",
      data: {
        id: product.id,
        isActive: newStatus,
      },
    });
    return;
  } catch (error) {
    console.error("Erreur dans le changement de statut du produit:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur de serveur interne",
    });
    return;
  }
}
