import globals from "globals";
import pluginReact from "eslint-plugin-react";
import sortKeysFix from "eslint-plugin-sort-keys-fix";
import tsParser from "@typescript-eslint/parser";
import tseslint from "@typescript-eslint/eslint-plugin";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },
    settings: {
      react: {
        version: "detect", // Automatically detect the React version
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: pluginReact,
      "sort-keys-fix": sortKeysFix,
    },
    rules: {
      // TypeScript rules
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/sort-type-constituents": ["error", { caseSensitive: false }],

      // React rules
      ...pluginReact.configs.flat.recommended.rules,
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-closing-bracket-location": ["error", "line-aligned"],
      "react/jsx-curly-spacing": ["error", "never", { allowMultiline: true }],
      "react/jsx-indent-props": ["error", 2],
      "react/jsx-pascal-case": ["error", { allowAllCaps: true }],
      "react/jsx-props-no-spreading": ["error", {
        html: "enforce",
        custom: "enforce",
        explicitSpread: "ignore",
      }],
      "react/self-closing-comp": "error",
      "react/jsx-sort-props": ["error", { ignoreCase: true }],
      "react/prop-types": "off", // Assuming TypeScript types are used instead

      // General rules
      "no-underscore-dangle": ["error", { allow: ["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"] }],
      "jsx-quotes": ["error", "prefer-double"],
      "class-methods-use-this": [
        "error",
        { exceptMethods: ["render", "getInitialState", "componentDidMount"] },
      ],
      "sort-keys": ["error", "asc", { caseSensitive: false, natural: true }],
      "sort-keys-fix/sort-keys-fix": "error", // Enables automatic sorting of keys
    },
  },
];
