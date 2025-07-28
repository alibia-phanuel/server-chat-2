import { NewProduct, ProductElement } from "../models";
import humanSleep from "../utils/humanSleep";

export async function sendProductByFacebookId(
  clientInstance: any,
  senderId: string,
  idPostFacebook: string
): Promise<boolean> {
  const product = await NewProduct.findOne({
    where: { idPostFacebook },
    include: [{ model: ProductElement, as: "elements" }],
  });

  if (!product) {
    console.log(
      "⚠️ Aucun produit ne correspond à cet ID Facebook :",
      idPostFacebook
    );
    return false;
  }

  if (!product.isActive) {
    console.log(`🚫 Produit désactivé : ${product.name}`);

    await clientInstance.sendText(
      senderId,
      "⛔ Ce produit est actuellement en rupture de stock. Veuillez revenir plus tard ou consulter d'autres produits disponibles."
    );

    return true;
  }

  console.log(`📦 Produit trouvé via ID Facebook : ${product.name}`);

  const sortedElements = (product.elements || []).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  for (const element of sortedElements) {
    await humanSleep();

    if (element.type === "text" && element.content) {
      await clientInstance.sendText(senderId, element.content);
    }

    if (
      element.type === "image" &&
      typeof element.imageUrl === "string" &&
      element.imageUrl
    ) {
      const fullImageUrl = element.imageUrl.startsWith("/")
        ? `${process.env.BASE_URL}${element.imageUrl}`
        : element.imageUrl;

      await clientInstance.sendImage(
        senderId,
        fullImageUrl,
        "image.jpg",
        element.caption || ""
      );
    }
  }

  return true;
}
