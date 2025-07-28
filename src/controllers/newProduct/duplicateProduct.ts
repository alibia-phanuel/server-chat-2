import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import NewProduct from "../../models/NewProduct";
import ProductElement from "../../models/ProductElement";
interface Params {
  id: string;
}

export async function duplicateProduct(
  req: Request<Params>,
  res: Response
): Promise<Response> {
  try {
    const { id } = req.params;

    // Find the product by ID with its elements
    const product = await NewProduct.findByPk(id, {
      include: [{ model: ProductElement, as: "elements" }],
    });

    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Produit non trouvé",
      });
    }

    // Create a new product
    const newProduct = await NewProduct.create({
      keyword: product.keyword,
      name: `${product.name} (Copy)`,
      createdBy: product.createdBy,
      idPostFacebook: product.idPostFacebook,
      synonym: product.synonym,
      isActive: true,
    });

    // Duplicate associated ProductElements
    if (product.elements && product.elements.length > 0) {
      const elementPromises = product.elements.map((element) =>
        ProductElement.create({
          productId: newProduct.id,
          type: element.type,
          content: element.content,
          imageUrl: element.imageUrl,
          caption: element.caption,
          order: element.order,
        })
      );
      await Promise.all(elementPromises);
    }

    // Fetch the new product with its elements for the response
    const duplicatedProduct = await NewProduct.findByPk(newProduct.id, {
      include: [{ model: ProductElement, as: "elements" }],
    });

    return res.status(StatusCodes.CREATED).json({
      message: "Produit dupliqué avec succès",
      data: {
        id: duplicatedProduct!.id,
        keyword: duplicatedProduct!.keyword,
        name: duplicatedProduct!.name,
        createdBy: duplicatedProduct!.createdBy,
        idPostFacebook: duplicatedProduct!.idPostFacebook,
        synonym: duplicatedProduct!.synonym,
        isActive: duplicatedProduct!.isActive,
        elements: duplicatedProduct!.elements || [],
      },
    });
  } catch (error) {
    console.error("Erreur de duplication du produit:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Erreur interne du serveur",
    });
  }
}
