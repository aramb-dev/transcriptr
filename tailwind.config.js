/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "475px",
        touch: { raw: "(pointer: coarse)" },
        mouse: { raw: "(pointer: fine)" },
        mobile: { max: "767px" },
        tablet: { min: "768px", max: "1023px" },
        desktop: { min: "1024px" },
      },
      spacing: {
        touch: "44px", // Minimum touch target size (44px recommended)
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
    },
    fontFamily: {
      sans: ['"Space Grotesk"', "sans-serif"],
    },
    colors: {
      border: "var(--color-border)",
      input: "var(--color-input)",
      ring: "var(--color-ring)",
      background: "var(--color-background)",
      foreground: "var(--color-foreground)",
      primary: {
        DEFAULT: "var(--color-primary)",
        foreground: "var(--color-primary-foreground)",
      },
      secondary: {
        DEFAULT: "var(--color-secondary)",
        foreground: "var(--color-secondary-foreground)",
      },
      destructive: {
        DEFAULT: "var(--color-destructive)",
      },
      muted: {
        DEFAULT: "var(--color-muted)",
        foreground: "var(--color-muted-foreground)",
      },
      accent: {
        DEFAULT: "var(--color-accent)",
        foreground: "var(--color-accent-foreground)",
      },
      popover: {
        DEFAULT: "var(--color-popover)",
        foreground: "var(--color-popover-foreground)",
      },
      card: {
        DEFAULT: "var(--color-card)",
        foreground: "var(--color-card-foreground)",
      },
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
    keyframes: {
      "accordion-down": {
        from: { height: "0" },
        to: { height: "var(--radix-accordion-content-height)" },
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: "0" },
      },
      "pulse-dot-1": {
        "0%, 100%": { transform: "scale(1)", opacity: "1" },
        "50%": { transform: "scale(0.8)", opacity: "0.7" },
      },
      "pulse-dot-2": {
        "0%, 100%": { transform: "scale(1)", opacity: "1" },
        "50%": { transform: "scale(0.8)", opacity: "0.7" },
      },
      "pulse-dot-3": {
        "0%, 100%": { transform: "scale(1)", opacity: "1" },
        "50%": { transform: "scale(0.8)", opacity: "0.7" },
      },
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
      "pulse-dot-1": "pulse-dot-1 1.2s infinite ease-in-out",
      "pulse-dot-2": "pulse-dot-2 1.2s infinite ease-in-out 0.2s",
      "pulse-dot-3": "pulse-dot-3 1.2s infinite ease-in-out 0.4s",
    },
  },
  plugins: [
    // Typography plugin might need updating for v4
  ],
};
