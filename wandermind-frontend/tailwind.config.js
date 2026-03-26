/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#F8FAFC',   // lightest bg (was darkest)
          800: '#F1F5F9',   // card bg
          700: '#E2E8F0',   // borders/dividers
          600: '#CBD5E1',   // muted elements
        },
        accent: {
          orange: '#3B82F6',    // Primary blue
          gold: '#1E40AF',      // Deep blue
          teal: '#22C55E',      // Green
          coral: '#EF4444',     // Red
          ocean: '#3B82F6',     // Primary blue
          lagoon: '#2563EB',    // Slightly deeper blue
          earth: '#22C55E',     // Green
          sand: '#F59E0B',      // Amber for ratings
          peak: '#1E293B',      // Dark text
          sunset: '#3B82F6',    // Blue (was orange)
        },
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
