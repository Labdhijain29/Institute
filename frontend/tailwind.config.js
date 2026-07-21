  export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
      extend: {
        fontFamily: {
          sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
        },
        colors: {
          ink: "#111315",
          pine: "#f97316",
          coral: "#ff8a00",
          amberline: "#ffd166"
        },
        boxShadow: {
          soft: "0 18px 44px rgba(17, 19, 21, 0.13)"
        }
      }
    },
    plugins: []
  };
