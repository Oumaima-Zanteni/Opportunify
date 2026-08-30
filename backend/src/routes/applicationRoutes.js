import { Router } from "express";
import {
  apply,
  applyRules,
  myApplications,
  recruiterApplications,
  updateStatus,
  updateStatusRules,
  getApplication,
} from "../controllers/applicationController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, authorize("jobseeker"), applyRules, apply);
router.get("/me", protect, authorize("jobseeker"), myApplications);
router.get("/recruiter", protect, authorize("recruiter", "admin"), recruiterApplications);
router.get("/:id", protect, getApplication);
router.patch("/:id/status", protect, updateStatusRules, updateStatus);

export default router;
