import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import ts from "eslint-config-ts";

const config = [
  ...nextVitals,
  ...nextTs,
  ...ts,
  { ignores: [".next/**", "next-env.d.ts", "middleware.ts"] },
];

export default config;