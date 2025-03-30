/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
        },
        success: {
          100: "var(--success-100)",
          200: "var(--success-200)",
          300: "var(--success-300)",
          400: "var(--success-400)",
          500: "var(--success-500)",
          600: "var(--success-600)",
          700: "var(--success-700)",
          800: "var(--success-800)",
          900: "var(--success-900)",
        },
        info: {
          100: "var(--info-100)",
          200: "var(--info-200)",
          300: "var(--info-300)",
          400: "var(--info-400)",
          500: "var(--info-500)",
          600: "var(--info-600)",
          700: "var(--info-700)",
          800: "var(--info-800)",
          900: "var(--info-900)",
        },
        warning: {
          100: "var(--warning-100)",
          200: "var(--warning-200)",
          300: "var(--warning-300)",
          400: "var(--warning-400)",
          500: "var(--warning-500)",
          600: "var(--warning-600)",
          700: "var(--warning-700)",
          800: "var(--warning-800)",
          900: "var(--warning-900)",
        },
        danger: {
          100: "var(--danger-100)",
          200: "var(--danger-200)",
          300: "var(--danger-300)",
          400: "var(--danger-400)",
          500: "var(--danger-500)",
          600: "var(--danger-600)",
          700: "var(--danger-700)",
          800: "var(--danger-800)",
          900: "var(--danger-900)",
        },
        error: {
          100: "#ffe9d5",
          200: "#ffceac",
          300: "#ffac82",
          400: "#ff8b63",
          500: "#ff5630",
          600: "#db3723",
          700: "#b71d18",
          800: "#930f14",
          900: "#7a0916",
        },
        grey: {
          100: "#f9fafb",
          200: "#f4f6f8",
          300: "#dfe3e8",
          400: "#c4cdd5",
          500: "#919eab",
          600: "#637381",
          700: "#454f5b",
          800: "#212b36",
          900: "#161c24",
        },
        white: "#ffffff",
        black: "#000000",
        glassmorphism: {
          "o-80": "rgba(255, 255, 255, 80)",
        },
        text: {
          secondary: "#637381",
          disable: "#919eab",
          placeholder: "#919eab",
        },
        stroke: {
          outlined: "#dfe3e8",
        },
      },
      keyframes: {
        bounce: {
          "0%, 100%": {
            transform: "translateY(-55%)",
            "animation-timing-function": "cubic-bezier(0.8,0,1,1)",
          },
          "50%": {
            transform: "none",
            "animation-timing-function": "cubic-bezier(0,0,0.2,1)",
          },
        },
      },
    },
  },
  corePlugins: {
    // Remove the Tailwind CSS preflight styles so it can use Material UI's preflight instead (CssBaseline).
    preflight: false,
  },
  variants: {},
  plugins: [],
};

export default config;
