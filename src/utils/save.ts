import fs from "fs";
import path from "path";

// Exemple de fonction pour sauvegarder une image base64 dans public
const saveBase64Image = (base64: string, filename: string) => {
  const base64Data = base64.replace(/^data:image\/png;base64,/, "");
  const filePath = path.join(__dirname, "public", filename);
  fs.writeFileSync(filePath, base64Data, "base64");
  return `/public/${filename}`; // URL relative pour l'accès
};
