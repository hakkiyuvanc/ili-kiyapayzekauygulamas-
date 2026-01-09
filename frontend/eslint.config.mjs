import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore electron files (they use CommonJS)
    "electron/**",
    // Ignore test files (they have different patterns)
    "**/*.test.tsx",
    "**/*.test.ts",
    "__tests__/**",
    // Ignore node_modules
    "node_modules/**",
  ]),
  {
    rules: {
      // Type safety
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],

      // React
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/display-name": "off", // Allow anonymous components

      // Next.js
      "@next/next/no-img-element": "warn", // Warn instead of error

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
]);

export default eslintConfig;
