import { Router } from "express";
import {
  getMyResume,
  saveResume,
  deleteMyResume,
  getResumeByUser,
} from "../controllers/resumeController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/me", protect, getMyResume);
router.put("/me", protect, authorize("jobseeker", "admin"), saveResume);
router.delete("/me", protect, authorize("jobseeker", "admin"), deleteMyResume);
router.get("/user/:userId", protect, authorize("recruiter", "admin"), getResumeByUser);

export default router;
