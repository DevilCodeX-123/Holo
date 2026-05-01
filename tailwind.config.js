/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        holo: {
          primary: '#00f2ff',
          secondary: '#7000ff',
          accent: '#ff00d9',
          bg: '#050505',
        },
        "on-surface": "#e3e1e9",
        "secondary-fixed-dim": "#ffabf3",
        "on-background": "#e3e1e9",
        "background": "#121318",
        "surface-bright": "#38393f",
        "on-secondary-fixed-variant": "#810081",
        "surface-container-lowest": "#0d0e13",
        "on-primary": "#00373a",
        "outline-variant": "#3a494b",
        "tertiary-fixed": "#79ff5b",
        "on-surface-variant": "#b9cacb",
        "on-error": "#690005",
        "tertiary-container": "#36fd0f",
        "surface-tint": "#00dce6",
        "primary": "#e3fdff",
        "on-primary-container": "#006b71",
        "on-tertiary-fixed": "#022100",
        "surface-container": "#1e1f25",
        "surface-variant": "#34343a",
        "primary-container": "#00f3ff",
        "surface": "#121318",
        "on-primary-fixed": "#002022",
        "on-primary-fixed-variant": "#004f53",
        "tertiary": "#e8ffda",
        "on-tertiary": "#053900",
        "primary-fixed": "#6ff6ff",
        "surface-container-low": "#1a1b21",
        "surface-container-highest": "#34343a",
        "primary-fixed-dim": "#00dce6",
        "on-tertiary-container": "#107000",
        "inverse-on-surface": "#2f3036",
        "secondary-container": "#fe00fe",
        "inverse-primary": "#00696f",
        "tertiary-fixed-dim": "#2ae500",
        "on-secondary-container": "#500050",
        "error": "#ffb4ab",
        "surface-container-high": "#292a2f",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        "inverse-surface": "#e3e1e9",
        "surface-dim": "#121318",
        "on-secondary-fixed": "#380038",
        "on-secondary": "#5b005b",
        "secondary": "#ffabf3",
        "on-tertiary-fixed-variant": "#095300",
        "outline": "#849495",
        "secondary-fixed": "#ffd7f5"
      },
      gridTemplateColumns: {
        '18': 'repeat(18, minmax(0, 1fr))',
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "gutter": "16px",
        "element-gap": "8px",
        "safe-area-margin": "48px",
        "unit": "4px",
        "hud-padding": "24px"
      },
      fontFamily: {
        "display-lg": ["Space Grotesk", "sans-serif"],
        "mono-data": ["Inter", "monospace"],
        "headline-md": ["Space Grotesk", "sans-serif"],
        "body-rt": ["Inter", "sans-serif"],
        "label-caps": ["Space Grotesk", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["48px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "mono-data": ["14px", {"lineHeight": "1", "letterSpacing": "0.02em", "fontWeight": "500"}],
        "headline-md": ["24px", {"lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "body-rt": ["16px", {"lineHeight": "1.5", "letterSpacing": "0px", "fontWeight": "400"}],
        "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.15em", "fontWeight": "700"}]
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 5px #00f2ff)' },
          '50%': { opacity: 0.7, filter: 'drop-shadow(0 0 15px #00f2ff)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
