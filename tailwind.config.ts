import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        body: ['"Lora"', "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        book: {
          spine: "hsl(var(--book-spine))",
          "spine-edge": "hsl(var(--book-spine-edge))",
          "tan-dark": "hsl(var(--book-tan-dark))",
          paper: "hsl(var(--book-paper))",
          "paper-edge": "hsl(var(--book-paper-edge))",
          "paper-line": "hsl(var(--book-paper-line))",
        },
        shelf: {
          wood: "hsl(var(--shelf-wood))",
          plank: "hsl(var(--shelf-plank))",
          "plank-dark": "hsl(var(--shelf-plank-dark))",
          highlight: "hsl(var(--shelf-highlight))",
          bracket: "hsl(var(--shelf-bracket))",
        },
        clock: {
          wood: "hsl(var(--clock-wood))",
          "wood-dark": "hsl(var(--clock-wood-dark))",
          face: "hsl(var(--clock-face))",
          bezel: "hsl(var(--clock-bezel))",
          hand: "hsl(var(--clock-hand))",
          numeral: "hsl(var(--clock-numeral))",
          trim: "hsl(var(--clock-trim))",
          accent: "hsl(var(--clock-accent))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "paper-unfold": {
          "0%": {
            transform: "scaleY(0) scaleX(0.7)",
            opacity: "0",
          },
          "50%": {
            transform: "scaleY(1) scaleX(0.7)",
            opacity: "1",
          },
          "100%": {
            transform: "scaleY(1) scaleX(1)",
            opacity: "1",
          },
        },
        "paper-content": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "page-turn": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(-15deg)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pendulum": {
          "0%": { transform: "rotate(15deg)" },
          "50%": { transform: "rotate(-15deg)" },
          "100%": { transform: "rotate(15deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out",
        "paper-unfold": "paper-unfold 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "paper-content": "paper-content 0.4s ease-out 0.35s forwards",
        "page-turn": "page-turn 0.4s ease-out forwards",
        "float": "float 3s ease-in-out infinite",
        "pendulum": "pendulum 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
