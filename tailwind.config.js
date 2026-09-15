/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        capsulas: {
          bg: "#0B0F19",
          card: "#111827",
          border: "#1F2937",
          accent: "#06B6D4",
          purple: "#A855F7",
        },
        brand: {
          green: "#339136",
          brown: "#321401",
          orange: "#F48138",
          darkOrange: "#B95D0E",
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
        'glow-orange': '0 0 20px -3px rgba(244, 129, 56, 0.45)',
        'glow-green': '0 0 20px -3px rgba(51, 145, 54, 0.45)',
      }
    },
  },
  plugins: [],
}
