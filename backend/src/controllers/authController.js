import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { generateToken } from "../config/jwt.js";

const runValidations = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
};

export const registerRules = [
  body("firstName").trim().notEmpty().withMessage("Prénom requis"),
  body("lastName").trim().notEmpty().withMessage("Nom requis"),
  body("email").isEmail().withMessage("Email invalide"),
  body("password").isLength({ min: 6 }).withMessage("Mot de passe min 6 caractères"),
  body("role").isIn(["jobseeker", "recruiter"]).withMessage("Rôle invalide"),
];

export const register = async (req, res, next) => {
  try {
    if (runValidations(req, res)) return;
    const { firstName, lastName, email, password, role, company, title, phone, location } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      company: role === "recruiter" ? company : undefined,
      title,
      phone,
      location,
    });

    const token = generateToken(user);
    res.status(201).json({ user: user.toPublicJSON(), token });
  } catch (err) {
    next(err);
  }
};

export const loginRules = [
  body("email").isEmail().withMessage("Email invalide"),
  body("password").notEmpty().withMessage("Mot de passe requis"),
];

export const login = async (req, res, next) => {
  try {
    if (runValidations(req, res)) return;
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Compte désactivé" });
    }
    const token = generateToken(user);
    res.json({ user: user.toPublicJSON(), token });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

export const updateProfileRules = [
  body("firstName").optional().trim().notEmpty(),
  body("lastName").optional().trim().notEmpty(),
  body("email").optional().isEmail(),
  body("password").optional().isLength({ min: 6 }),
];

export const updateProfile = async (req, res, next) => {
  try {
    if (runValidations(req, res)) return;
    const allowed = [
      "firstName",
      "lastName",
      "email",
      "password",
      "company",
      "title",
      "phone",
      "location",
      "bio",
      "avatarUrl",
      "skills",
      "resumeUrl",
      "resumeName",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.email) {
      const conflict = await User.findOne({ email: updates.email, _id: { $ne: req.user._id } });
      if (conflict) {
        return res.status(409).json({ message: "Email déjà utilisé" });
      }
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

export const changePasswordRules = [
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 6 }),
];

export const changePassword = async (req, res, next) => {
  try {
    if (runValidations(req, res)) return;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Mot de passe mis à jour" });
  } catch (err) {
    next(err);
  }
};
