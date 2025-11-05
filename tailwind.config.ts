import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./content/**/*.json",
    "./styles/**/*.css"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        sm: "1.5rem",
        lg: "2rem"
      },
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        background: "var(--surface-background)",
        surface: "var(--surface-card)",
        midnight: "var(--color-midnight)",
        bluewhale: "var(--color-bluewhale)",
        lagoon: "var(--color-lagoon)",
        persian: "var(--color-persian)",
        sherpa: "var(--color-sherpa)",
        alabaster: "var(--color-alabaster)",
        white: "var(--color-white)",
        outline: "rgba(3, 42, 71, 0.12)",
        slate: {
          300: "rgba(3, 42, 71, 0.32)",
          400: "rgba(3, 42, 71, 0.48)",
          500: "rgba(3, 42, 71, 0.64)",
          600: "rgba(3, 42, 71, 0.78)",
          700: "rgba(3, 42, 71, 0.88)"
        }
      },
      fontFamily: {
        sans: ["var(--font-family-sans)", "sans-serif"],
        display: ["var(--font-family-display)", "sans-serif"]
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)"
      },
      boxShadow: {
        s: "var(--shadow-s)",
        m: "var(--shadow-m)",
        l: "var(--shadow-l)",
        xl: "var(--shadow-xl)"
      },
      transitionTimingFunction: {
        entrance: "var(--motion-ease-entrance)",
        exit: "var(--motion-ease-exit)"
      },
      transitionDuration: {
        150: "var(--motion-duration-150)",
        220: "var(--motion-duration-220)",
        320: "var(--motion-duration-320)",
        420: "var(--motion-duration-420)"
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at 20% 20%, rgba(2, 120, 139, 0.18), transparent 55%), radial-gradient(circle at 80% 10%, rgba(1, 173, 167, 0.16), transparent 60%), linear-gradient(180deg, rgba(3, 42, 71, 0.94), rgba(3, 42, 71, 0.88))"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      animation: {
        "fade-up": "fade-up var(--motion-duration-320) var(--motion-ease-entrance)",
        "slide-up": "slide-up var(--motion-duration-320) var(--motion-ease-entrance)",
        "scale-in": "scale-in var(--motion-duration-220) var(--motion-ease-entrance)"
      }
    }
  },
  safelist: ["card-surface", "hairline-top", "grid-responsive"],
  plugins: [tailwindcssAnimate]
};

export default config;

