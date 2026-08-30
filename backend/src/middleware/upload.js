import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/uploads/resumes
export const UPLOADS_ROOT = path.resolve(__dirname, "../../uploads");
export const RESUMES_DIR = path.join(UPLOADS_ROOT, "resumes");

// Le dossier doit exister avant que multer n'écrive dedans
fs.mkdirSync(RESUMES_DIR, { recursive: true });

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ALLOWED_MIMETYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Certains navigateurs / OS envoient un mimetype vide ou générique
  "application/octet-stream",
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, RESUMES_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    cb(null, `cv-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error("Format non autorisé : seuls les fichiers PDF, DOC et DOCX sont acceptés"));
  }
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    return cb(new Error("Type de fichier non autorisé : seuls les PDF, DOC et DOCX sont acceptés"));
  }
  cb(null, true);
};

export const resumeUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

// Enveloppe multer pour renvoyer des messages d'erreur propres en français
export const uploadResumeFile = (req, res, next) => {
  resumeUpload.single("file")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Fichier trop volumineux (5 Mo maximum)" });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ message: "Champ de fichier inattendu (utilisez « file »)" });
      }
      return res.status(400).json({ message: `Erreur d'upload : ${err.message}` });
    }
    return res.status(400).json({ message: err.message || "Erreur d'upload" });
  });
};

export default resumeUpload;
