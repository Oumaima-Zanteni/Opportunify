import { Router } from "express";
import { uploadResume, deleteResume } from "../controllers/uploadController.js";
import { uploadResumeFile } from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/resume", protect, uploadResumeFile, uploadResume);
router.delete("/resume/:filename", protect, deleteResume);

export default router;
