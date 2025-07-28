import multer from "multer";
import path from "path";
import fs from "fs";

// 📁 Nouveau chemin vers le dossier public/images/messages

const uploadDir = path.join(__dirname, "../../public/images/messages/");
// 📁 Création du dossier s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Types MIME autorisés (images seulement)
const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "_");

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  },
});

// 🔐 Filtre pour autoriser uniquement les images
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers image sont autorisés."));
  }
};

// 🎯 Export de l'uploader avec filtrage et limite
export const upload = multer({
  storage,
  limits: { files: 10 },
  fileFilter,
});
