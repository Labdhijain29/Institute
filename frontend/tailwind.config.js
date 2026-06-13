export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#172026",
        pine: "#0f766e",
        coral: "#e85d4f",
        amberline: "#f5b942"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(23, 32, 38, 0.10)"
      }
    }
  },
  plugins: []
};
