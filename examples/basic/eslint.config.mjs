import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import ts from "eslint-config-ts";

export default [
  ...nextVitals,
  ...nextTs,
  ...ts,
  { ignores: [".next/**", "next-env.d.ts"] },
];