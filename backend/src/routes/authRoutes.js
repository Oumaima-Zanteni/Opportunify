import { Router } from "express";
import {
  register,
  registerRules,
  login,
  loginRules,
  getMe,
  updateProfile,
  updateProfileRules,
  changePassword,
  changePasswordRules,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/register", registerRules, register);
router.post("/login", loginRules, login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfileRules, updateProfile);
router.put("/password", protect, changePasswordRules, changePassword);

export default router;
