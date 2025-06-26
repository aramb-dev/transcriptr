/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Change this from 'media' to 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'], // Set Space Grotesk as the default sans font
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // Add explicit dark mode text colors for better control
        'dark-text': {
          primary: 'var(--dark-text-primary, #f3f4f6)',
          secondary: 'var(--dark-text-secondary, #d1d5db)',
          muted: 'var(--dark-text-muted, #9ca3af)',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        // You can add custom spacing values here if needed
      },
      // Add backdrop filter for glass effects
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
      // Add animation keyframes and utilities manually if needed
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
          "0%, 100%": { transform: 'scale(1)', opacity: '1' },
          "50%": { transform: 'scale(0.8)', opacity: '0.7' },
        },
        "pulse-dot-2": {
          "0%, 100%": { transform: 'scale(1)', opacity: '1' },
          "50%": { transform: 'scale(0.8)', opacity: '0.7' },
        },
        "pulse-dot-3": {
          "0%, 100%": { transform: 'scale(1)', opacity: '1' },
          "50%": { transform: 'scale(0.8)', opacity: '0.7' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-dot-1": "pulse-dot-1 1.2s infinite ease-in-out",
        "pulse-dot-2": "pulse-dot-2 1.2s infinite ease-in-out 0.2s",
        "pulse-dot-3": "pulse-dot-3 1.2s infinite ease-in-out 0.4s",
      },
      // Add CSS variables for dark mode text
      textColor: {
        'dark-primary': 'var(--dark-text-primary, #f3f4f6)',
        'dark-secondary': 'var(--dark-text-secondary, #d1d5db)',
        'dark-muted': 'var(--dark-text-muted, #9ca3af)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // For better markdown rendering
  ],
  // Ensure core plugins are enabled
  corePlugins: {
    space: true,
    padding: true,
    margin: true,
    backdropFilter: true, // Enable backdrop filter core plugin
  },
}