import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 5000 },
    type: {
      type: String,
      enum: ["emploi", "stage", "alternance", "freelance"],
      required: true,
      default: "emploi",
    },
    category: {
      type: String,
      enum: [
        "tech",
        "marketing",
        "finance",
        "design",
        "rh",
        "vente",
        "logistique",
        "autre",
      ],
      default: "autre",
    },
    location: { type: String, trim: true, default: "" },
    remote: { type: Boolean, default: false },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    currency: { type: String, default: "EUR" },
    skills: [{ type: String, trim: true }],
    experienceLevel: {
      type: String,
      enum: ["debutant", "junior", "confirme", "senior", "expert"],
      default: "junior",
    },
    deadline: { type: Date },
    contactEmail: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active",
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

offerSchema.index({
  title: "text",
  description: "text",
  company: "text",
  location: "text",
});

export const Offer = mongoose.model("Offer", offerSchema);
export default Offer;
