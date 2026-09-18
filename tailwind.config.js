/* ---------------------------------------------------------------------------
 * Design tokens: High-Fidelity Claymorphism
 *
 * The app styles almost everything through a small set of component classes
 * (see src/index.css `@layer components`) plus the Tailwind scales below.
 * Rather than rewriting ~45 feature files, the clay material is installed here
 * and inherited everywhere:
 *
 *   • `slate`  — remapped to a lavender-tinted clay neutral. The dark end
 *                (700-950) deliberately STAYS DARK so existing dark surfaces
 *                (simulated video feeds, telemetry panels) keep working.
 *   • `blue`   — remapped to the clay primary accent (Vivid Violet).
 *   • `indigo` — remapped to the clay secondary accent (Hot Pink), so existing
 *                `from-blue-600 via-indigo-600` gradients become accent→alt.
 *
 * `navy` / `brand` are retained for backwards compatibility (currently unused).
 * ------------------------------------------------------------------------- */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Body copy
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        // Headings, stat numbers, labels
        display: ['Nunito', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Named tokens straight from the design system spec.
        clay: {
          canvas: '#F4F1FA',
          input: '#EFEBF5',
          ink: '#332F3A',
          muted: '#635F69',
          accent: '#7C3AED',
          accentAlt: '#DB2777',
          tertiary: '#0EA5E9',
          success: '#10B981',
          warning: '#F59E0B',
          cardBg: 'rgba(255, 255, 255, 0.68)',
          border: '#E4DFEE',
          // Ambient blob tints
          blobViolet: 'rgba(139, 92, 246, 0.10)',
          blobPink: 'rgba(236, 72, 153, 0.10)',
          blobSky: 'rgba(14, 165, 233, 0.10)',
          blobMint: 'rgba(16, 185, 129, 0.08)',
        },

        // --- Clay neutral ramp (lavender-tinted). Dark end stays dark. ---
        slate: {
          50: '#F4F1FA',
          100: '#EFEBF5',
          200: '#E4DFEE',
          300: '#CFC8DC',
          400: '#635F69', // spec's muted floor — text can never be lighter
          500: '#5A5661',
          600: '#4E4A56',
          700: '#443F4B',
          800: '#3A3641',
          900: '#332F3A', // spec ink
          950: '#2A2731',
        },

        // --- Primary accent: Vivid Violet ---
        blue: {
          50: '#F3EFFE',
          100: '#E9E2FD',
          200: '#D6C8FB',
          300: '#BCA5F8',
          400: '#9F7BF3',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },

        // --- Secondary accent: Hot Pink ---
        // 600 is one step deeper than the spec's #DB2777 (kept in `clay.accentAlt`)
        // because it is used as *text* on pink tints, where #DB2777 lands at
        // 4.2:1 — just under AA.
        indigo: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#BE185D',
          700: '#9D174D',
          800: '#831843',
          900: '#6B1239',
          950: '#500724',
        },

        /* Accent accessibility floor.
           The 300/400 levels are only ever used as text on DARK panels (video
           overlays, telemetry cards) so they must stay light. The 500/600
           levels are used as text on light surfaces, so they are shifted one
           step darker to clear WCAG AA on the clay canvas. */
        emerald: {
          500: '#059669',
          600: '#047857',
        },
        amber: {
          500: '#D97706',
          600: '#B04D08',
          700: '#92400E',
        },
        rose: {
          500: '#E11D48',
          600: '#BE123C',
        },
        cyan: {
          500: '#0891B2',
          600: '#0E7490',
        },
        purple: {
          500: '#9333EA',
          600: '#7E22CE',
        },

        // Kept for compatibility (no current usages).
        navy: {
          50: '#0f172a',
          100: '#1e293b',
          200: '#334155',
          300: '#475569',
          400: '#64748b',
          500: '#94a3b8',
          600: '#cbd5e1',
          700: '#e2e8f0',
          800: '#f1f5f9',
          850: '#f8fafc',
          900: '#ffffff',
          950: '#f8fafc',
        },
        brand: {
          50: '#F3EFFE',
          100: '#E9E2FD',
          200: '#D6C8FB',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
      },

      /* Super-rounded scale. CSS clamps radii to half the box, so small
         elements (dots, bars, chips) degrade safely into pills. */
      borderRadius: {
        sm: '0.5rem',      // 8px  — spec minimum
        DEFAULT: '0.75rem',// 12px
        md: '0.875rem',    // 14px
        lg: '1.125rem',    // 18px
        xl: '1.25rem',     // 20px — buttons & inputs
        '2xl': '1.5rem',   // 24px — medium elements
        '3xl': '2rem',     // 32px — standard cards
        '4xl': '2.5rem',   // 40px
        '5xl': '3.75rem',  // 60px — hero containers
      },

      /* 4-layer shadow stacks — outer drop, top-left highlight,
         inner colour bounce, inner rim light. */
      boxShadow: {
        // Surfaces
        'clay-deep':
          '30px 30px 60px #cdc6d9, -30px -30px 60px #ffffff, inset 10px 10px 20px rgba(139, 92, 246, 0.05), inset -10px -10px 20px rgba(255, 255, 255, 0.8)',
        'clay-card':
          '16px 16px 32px rgba(160, 150, 180, 0.20), -10px -10px 24px rgba(255, 255, 255, 0.90), inset 6px 6px 12px rgba(139, 92, 246, 0.03), inset -6px -6px 12px rgba(255, 255, 255, 1)',
        'clay-card-hover':
          '22px 22px 44px rgba(160, 150, 180, 0.26), -12px -12px 28px rgba(255, 255, 255, 1), inset 6px 6px 12px rgba(139, 92, 246, 0.05), inset -6px -6px 12px rgba(255, 255, 255, 1)',
        'clay-raised':
          '0 1px 2px rgba(160, 150, 180, 0.10), 0 8px 16px -8px rgba(139, 92, 246, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.85)',

        // Interactive
        'clay-button':
          '12px 12px 24px rgba(139, 92, 246, 0.30), -8px -8px 16px rgba(255, 255, 255, 0.40), inset 4px 4px 8px rgba(255, 255, 255, 0.40), inset -4px -4px 8px rgba(0, 0, 0, 0.10)',
        'clay-button-hover':
          '16px 16px 32px rgba(139, 92, 246, 0.38), -10px -10px 20px rgba(255, 255, 255, 0.50), inset 4px 4px 8px rgba(255, 255, 255, 0.45), inset -4px -4px 8px rgba(0, 0, 0, 0.12)',
        'clay-pressed':
          'inset 10px 10px 20px #d9d4e3, inset -10px -10px 20px #ffffff',
        'clay-inset-sm':
          'inset 3px 3px 6px rgba(180, 170, 200, 0.35), inset -3px -3px 6px rgba(255, 255, 255, 0.95)',

        // Legacy tokens re-pointed at the clay stacks so the ~100 existing
        // shadow-* call sites inherit the new material automatically.
        DEFAULT:
          '0 2px 4px rgba(160, 150, 180, 0.12), 0 8px 16px -8px rgba(139, 92, 246, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
        '2xs':
          '0 1px 1px rgba(160, 150, 180, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        'xs':
          '0 1px 2px rgba(160, 150, 180, 0.10), 0 6px 12px -6px rgba(139, 92, 246, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'sm':
          '0 2px 4px rgba(160, 150, 180, 0.12), 0 10px 20px -10px rgba(139, 92, 246, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
        'md':
          '0 4px 8px rgba(160, 150, 180, 0.14), 0 14px 28px -12px rgba(139, 92, 246, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
        'lg':
          '0 8px 16px rgba(160, 150, 180, 0.16), 0 24px 44px -18px rgba(139, 92, 246, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'xl':
          '16px 16px 32px rgba(160, 150, 180, 0.20), -10px -10px 24px rgba(255, 255, 255, 0.90), inset 6px 6px 12px rgba(139, 92, 246, 0.03), inset -6px -6px 12px rgba(255, 255, 255, 1)',
        '2xl':
          '22px 22px 44px rgba(160, 150, 180, 0.26), -12px -12px 28px rgba(255, 255, 255, 1), inset 6px 6px 12px rgba(139, 92, 246, 0.05), inset -6px -6px 12px rgba(255, 255, 255, 1)',

        'card':
          '16px 16px 32px rgba(160, 150, 180, 0.20), -10px -10px 24px rgba(255, 255, 255, 0.90), inset 6px 6px 12px rgba(139, 92, 246, 0.03), inset -6px -6px 12px rgba(255, 255, 255, 1)',
        'card-hover':
          '22px 22px 44px rgba(160, 150, 180, 0.26), -12px -12px 28px rgba(255, 255, 255, 1), inset 6px 6px 12px rgba(139, 92, 246, 0.05), inset -6px -6px 12px rgba(255, 255, 255, 1)',
        'card-elevated':
          '24px 24px 48px rgba(160, 150, 180, 0.24), -14px -14px 30px rgba(255, 255, 255, 1), inset 6px 6px 12px rgba(139, 92, 246, 0.04), inset -6px -6px 12px rgba(255, 255, 255, 1)',
        'dropdown':
          '0 10px 24px rgba(160, 150, 180, 0.20), 0 2px 6px rgba(139, 92, 246, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'premium':
          '16px 16px 32px rgba(160, 150, 180, 0.20), -10px -10px 24px rgba(255, 255, 255, 0.90), inset 6px 6px 12px rgba(139, 92, 246, 0.03), inset -6px -6px 12px rgba(255, 255, 255, 1)',
        'inset-line': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.7)',

        // Accent glows (violet)
        'glow-sm': '0 0 15px -3px rgba(124, 58, 237, 0.20)',
        'glow-md': '0 0 25px -5px rgba(124, 58, 237, 0.30)',
        'glow-lg': '0 0 45px -10px rgba(124, 58, 237, 0.40)',
      },

      backgroundImage: {
        'sheen': 'linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.65) 45%, rgba(255, 255, 255, 0.15) 55%, transparent 80%)',
        'mesh-soft': 'radial-gradient(circle at 15% 20%, rgba(139, 92, 246, 0.12), transparent 45%), radial-gradient(circle at 85% 10%, rgba(236, 72, 153, 0.12), transparent 40%), radial-gradient(circle at 50% 100%, rgba(14, 165, 233, 0.10), transparent 55%)',
        'grid-fade': 'linear-gradient(to bottom, rgba(244, 241, 250, 0) 0%, rgba(244, 241, 250, 1) 100%)',
        // Glass-clay surface used by cards/panels
        'clay-surface': 'linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.55))',
        // Light stop is #8555EE rather than the spec's #A78BFA: white label text
        // on #A78BFA is only 2.7:1, which fails WCAG AA on every primary CTA.
        // #8555EE is visually near-identical and clears AA at 4.6:1.
        'clay-primary': 'linear-gradient(135deg, #8555EE, #6D28D9)',
        'clay-accent': 'linear-gradient(135deg, #8555EE, #6D28D9, #BE185D)',
      },
      backgroundSize: {
        'sheen': '250% 100%',
      },

      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'silk': 'cubic-bezier(0.16, 1, 0.3, 1)',
        // Bouncy organic motion for clay interactions
        'clay': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },

      animation: {
        // --- Clay ---
        'clay-float': 'clay-float 8s ease-in-out infinite',
        'clay-float-delayed': 'clay-float-delayed 10s ease-in-out infinite',
        'clay-float-slow': 'clay-float-slow 12s ease-in-out infinite',
        'clay-breathe': 'clay-breathe 6s ease-in-out infinite',

        // --- Existing motion (kept) ---
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-x': 'gradient-x 8s ease infinite',
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'scale-in': 'scale-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'slide-in-left': 'slide-in-left 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-in-right': 'slide-in-right 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'aurora': 'aurora 18s ease-in-out infinite alternate',
        'sheen': 'sheen 3.2s ease-in-out infinite',
        'scan': 'scan 4.5s linear infinite',
        'live-ping': 'live-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bob': 'bob 3.2s ease-in-out infinite',
        'ticker': 'ticker 40s linear infinite',
        'rise': 'rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
      },

      keyframes: {
        'clay-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        'clay-float-delayed': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(-2deg)' },
        },
        'clay-float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) rotate(5deg)' },
        },
        'clay-breathe': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },

        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(0.98)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-26px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(26px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'aurora': {
          '0%': { transform: 'translate3d(-4%, -2%, 0) scale(1)' },
          '50%': { transform: 'translate3d(3%, 2%, 0) scale(1.08)' },
          '100%': { transform: 'translate3d(5%, -3%, 0) scale(1.03)' },
        },
        'sheen': {
          '0%': { backgroundPosition: '200% 0' },
          '65%, 100%': { backgroundPosition: '-60% 0' },
        },
        'scan': {
          '0%': { transform: 'translateY(-110%)', opacity: '0' },
          '12%': { opacity: '0.9' },
          '88%': { opacity: '0.9' },
          '100%': { transform: 'translateY(110%)', opacity: '0' },
        },
        'live-ping': {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '70%, 100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'rise': {
          '0%': { opacity: '0', transform: 'translateY(28px) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
