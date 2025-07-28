import type { Whatsapp } from "@wppconnect-team/wppconnect";
import processFacebookLink from "../../services/processFacebookLink";
import getProductIdFromPages from "../../services/getProductIdFromPages";
import { Op } from "sequelize";
import { sendProductByFacebookId } from "../../services/idPostFacebook";
import handleProduct from "../../services/productHandler";

interface CtwaContext {
  sourceUrl?: string;
  description?: string;
  mediaUrl?: string;
}
// Fonction pour délai aléatoire entre 1.5s et 4s
const humanSleep = async () => {
  const delay = Math.floor(Math.random() * 2500) + 1500;
  return new Promise((resolve) => setTimeout(resolve, delay));
};


export const handleIncomingProductMessage = async (
  ctwaContext: CtwaContext,
  senderPhone: string,
  client: Whatsapp
) => {
  try {
    console.log("📨 Message reçu :", ctwaContext);
    const sourceUrl = ctwaContext.sourceUrl || "";
    const description = ctwaContext.description || "";

    // 🖨️ Logs pour débogage clair
    console.log("🧩 Détails du CTWA context reçu :");
    // (reste du traitement...)
    const result = await processFacebookLink(sourceUrl);
    if (!result) {
      console.log("❌ Aucun ID Facebook trouvé.");

      return;
    }
    console.log("🔗 Lien long :", result.longLink);
    console.log("🆔 ID formaté :", result.formattedId);
    // 📦 Étape 2 : Vérifier si le produit existe sur Facebook
    const productIdWithPageName = await getProductIdFromPages(result.formattedId);
  if (productIdWithPageName) {
        console.log("📦 ID :", productIdWithPageName?.id);
        console.log("📝 description :", description);
              // 1. Essayer par ID Facebook
      const foundById = await sendProductByFacebookId(client, senderPhone, productIdWithPageName.id);

      if (!foundById) {
        // 2. Sinon chercher par mots clés / synonymes dans la description
        const foundByKeywords = await handleProduct(client, senderPhone, description);

        if (!foundByKeywords) {
          console.log("🚫 Aucun produit trouvé ni par ID Facebook ni par mots-clés");
        }
      }
    }
  } catch (error: any) {
    console.error("❌ Erreur dans handleIncomingProductMessage :", error);
  }
};

