/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "var(--bg-canvas)",
          subtle: "var(--bg-subtle)",
          surface: "var(--bg-surface)",
          "surface-hover": "var(--bg-surface-hover)",
          "surface-active": "var(--bg-surface-active)",
        },
        hairline: {
          DEFAULT: "var(--border-hairline)",
          subtle: "var(--border-subtle)",
          focus: "var(--border-focus)",
          highlight: "var(--border-highlight)",
        },
        brand: {
          DEFAULT: "var(--brand-primary)",
          hover: "var(--brand-primary-hover)",
          glow: "var(--brand-primary-glow)",
          navy: "var(--brand-navy)",
          cyan: "var(--brand-cyan)",
          emerald: "var(--brand-emerald)",
          amber: "var(--brand-amber)",
          rose: "var(--brand-rose)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          faint: "var(--text-faint)",
          inverse: "var(--text-inverse)",
        },
        status: {
          success: "var(--status-success)",
          "success-bg": "var(--status-success-bg)",
          warning: "var(--status-warning)",
          "warning-bg": "var(--status-warning-bg)",
          error: "var(--status-error)",
          "error-bg": "var(--status-error-bg)",
          info: "var(--status-info)",
          "info-bg": "var(--status-info-bg)",
        },
      },
      borderRadius: {
        xs: "var(--radius-xs, 4px)",
        sm: "var(--radius-sm, 6px)",
        md: "var(--radius-md, 10px)",
        lg: "var(--radius-lg, 14px)",
        xl: "var(--radius-xl, 20px)",
        squircle: "24px",
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
        card: "var(--shadow-card)",
        overlay: "var(--shadow-overlay)",
        glow: "var(--shadow-glow)",
        "inner-light": "inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        "inner-dark": "inset 0 1px 2px 0 rgba(0, 0, 0, 0.4)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "200% 0%" },
        },
        "border-beam": {
          "100%": { "offset-distance": "100%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      borderWidth: {
        hairline: "0.5px",
        1: "1px",
      },
    },
  },
  plugins: [],
};
