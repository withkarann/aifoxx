import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Build output and gitignored local scratch directories are not app code.
  { ignores: ["dist", ".scratch", ".remember", ".playwright-mcp"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Vendored shadcn/ui components + their generated mobile hook are not
    // hand-edited (see CLAUDE.md). The React-Compiler rules added in
    // eslint-plugin-react-hooks v7 flag upstream shadcn patterns (setState in
    // an effect, Math.random skeleton widths) we can't fix without diverging
    // from upstream. Silence them here only; app code outside this scope keeps
    // the rules fully active.
    files: ["src/components/ui/**", "src/hooks/use-mobile.tsx"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",
    },
  },
);
