import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Email invalide"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["jobseeker", "recruiter", "admin"],
      required: true,
      default: "jobseeker",
    },
    company: { type: String, trim: true }, // pour recruteurs
    title: { type: String, trim: true }, // poste actuel / intitulé
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 1000 },
    avatarUrl: { type: String, default: "" },
    skills: [{ type: String, trim: true }],
    resumeUrl: { type: String, default: "" }, // CV par défaut du candidat
    resumeName: { type: String, default: "" }, // nom d'origine du fichier CV
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: `${this.firstName} ${this.lastName}`,
    email: this.email,
    role: this.role,
    company: this.company,
    title: this.title,
    phone: this.phone,
    location: this.location,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    skills: this.skills,
    resumeUrl: this.resumeUrl,
    resumeName: this.resumeName,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model("User", userSchema);
export default User;
