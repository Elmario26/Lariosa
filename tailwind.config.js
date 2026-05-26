/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",

    "./src/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/**/*.{js,jsx,ts,tsx}",
    "./src/**/**/**/*.{js,jsx,ts,tsx}",
  ],

    

  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#F5F5F5',
          card: '#FFFFFF',
          brand: '#303841',
          surface: '#F5F5F5',
          primary: '#FF5722',
          accent: '#76ABAE',
          'accent-muted': '#E3EFF0',
          'primary-muted': '#FFE8E0',
        },
      },
    },
  },
  plugins: [],
}