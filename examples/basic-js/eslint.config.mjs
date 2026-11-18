import nextVitals from "eslint-config-next/core-web-vitals";
import js from "eslint-config-js";

export default [
  ...nextVitals,
  ...js,
  { ignores: ["middleware.js"] },
];