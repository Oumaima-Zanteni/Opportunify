import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: { type: String, maxlength: 5000, default: "" },
    resumeUrl: { type: String, default: "" },
    resumeName: { type: String, default: "" },
    expectedSalary: { type: Number, default: 0 },
    availability: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
    recruiterNote: { type: String, default: "" },
  },
  { timestamps: true }
);

applicationSchema.index({ offer: 1, candidate: 1 }, { unique: true });

export const Application = mongoose.model("Application", applicationSchema);
export default Application;
