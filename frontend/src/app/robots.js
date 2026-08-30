export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/profile", "/messages", "/applications", "/cv"],
    },
    sitemap: "https://opportunify.fr/sitemap.xml",
  };
}
