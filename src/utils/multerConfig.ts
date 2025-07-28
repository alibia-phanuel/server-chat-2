import multer from "multer";
import path from "path";
import fs from "fs";

// Définir le dossier où stocker les images
const uploadDir = path.join(__dirname, "../../public/images/products/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Configuration Multer avec une limite de 5 fichiers
const upload = multer({ storage });

export default upload;
