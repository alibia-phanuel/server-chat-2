import fs from "fs";
import path from "path";

const saveImageLocally = async (
  buffer: Buffer,
  mediaId: string
): Promise<string> => {
  const dir = path.resolve(__dirname, "../public/images/messages");

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = `${mediaId}.jpg`;
  const fullPath = path.join(dir, filename);

  fs.writeFileSync(fullPath, buffer);

  // Chemin relatif utilisé dans la base de données
  return `/images/messages/${filename}`;
};
