/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        'xl': '2rem',
      },
    },
    extend: {
      colors: {
        'deep-space': '#0B0F1A',
        'space-gray': '#111827',
        'space-light': '#1E293B',
        'cyber-teal': 'rgb(0 212 170)',
        'cyber-teal-hover': 'rgb(0 229 184)',
        'cyber-teal-glow': 'rgba(0, 212, 170, 0.35)',
        'sens-public': 'rgb(34 197 94)',
        'sens-internal': 'rgb(234 179 8)',
        'sens-confidential': 'rgb(249 115 22)',
        'sens-topsecret': 'rgb(239 68 68)',
      },
      fontFamily: {
        'mono-display': ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        'mono-code': ['"Fira Code"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'cyber-glow': '0 0 20px rgba(0, 212, 170, 0.3), 0 0 40px rgba(0, 212, 170, 0.1)',
        'cyber-glow-soft': '0 0 12px rgba(0, 212, 170, 0.15), 0 0 24px rgba(0, 212, 170, 0.06)',
        'cyber-glow-60': '0 0 14px rgba(0, 212, 170, 0.18), 0 0 28px rgba(0, 212, 170, 0.06)',
        'cyber-glow-30': '0 0 8px rgba(0, 212, 170, 0.1), 0 0 16px rgba(0, 212, 170, 0.03)',
        'cyber-glow-50': '0 0 10px rgba(0, 212, 170, 0.15), 0 0 20px rgba(0, 212, 170, 0.05)',
        'card-inset': 'inset 0 1px 0 rgba(255,255,255,0.04)',
        'danger-pulse': '0 0 0 0 rgba(239, 68, 68, 0.7)',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0, 212, 170, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 170, 0.03) 1px, transparent 1px)",
        'danger-stripes': "repeating-linear-gradient(45deg, #1F2937, #1F2937 10px, #374151 10px, #374151 20px)",
      },
      backgroundSize: {
        'grid': '24px 24px',
      },
      animation: {
        'scan-line': 'scan 3s linear infinite',
        'pulse-danger': 'pulse-danger 2s infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'stagger-in': 'stagger-in 0.5s ease-out forwards',
      },
      keyframes: {
        'scan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
        'pulse-danger': {
          '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '70%': { boxShadow: '0 0 0 12px rgba(239, 68, 68, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 212, 170, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.8)' },
        },
        'stagger-in': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
