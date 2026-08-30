/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fdf2f2",
          100: "#fbe5e5",
          200: "#f5c5c5",
          300: "#ec9494",
          400: "#d94a4a",
          500: "#bf0808", // rouge vif
          600: "#910d0d", // rouge profond
          700: "#7a0a0a",
          800: "#660808",
          900: "#520606",
          950: "#2e0303",
        },
        ink: {
          DEFAULT: "#000000",
          soft: "#1a1a1a",
          muted: "#474747",
        },
        cream: {
          DEFAULT: "#f0e4e4",
          soft: "#f7eeee",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
        cardHover: "0 8px 30px rgba(145,13,13,0.15), 0 2px 8px rgba(0,0,0,0.08)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-14px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "gradient-x": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.15", transform: "scale(1)" },
          "50%": { opacity: "0.65", transform: "scale(1.2)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "reveal-up": {
          "0%": { opacity: "0", transform: "translateY(40px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "reveal-left": {
          "0%": { opacity: "0", transform: "translateX(-50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "reveal-right": {
          "0%": { opacity: "0", transform: "translateX(50px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "60%": { opacity: "1", transform: "scale(1.05)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "tilt": {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "aurora": {
          "0%": { backgroundPosition: "0% 50%", transform: "rotate(0deg) scale(1)" },
          "50%": { backgroundPosition: "100% 50%", transform: "rotate(180deg) scale(1.2)" },
          "100%": { backgroundPosition: "0% 50%", transform: "rotate(360deg) scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.7s ease-out",
        "slide-in": "slide-in 0.5s ease-out",
        "float": "float 3.5s ease-in-out infinite",
        "gradient-x": "gradient-x 4s ease infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "reveal-up": "reveal-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "reveal-left": "reveal-left 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "reveal-right": "reveal-right 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pop-in": "pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "tilt": "tilt 6s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
        "bounce-slow": "bounce-slow 2.5s ease-in-out infinite",
        "spin-slow": "spin-slow 18s linear infinite",
        "aurora": "aurora 12s ease infinite",
      },
    },
  },
  plugins: [],
};
