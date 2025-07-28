import axios from "axios";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid"; // ✅ Importation correcte
import dotenv from "dotenv";

dotenv.config();
export const downloadImageFromWhatsapp = async (
  mediaId: string
): Promise<string> => {
  const token = process.env.ACCESS_TOKEN;

  if (!token) {
    throw new Error("❌ Le token WhatsApp est undefined !");
  }

  try {
    // Étape 1 : Obtenir l'URL du fichier
    const mediaRes = await axios.get(
      `https://graph.facebook.com/v22.0/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const mediaUrl = mediaRes.data.url;

    // Étape 2 : Télécharger l’image
    const imageRes = await axios.get(mediaUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "arraybuffer",
    });

    // Étape 3 : Sauvegarder localement
    const fileName = `${uuidv4()}.jpg`;
    const imagePath = path.join("public/images/messages", fileName);
    fs.writeFileSync(imagePath, imageRes.data);

    return `/images/messages/${fileName}`;
  } catch (error: any) {
    console.error(
      "❌ Erreur lors du téléchargement de l'image :",
      error.message
    );
    throw error;
  }
};
