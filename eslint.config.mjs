import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import globals from "globals";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The embeddable widget is a plain browser script served as-is.
    files: ["public/widget.js"],
    languageOptions: { sourceType: "script", globals: globals.browser },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "coverage/**"]),
]);
