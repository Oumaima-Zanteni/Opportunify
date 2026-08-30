export const OFFER_TYPES = [
  { value: "emploi", label: "Emploi" },
  { value: "stage", label: "Stage" },
  { value: "alternance", label: "Alternance" },
  { value: "freelance", label: "Freelance" },
];

export const CATEGORIES = [
  { value: "tech", label: "Tech / IT" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "design", label: "Design" },
  { value: "rh", label: "Ressources Humaines" },
  { value: "vente", label: "Vente" },
  { value: "logistique", label: "Logistique" },
  { value: "autre", label: "Autre" },
];

export const EXPERIENCE_LEVELS = [
  { value: "debutant", label: "Débutant" },
  { value: "junior", label: "Junior" },
  { value: "confirme", label: "Confirmé" },
  { value: "senior", label: "Senior" },
  { value: "expert", label: "Expert" },
];

export const APPLICATION_STATUS = {
  pending: { label: "En attente", color: "amber" },
  reviewed: { label: "Examinée", color: "blue" },
  accepted: { label: "Acceptée", color: "green" },
  rejected: { label: "Refusée", color: "red" },
  withdrawn: { label: "Retirée", color: "neutral" },
};

export const STATUS_LIST = ["pending", "reviewed", "accepted", "rejected", "withdrawn"];

export function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(date) {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `il y a ${d} j`;
  return formatDate(date);
}

export function formatSalary(min, max, currency = "EUR") {
  const sym = { EUR: "€", USD: "$", GBP: "£" }[currency] || currency;
  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n);
  if (min && max) return `${fmt(min)} - ${fmt(max)} ${sym}`;
  if (min) return `dès ${fmt(min)} ${sym}`;
  if (max) return `jusqu'à ${fmt(max)} ${sym}`;
  return "Non précisé";
}

export function initials(first = "", last = "") {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}
