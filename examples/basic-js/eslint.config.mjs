import nextVitals from "eslint-config-next/core-web-vitals";
import js from "eslint-config-js";

const config = [
  ...nextVitals,
  ...js,
  { ignores: ["middleware.js"] },
];

export default config;