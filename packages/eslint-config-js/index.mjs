import prettier from "eslint-config-prettier/flat";
import js from "@eslint/js";

export default [
  js.configs.recommended,
  prettier,
];