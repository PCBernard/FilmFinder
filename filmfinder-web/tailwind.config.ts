import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { ink: "#1a1a1a", paper: "#f5f0e8", sand: "#eee9e0", yellow: "#ffcc00", red: "#e63b2e", blue: "#0055ff" },
    fontFamily: { head: ["var(--font-head)", "sans-serif"], body: ["var(--font-body)", "sans-serif"] },
    boxShadow: { b: "5px 5px 0 #1a1a1a", bs: "3px 3px 0 #1a1a1a" },
  } },
} satisfies Config;
