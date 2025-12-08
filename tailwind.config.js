// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-slower": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        drip: "drip 1s ease-in-out infinite",
        particle1: "particle1 3s ease-in-out infinite",
        particle2: "particle2 3s ease-in-out infinite 1.5s",
      },
      keyframes: {
        drip: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(20px) scale(0.5)", opacity: "0" },
        },
        particle1: {
          "0%, 100%": {
            transform: "translateY(0) translateX(0)",
            opacity: "0",
          },
          "10%, 90%": { opacity: "1" },
          "50%": { transform: "translateY(-10px) translateX(10px)" },
        },
        particle2: {
          "0%, 100%": {
            transform: "translateY(0) translateX(0)",
            opacity: "0",
          },
          "20%, 80%": { opacity: "1" },
          "60%": { transform: "translateY(-8px) translateX(-8px)" },
        },
      },
    },
  },
};
