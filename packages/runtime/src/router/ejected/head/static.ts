const staticImports = `/* eslint-disable */
import type {
  MiddleWareHandlerResult,
  NextMiddlewareInternals,
  NextMiddlewareRequest,
  NextMiddlewareResponse,
  Params,
  ParamType,
  RuntimeNext
} from "@cxnpl/next-app-middleware/runtime";
import { ResponseCookies } from "next/dist/server/web/spec-extension/cookies";
import { NextMiddleware, NextResponse } from "next/server";`;

export default staticImports;
