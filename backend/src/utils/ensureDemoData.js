import User from "../models/User.js";
import Offer from "../models/Offer.js";

export const ensureDemoData = async () => {
  if ((await User.countDocuments()) > 0) return;

  console.log("🌱 Base vide, création des comptes de démo...");
  const recruiter = await User.create({
    firstName: "Sophie",
    lastName: "Martin",
    email: "recruteur@opportunify.fr",
    password: "password123",
    role: "recruiter",
    company: "TechCorp",
    title: "Talent Acquisition Manager",
    location: "Paris, France",
  });

  await User.create({
    firstName: "Alex",
    lastName: "Dubois",
    email: "candidat@opportunify.fr",
    password: "password123",
    role: "jobseeker",
    title: "Développeur Full-Stack",
    location: "Lyon, France",
    skills: ["JavaScript", "React", "Node.js", "MongoDB"],
  });

  await Offer.insertMany([
    {
      recruiter: recruiter._id,
      company: "TechCorp",
      title: "Développeur Full-Stack React/Node",
      description:
        "Nous recherchons un développeur full-stack passionné pour rejoindre notre équipe produit sur des applications Next.js et Node.js modernes.",
      type: "emploi",
      category: "tech",
      location: "Paris, France",
      remote: true,
      salaryMin: 38000,
      salaryMax: 52000,
      skills: ["React", "Node.js", "MongoDB", "TypeScript"],
      experienceLevel: "junior",
      contactEmail: "recruteur@opportunify.fr",
    },
    {
      recruiter: recruiter._id,
      company: "TechCorp",
      title: "Alternance - UX/UI Designer",
      description:
        "Alternance en design produit. Vous créerez des maquettes Figma et participerez au design system.",
      type: "alternance",
      category: "design",
      location: "Lyon, France",
      remote: true,
      salaryMin: 800,
      salaryMax: 1200,
      skills: ["Figma", "Design system", "Prototypage"],
      experienceLevel: "debutant",
      contactEmail: "recruteur@opportunify.fr",
    },
  ]);

  // console.log("✅ Comptes de démo : recruteur@opportunify.fr / candidat@opportunify.fr (password123)");
};
