/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Active le mode sombre par classe
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Inclure tous les fichiers JS/JSX/TS/TSX dans le dossier src
    "./public/index.html",         // Inclure votre fichier index.html
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

