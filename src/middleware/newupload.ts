import multer from "multer";
import path from "path";

// Dossier de stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // dossier uploads à la racine
  },
  filename: function (req, file, cb) {
    // Ex: image-1625097600000.png
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Filtrage des fichiers (seulement images)
function fileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Seules les images sont acceptées !"));
}

const upload = multer({ storage, fileFilter });

export default upload;
