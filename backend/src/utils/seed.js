import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Offer from "../models/Offer.js";
import Application from "../models/Application.js";

dotenv.config();

const seed = async () => {
  await connectDB();
  console.log("🧹 Nettoyage...");
  await User.deleteMany({});
  await Offer.deleteMany({});
  await Application.deleteMany({});

  console.log("🌱 Création des utilisateurs...");
  const recruiter = await User.create({
    firstName: "Sophie",
    lastName: "Martin",
    email: "recruteur@opportunify.fr",
    password: "password123",
    role: "recruiter",
    company: "TechCorp",
    title: "Talent Acquisition Manager",
    phone: "+33 6 12 34 56 78",
    location: "Paris, France",
    bio: "Recruteuse passionnée dans la tech depuis 10 ans.",
  });

  const seeker = await User.create({
    firstName: "Alex",
    lastName: "Dubois",
    email: "candidat@opportunify.fr",
    password: "password123",
    role: "jobseeker",
    title: "Développeur Full-Stack",
    phone: "+33 6 98 76 54 32",
    location: "Lyon, France",
    skills: ["JavaScript", "React", "Node.js", "MongoDB", "TypeScript"],
    bio: "Développeur full-stack junior motivé, à la recherche d'opportunités en startup.",
  });

  console.log("🌱 Création des offres...");
  const offers = await Offer.insertMany([
    {
      recruiter: recruiter._id,
      company: "TechCorp",
      title: "Développeur Full-Stack React/Node",
      description:
        "Nous recherchons un développeur full-stack passionné pour rejoindre notre équipe produit. Vous travaillerez sur des applications Next.js et Node.js modernes, en collaboration avec une équipe agile.",
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
      title: "Stage - Assistant Marketing Digital",
      description:
        "Stage de 6 mois en marketing digital. Vous participerez à la stratégie SEO/SEM, à la gestion des réseaux sociaux et au contenu du blog.",
      type: "stage",
      category: "marketing",
      location: "Paris, France",
      remote: false,
      salaryMin: 600,
      salaryMax: 900,
      skills: ["SEO", "Réseaux sociaux", "Copywriting"],
      experienceLevel: "debutant",
      contactEmail: "recruteur@opportunify.fr",
    },
    {
      recruiter: recruiter._id,
      company: "TechCorp",
      title: "Alternance - UX/UI Designer",
      description:
        "Alternance en design produit. Vous créerez des maquettes Figma, mènerez des tests utilisateurs et participerez au design system.",
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
    {
      recruiter: recruiter._id,
      company: "TechCorp",
      title: "Développeur Backend Senior Node.js",
      description:
        "Poste senior pour architecturer nos microservices Node.js et notre infrastructure AWS. Leadership technique attendu.",
      type: "emploi",
      category: "tech",
      location: "Remote France",
      remote: true,
      salaryMin: 65000,
      salaryMax: 85000,
      skills: ["Node.js", "AWS", "Microservices", "PostgreSQL", "Docker"],
      experienceLevel: "senior",
      contactEmail: "recruteur@opportunify.fr",
    },
  ]);

  console.log("🌱 Création d'une candidature exemple...");
  await Application.create({
    offer: offers[0]._id,
    candidate: seeker._id,
    recruiter: recruiter._id,
    coverLetter:
      "Madame, Monsieur,\n\nTrès intéressé par le poste de développeur full-stack, je souhaite vous soumettre ma candidature...\n\nCordialement,\nAlex Dubois",
    expectedSalary: 45000,
    availability: "Immédiate",
    status: "reviewed",
  });

  console.log("\n✅ Seed terminé !");
  console.log("─────────────────────────────────────");
  console.log("Recruteur  : recruteur@opportunify.fr / password123");
  console.log("Candidat   : candidat@opportunify.fr  / password123");
  console.log("─────────────────────────────────────\n");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Erreur seed :", err);
  process.exit(1);
});
