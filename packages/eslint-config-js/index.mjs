import prettier from "eslint-config-prettier/flat";
import js from "@eslint/js";

const config = [
  js.configs.recommended,
  prettier,
];

export default config;