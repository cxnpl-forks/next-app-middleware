import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import ts from "eslint-config-ts";

export default [
  // Was .eslintignore
  {
    ignores: [
      "eslint.config.mjs", // was .eslintrc.js

      "**/dist/",
      "**/out/",

      "examples/basic/public/",
      "examples/basic/.next/*",
      "examples/basic/next.config.js",

      "examples/basic-js/",

      "packages/next-app-middleware/*.d.ts",
      "packages/next-app-middleware/*.d.ts.map",
      "packages/next-app-middleware/*.js",
      "packages/next-app-middleware/*.js.map",
    ],
  },

  // Was extends: ["ts"]
  ...nextVitals,
  ...nextTs,
  ...ts,

  // Was parserOptions.project
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: ["./packages/*/tsconfig.json", "./examples/*/tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];