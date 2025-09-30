/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'forest-green': '#228B22',
          'earth-brown': '#8B4513',
          'sky-blue': '#87CEEB',
        },
      },
    },
    plugins: [require('daisyui')],
    daisyui: {
      themes: [
        {
          fra: {
            "primary": "#228B22",
            "secondary": "#8B4513", 
            "accent": "#87CEEB",
            "neutral": "#3d4451",
            "base-100": "#ffffff",
            "base-200": "#f9fafb",
            "base-300": "#f3f4f6",
            "info": "#3abff8",
            "success": "#36d399",
            "warning": "#fbbd23",
            "error": "#f87272",
          },
        },
        "light",
        "dark",
      ],
    },
  };