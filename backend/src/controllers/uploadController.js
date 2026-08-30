import fs from "fs";
import path from "path";
import { RESUMES_DIR } from "../middleware/upload.js";

// POST /api/uploads/resume - upload d'un CV (PDF / DOC / DOCX)
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }
    const url = `/uploads/resumes/${req.file.filename}`;
    res.status(201).json({
      url,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/uploads/resume/:filename - supprime un fichier uploadé
export const deleteResume = async (req, res, next) => {
  try {
    const { filename } = req.params;
    // Protection contre le path traversal
    const safeName = path.basename(filename || "");
    if (!safeName) {
      return res.status(400).json({ message: "Nom de fichier invalide" });
    }
    const filePath = path.join(RESUMES_DIR, safeName);
    if (!filePath.startsWith(RESUMES_DIR)) {
      return res.status(400).json({ message: "Nom de fichier invalide" });
    }
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
    res.json({ message: "Fichier supprimé" });
  } catch (err) {
    next(err);
  }
};
