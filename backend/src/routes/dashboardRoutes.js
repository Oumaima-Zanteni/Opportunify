import { Router } from "express";
import { recruiterDashboard, jobseekerDashboard } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/recruiter", protect, authorize("recruiter", "admin"), recruiterDashboard);
router.get("/jobseeker", protect, authorize("jobseeker"), jobseekerDashboard);

export default router;
