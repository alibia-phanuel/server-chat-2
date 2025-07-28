import dotenv from "dotenv";
import axios from "axios";
dotenv.config();
const Token = process.env.ACCESS_TOKEN;
const idPhoneNumber = process.env.WHATSAPP_PHONE_ID;
const url = `https://graph.facebook.com/v22.0/${idPhoneNumber}/messages`;

/**
 * Envoie un message WhatsApp basé sur un template prédéfini.
 */
export const sendTemplateWhatsAppMessage = async (
  to: string,
  templateName: string
) => {
  if (!url || !Token || !to) {
    console.error(
      "❌ Erreur : URL, Token ou numéro du destinataire manquant !"
    );
    return;
  }

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName, // Ex: "hello_world"
          language: { code: "en_US" },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Template message envoyé avec succès :", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de l'envoi du message :",
      error.response?.data || error.message
    );
  }
};
/**
 * Envoie un message texte simple via WhatsApp API.
 */
export const sendTextMessage = async (to: string, message: string) => {
  if (!url || !Token || !to) {
    console.error("❌ Erreur : URL, Token ou destinataire manquant !");
    return;
  }

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Message texte envoyé avec succès :", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de l'envoi du message :",
      error.response?.data || error.message
    );
  }
};

export const sendMediaMessage = async (
  to: string,
  link: string,
  caption?: string
) => {
  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "image",
        image: {
          link,
          caption: caption || "ceci est une images",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de l'envoi du média:",
      error.response?.data || error.message
    );
    throw new Error("Échec de l'envoi du message média.");
  }
};

/**
 * Répond à un message WhatsApp en citant un message existant.
 */
export const replyMessage = async (
  to: string,
  body: string,
  messageId: string
) => {
  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
        context: { message_id: messageId },
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Réponse envoyée avec succès :", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors de l'envoi de la réponse :",
      error.response?.data || error.message
    );
  }
};
