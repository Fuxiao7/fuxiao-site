/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./screens/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink2: "#3b3833",
        chalk: "#ece9e1",
        chalk2: "#a09d95",
        lamp: "#a8611f",
        safelight: "#d15b34",
        dusk: "#8ba3a6",
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
        serif: [
          "Noto Serif SC",
          "Source Han Serif SC",
          "Songti SC",
          "STSong",
          "SimSun",
          "serif",
        ],
      },
      maxWidth: { shell: "1340px" },
      screens: { xs: "520px" },
    },
  },
  plugins: [],
};
