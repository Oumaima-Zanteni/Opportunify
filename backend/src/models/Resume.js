import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    position: { type: String, trim: true, default: "" },
    company: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    startDate: { type: String, trim: true, default: "" },
    endDate: { type: String, trim: true, default: "" },
    current: { type: Boolean, default: false },
    description: { type: String, trim: true, default: "", maxlength: 3000 },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true, default: "" },
    school: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    startDate: { type: String, trim: true, default: "" },
    endDate: { type: String, trim: true, default: "" },
    current: { type: Boolean, default: false },
    description: { type: String, trim: true, default: "", maxlength: 3000 },
  },
  { _id: false }
);

const languageSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    level: { type: String, trim: true, default: "Intermédiaire" },
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    issuer: { type: String, trim: true, default: "" },
    date: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "", maxlength: 2000 },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    github: { type: String, trim: true, default: "" },
    portfolio: { type: String, trim: true, default: "" },
    summary: { type: String, trim: true, default: "", maxlength: 3000 },
    experiences: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    skills: [{ type: String, trim: true }],
    languages: { type: [languageSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;
