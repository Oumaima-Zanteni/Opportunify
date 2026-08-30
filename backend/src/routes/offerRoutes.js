import { Router } from "express";
import {
  listOffers,
  getOffer,
  createOffer,
  offerRules,
  updateOffer,
  deleteOffer,
  myOffers,
} from "../controllers/offerController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", listOffers);
router.get("/me", protect, authorize("recruiter", "admin"), myOffers);
router.get("/:id", getOffer);
router.post("/", protect, authorize("recruiter", "admin"), offerRules, createOffer);
router.put("/:id", protect, authorize("recruiter", "admin"), offerRules, updateOffer);
router.delete("/:id", protect, authorize("recruiter", "admin"), deleteOffer);

export default router;
