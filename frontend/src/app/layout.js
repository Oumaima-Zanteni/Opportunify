import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://opportunify.fr"),
  title: {
    default: "Opportunify — Connectez talents et opportunités",
    template: "%s · Opportunify",
  },
  description:
    "Opportunify met en relation recruteurs et chercheurs d'emploi, stages et alternances. Publiez, postulez, suivez vos candidatures et échangez en direct.",
  keywords: [
    "recrutement",
    "emploi",
    "stage",
    "alternance",
    "freelance",
    "offre d'emploi",
    "recherche d'emploi",
    "candidature",
    "recruteur",
    "plateforme de recrutement",
    "opportunify",
  ],
  authors: [{ name: "Opportunify" }],
  creator: "Opportunify",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://opportunify.fr",
    siteName: "Opportunify",
    title: "Opportunify — Connectez talents et opportunités",
    description:
      "Emplois, stages et alternances. Publiez vos offres, postulez en un clic, suivez vos candidatures et échangez en direct.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opportunify — Connectez talents et opportunités",
    description:
      "Emplois, stages et alternances. Publiez, postulez, suivez vos candidatures et échangez en direct.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://opportunify.fr",
  },
  category: "emploi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "#000000",
                color: "#fff",
                fontSize: "14px",
                borderRadius: "10px",
                border: "1px solid #1a1a1a",
              },
              success: { iconTheme: { primary: "#bf0808", secondary: "#fff" } },
              error: { iconTheme: { primary: "#f43f5e", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
