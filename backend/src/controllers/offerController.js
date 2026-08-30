import { body, validationResult } from "express-validator";
import Offer from "../models/Offer.js";
import Application from "../models/Application.js";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

export const offerRules = [
  body("title").trim().notEmpty().withMessage("Titre requis"),
  body("company").trim().notEmpty().withMessage("Entreprise requise"),
  body("description").trim().notEmpty().withMessage("Description requise"),
  body("type").isIn(["emploi", "stage", "alternance", "freelance"]),
  body("category").optional().isIn(["tech","marketing","finance","design","rh","vente","logistique","autre"]),
  body("experienceLevel").optional().isIn(["debutant","junior","confirme","senior","expert"]),
];

// GET /api/offers - recherche + filtres + pagination
export const listOffers = async (req, res, next) => {
  try {
    const {
      q,
      type,
      category,
      location,
      remote,
      experienceLevel,
      salaryMin,
      salaryMax,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 12,
      recruiter,
    } = req.query;

    const filter = { status: "active" };
    if (recruiter) filter.recruiter = recruiter;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (remote === "true") filter.remote = true;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (salaryMin) filter.salaryMin = { $gte: Number(salaryMin) };
    if (salaryMax) filter.salaryMax = { $lte: Number(salaryMax) };
    if (q) {
      filter.$text = { $search: q };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOption = {};
    if (sort === "salary") {
      sortOption.salaryMax = order === "asc" ? 1 : -1;
    } else if (sort === "views") {
      sortOption.views = order === "asc" ? 1 : -1;
    } else {
      sortOption.createdAt = order === "asc" ? 1 : -1;
    }

    const [offers, total] = await Promise.all([
      Offer.find(filter).sort(sortOption).skip(skip).limit(Number(limit)).populate("recruiter", "firstName lastName company avatarUrl"),
      Offer.countDocuments(filter),
    ]);

    res.json({
      offers,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/offers/:id
export const getOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("recruiter", "firstName lastName company avatarUrl email phone");
    if (!offer) return res.status(404).json({ message: "Offre introuvable" });
    res.json({ offer });
  } catch (err) {
    next(err);
  }
};

// POST /api/offers (recruteur)
export const createOffer = async (req, res, next) => {
  try {
    if (validate(req, res)) return;
    const offer = await Offer.create({
      ...req.body,
      recruiter: req.user._id,
      company: req.body.company || req.user.company,
      contactEmail: req.body.contactEmail || req.user.email,
    });
    res.status(201).json({ offer });
  } catch (err) {
    next(err);
  }
};

// PUT /api/offers/:id (owner recruteur ou admin)
export const updateOffer = async (req, res, next) => {
  try {
    if (validate(req, res)) return;
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offre introuvable" });
    if (offer.recruiter.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Non autorisé" });
    }
    const allowed = [
      "title","company","description","type","category","location","remote",
      "salaryMin","salaryMax","currency","skills","experienceLevel","deadline",
      "contactEmail","status",
    ];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) offer[k] = req.body[k];
    });
    await offer.save();
    res.json({ offer });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/offers/:id
export const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offre introuvable" });
    if (offer.recruiter.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Non autorisé" });
    }
    await offer.deleteOne();
    await Application.deleteMany({ offer: offer._id });
    res.json({ message: "Offre supprimée" });
  } catch (err) {
    next(err);
  }
};

// GET /api/offers/me - offres du recruteur connecté
export const myOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
    const withStats = await Promise.all(
      offers.map(async (o) => {
        const count = await Application.countDocuments({ offer: o._id });
        return { ...o.toObject(), applicationsCount: count };
      })
    );
    res.json({ offers: withStats });
  } catch (err) {
    next(err);
  }
};
