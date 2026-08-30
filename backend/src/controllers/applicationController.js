import { body, validationResult } from "express-validator";
import Application from "../models/Application.js";
import Offer from "../models/Offer.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

export const applyRules = [
  body("offerId").notEmpty().withMessage("Offre requise"),
  body("coverLetter").optional().isLength({ max: 5000 }),
  body("resumeUrl").optional().isString(),
  body("resumeName").optional().isString(),
];

// POST /api/applications - candidat postule
export const apply = async (req, res, next) => {
  try {
    if (validate(req, res)) return;
    const { offerId, coverLetter, resumeUrl, resumeName, expectedSalary, availability } = req.body;
    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Offre introuvable" });
    if (offer.status !== "active") {
      return res.status(400).json({ message: "Offre non disponible" });
    }
    if (offer.recruiter.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Vous ne pouvez pas postuler à votre propre offre" });
    }
    const existing = await Application.findOne({ offer: offerId, candidate: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "Vous avez déjà postulé à cette offre" });
    }
    const application = await Application.create({
      offer: offerId,
      candidate: req.user._id,
      recruiter: offer.recruiter,
      coverLetter,
      resumeUrl: resumeUrl || req.user.resumeUrl || "",
      resumeName: resumeName || (resumeUrl ? "" : req.user.resumeName || ""),
      expectedSalary,
      availability,
    });
    await application.populate([
      { path: "offer", select: "title company location type" },
      { path: "candidate", select: "firstName lastName email avatarUrl title" },
    ]);
    res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
};

// GET /api/applications/me - candidatures du candidat connecté
export const myApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .sort({ createdAt: -1 })
      .populate("offer", "title company location type status")
      .populate("recruiter", "firstName lastName company avatarUrl");
    res.json({ applications });
  } catch (err) {
    next(err);
  }
};

// GET /api/applications/recruiter - candidatures reçues par le recruteur
export const recruiterApplications = async (req, res, next) => {
  try {
    const { status, offerId } = req.query;
    const filter = { recruiter: req.user._id };
    if (status) filter.status = status;
    if (offerId) filter.offer = offerId;
    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .populate("offer", "title company location type")
      .populate("candidate", "firstName lastName email avatarUrl title skills location");
    res.json({ applications });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/applications/:id/status - recruteur met à jour le statut
export const updateStatusRules = [
  body("status").isIn(["pending","reviewed","accepted","rejected","withdrawn"]),
];

export const updateStatus = async (req, res, next) => {
  try {
    if (validate(req, res)) return;
    const { status, recruiterNote } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Candidature introuvable" });
    const isRecruiter = application.recruiter.toString() === req.user._id.toString();
    const isCandidate = application.candidate.toString() === req.user._id.toString();
    if (!isRecruiter && !isCandidate && req.user.role !== "admin") {
      return res.status(403).json({ message: "Non autorisé" });
    }
    // Candidat peut uniquement retirer sa candidature
    if (isCandidate && !isRecruiter && status !== "withdrawn") {
      return res.status(403).json({ message: "Action non autorisée pour le candidat" });
    }
    application.status = status;
    if (recruiterNote !== undefined) application.recruiterNote = recruiterNote;
    await application.save();
    await application.populate([
      { path: "offer", select: "title company location type" },
      { path: "candidate", select: "firstName lastName email avatarUrl" },
    ]);
    res.json({ application });
  } catch (err) {
    next(err);
  }
};

// GET /api/applications/:id
export const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("offer", "title company location type description")
      .populate("candidate", "firstName lastName email avatarUrl title skills location bio")
      .populate("recruiter", "firstName lastName company avatarUrl email");
    if (!application) return res.status(404).json({ message: "Candidature introuvable" });
    const isOwner =
      application.candidate._id.toString() === req.user._id.toString() ||
      application.recruiter._id.toString() === req.user._id.toString() ||
      req.user.role === "admin";
    if (!isOwner) return res.status(403).json({ message: "Non autorisé" });
    res.json({ application });
  } catch (err) {
    next(err);
  }
};
