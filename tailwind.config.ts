import tailwindcssAnimate from "tailwindcss-animate";
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
          "plank-face": "hsl(var(--shelf-plank-face))",
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
        "typewriter-roll": {
          "0%": { opacity: "0", transform: "translateY(40px) scale(0.92)" },
          "40%": { opacity: "1", transform: "translateY(-4px) scale(1.01)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "cube-drop": {
          "0%": { transform: "translateY(-150px) rotate(-25deg)", opacity: "0" },
          "15%": { opacity: "1" },
          "70%": { transform: "translateY(5px) rotate(8deg)" },
          "85%": { transform: "translateY(-3px) rotate(-3deg)" },
          "100%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
        },
        "whiskey-ripple": {
          "0%": { transform: "scaleX(1)" },
          "30%": { transform: "scaleX(1.04) translateY(-2px)" },
          "100%": { transform: "scaleX(1)" },
        },
        "glass-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-8px) rotate(-2deg)" },
          "40%, 80%": { transform: "translateX(8px) rotate(2deg)" },
        },
        "door-open": {
          "0%": { transform: "perspective(1400px) rotateY(0deg)" },
          "100%": { transform: "perspective(1400px) rotateY(-82deg)" },
        },
        "neon-flicker": {
          "0%, 18%, 22%, 25%, 53%, 57%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: "0.35" },
        },
        "glass-left": {
          "0%": { transform: "translateX(-60vw) rotate(-25deg)", opacity: "0" },
          "45%": { transform: "translateX(-14px) rotate(14deg)", opacity: "1" },
          "52%": { transform: "translateX(-4px) rotate(20deg)" },
          "62%": { transform: "translateX(-16px) rotate(14deg)" },
          "85%": { transform: "translateX(-16px) rotate(14deg)", opacity: "1" },
          "100%": { transform: "translateX(-16px) rotate(14deg) translateY(-20px)", opacity: "0" },
        },
        "glass-right": {
          "0%": { transform: "translateX(60vw) rotate(25deg) scaleX(-1)", opacity: "0" },
          "45%": { transform: "translateX(14px) rotate(-14deg) scaleX(-1)", opacity: "1" },
          "52%": { transform: "translateX(4px) rotate(-20deg) scaleX(-1)" },
          "62%": { transform: "translateX(16px) rotate(-14deg) scaleX(-1)" },
          "85%": { transform: "translateX(16px) rotate(-14deg) scaleX(-1)", opacity: "1" },
          "100%": { transform: "translateX(16px) rotate(-14deg) scaleX(-1) translateY(-20px)", opacity: "0" },
        },
        "sparkle-burst": {
          "0%, 48%": { transform: "translate(0, 0) scale(0)", opacity: "0" },
          "52%": { opacity: "1" },
          "100%": { transform: "translate(var(--dx), var(--dy)) scale(1)", opacity: "0" },
        },
        "cheers-text": {
          "0%, 50%": { transform: "translateY(16px) scale(0.9)", opacity: "0" },
          "62%": { transform: "translateY(0) scale(1.04)", opacity: "1" },
          "85%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-8px)", opacity: "0" },
        },
        "bubble-rise": {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "20%": { opacity: "0.9" },
          "100%": { transform: "translateY(-46px)", opacity: "0" },
        },
        "candle": {
          "0%, 100%": { opacity: "0.85", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
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
        "typewriter-roll": "typewriter-roll 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "blink": "blink 0.8s step-end infinite",
        "cube-drop": "cube-drop 0.55s cubic-bezier(0.3, 0.7, 0.4, 1) forwards",
        "whiskey-ripple": "whiskey-ripple 0.5s ease-out",
        "glass-shake": "glass-shake 0.5s ease-in-out",
        "door-open": "door-open 1.1s cubic-bezier(0.65, 0, 0.35, 1) forwards",
        "neon-flicker": "neon-flicker 4s linear infinite",
        "candle": "candle 3s ease-in-out infinite",
        "glass-left": "glass-left 2.8s cubic-bezier(0.3, 0.8, 0.3, 1) forwards",
        "glass-right": "glass-right 2.8s cubic-bezier(0.3, 0.8, 0.3, 1) forwards",
        "sparkle-burst": "sparkle-burst 2.8s ease-out forwards",
        "cheers-text": "cheers-text 2.8s ease-out forwards",
        "bubble-rise": "bubble-rise 1.2s ease-in infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
