import Resume from "../models/Resume.js";

const EDITABLE_FIELDS = [
  "firstName",
  "lastName",
  "title",
  "email",
  "phone",
  "location",
  "linkedin",
  "github",
  "portfolio",
  "summary",
  "experiences",
  "education",
  "skills",
  "languages",
  "certifications",
];

const sanitize = (body = {}) => {
  const updates = {};
  for (const key of EDITABLE_FIELDS) {
    if (body[key] === undefined) continue;
    if (["experiences", "education", "languages", "certifications", "skills"].includes(key)) {
      updates[key] = Array.isArray(body[key]) ? body[key] : [];
    } else {
      updates[key] = body[key];
    }
  }
  return updates;
};

// GET /api/resume/me - récupère le CV du candidat connecté
export const getMyResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    res.json({ resume: resume || null });
  } catch (err) {
    next(err);
  }
};

// PUT /api/resume/me - crée ou met à jour le CV du candidat connecté
export const saveResume = async (req, res, next) => {
  try {
    const updates = sanitize(req.body);
    const resume = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates, $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ resume });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/resume/me - supprime le CV du candidat connecté
export const deleteMyResume = async (req, res, next) => {
  try {
    await Resume.findOneAndDelete({ user: req.user._id });
    res.json({ message: "CV supprimé" });
  } catch (err) {
    next(err);
  }
};

// GET /api/resume/user/:userId - consultation par le recruteur (candidature liée)
export const getResumeByUser = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ user: req.params.userId });
    res.json({ resume: resume || null });
  } catch (err) {
    next(err);
  }
};
