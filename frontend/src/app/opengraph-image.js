import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Opportunify — Connectez talents et opportunités";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Halos */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(191,8,8,0.25), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(145,13,13,0.2), transparent 70%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "linear-gradient(135deg, #910d0d, #bf0808)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 900,
              color: "white",
            }}
          >
            O
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "white",
            }}
          >
            Opportun<span style={{ color: "#bf0808" }}>ify</span>
          </div>
        </div>

        {/* Titre */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          Connectez talents et{" "}
          <span style={{ color: "#bf0808" }}>opportunités</span>
        </div>

        {/* Sous-titre */}
        <div
          style={{
            marginTop: 24,
            fontSize: 24,
            color: "#474747",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Emplois, stages et alternances. Publiez, postulez, suivez vos candidatures.
        </div>

        {/* Badge */}
        <div
          style={{
            marginTop: 32,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            borderRadius: 999,
            background: "rgba(191,8,8,0.15)",
            border: "1px solid rgba(191,8,8,0.3)",
            fontSize: 16,
            fontWeight: 600,
            color: "#ec9494",
          }}
        >
          Plateforme de recrutement moderne
        </div>
      </div>
    ),
    { ...size }
  );
}
