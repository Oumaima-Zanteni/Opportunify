export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Erreur serveur";
  if (process.env.NODE_ENV !== "production") {
    console.error("🔥", err);
  }
  res.status(status).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route introuvable : ${req.originalUrl}` });
};
