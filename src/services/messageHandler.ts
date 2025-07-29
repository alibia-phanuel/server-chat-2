import { Whatsapp } from "@wppconnect-team/wppconnect";
import { handleFaq } from "./faqHandler";
import handleProducts from "./productHandler";
import { handleIncomingProductMessage } from "../config/utils/handleIncomingProductMessage";
import processFacebookLink from "./processFacebookLink";
import { sendProductByFacebookId } from "./idPostFacebook";
import getProductIdFromPages from "./getProductIdFromPages";

export const handleIncomingMessage = async (
  clientInstance: Whatsapp | null,
  message: any
) => {
  try {
    console.log(
      "📨 Début du traitement du message:",
      JSON.stringify(message, null, 2)
    );

    if (!clientInstance) {
      console.error("❌ Client WhatsApp non défini");
      return;
    }
    if (!message?.from || !message?.body) {
      console.log("⚠️ Message invalide (manque from ou body), ignoré");
      return;
    }

    const senderId = message.from;
    const rawText = message.body || "";
    const cleanText = rawText.replace(/[^\w\s]/gi, "").toLowerCase();

    if (message.ctwaContext) {
      // 🔍 Vérification si le message contient un lien Facebook
      const ctwaContext = message.ctwaContext || {};
      await handleIncomingProductMessage(ctwaContext, senderId, clientInstance);
      console.log("📎 Lien Facebook traité");
      return;
    }

    // Traitement spécial liens Facebook
    if (rawText.includes("fb.me")) {
      const resolvedReel = await processFacebookLink(rawText);
      console.log(resolvedReel, "📎 Lien Facebook start traitement");
      // TODO: traitement spécifique des liens Facebook
      console.log(resolvedReel?.formattedId, "📎 Lien Facebook end traitement");
      if (resolvedReel?.formattedId && resolvedReel?.longLink) {
        const idPostFacebook = resolvedReel?.formattedId;
        const findIdProduct = await getProductIdFromPages(idPostFacebook);
        if (!findIdProduct) {
          // Gérer le cas où aucun produit n'est trouvé
          console.log("Produit introuvable");
          return;
        }
        const { id, pageName } = findIdProduct;
        console.log(pageName, "📎 Lien Facebook end traitement");
        console.log(id, "📎 Lien Facebook end traitement");
        await sendProductByFacebookId(clientInstance, senderId, id);
      }
      return;
    }

    // Traitement groupe
    if (message.isGroupMsg) {
      console.log("📛 Message de groupe reçu, traitement spécifique à faire");
      // TODO: traitement groupe
      return;
    }

    // Traitement FAQ
    const faqResult = await handleFaq(clientInstance, senderId, cleanText);
    if (faqResult) {
      console.log("✅ Réponse FAQ envoyée");
      return;
    }

    // Traitement Produits
    const productResult = await handleProducts(
      clientInstance,
      senderId,
      cleanText
    );
    if (productResult) {
      console.log("✅ Réponse produit envoyée");
      return;
    }

    console.log("❌ Aucun traitement applicable pour ce message");
  } catch (err) {
    console.error("❌ Erreur dans handleIncomingMessage:", err);
  }
};
