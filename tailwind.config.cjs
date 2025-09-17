module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Modern Professional Palette
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        granite: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712'
        },
        neon: {
          blue: '#00d4ff',
          purple: '#8b5cf6',
          green: '#10b981',
          orange: '#f59e0b',
          pink: '#ec4899',
          cyan: '#06b6d4'
        },
        // Theme-specific colors
        sidebar: {
          bg: '#2e3440',
          active: '#444444',
          'active-alt': '#616161',
        },
        surface: {
          light: '#ffffff',
          grey: '#f9fafb',
        },
        accent: '#00d4ff'
      },
      boxShadow: {
        'svg': '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)',
        'svg-lg': '0 8px 16px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'neon-green': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-lg': '0 0 30px rgba(0, 212, 255, 0.4)',
        'hover': '0 4px 20px rgba(0, 0, 0, 0.15)'
      },
      backdropBlur: {
        xs: '2px'
      }
    },
  },
  plugins: [],
};