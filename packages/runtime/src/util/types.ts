import type { NextURL } from "next/dist/server/web/next-url";
import {
  RequestCookies,
  ResponseCookies,
} from "next/dist/server/web/spec-extension/cookies";
import type { NextResponse } from "next/server";

/**
 * @credit https://github.com/honojs/hono/blob/main/src/types.ts
 */
type ParamKey<Component> = Component extends `:${infer Name}` ? Name : never;

export type ParamKeys<Path> = Path extends `${infer Component}/${infer Rest}`
  ? ParamKey<Component> | ParamKeys<Rest>
  : ParamKey<Path>;

export type Params<Path> = Record<ParamKeys<Path>, string>;

export type ParamType = Record<string, string>;

type DefaultParam = Record<string, string | undefined>;

export type NextMiddlewareRequest<Param extends DefaultParam = DefaultParam> = {
  readonly url: NextURL;
  readonly headers: Headers;
  readonly params: Param;
  readonly search: URLSearchParams;
  readonly cookies: RequestCookies;
  readonly waitUntil: (promise: Promise<any>) => void;
};

export type NextMiddlewareResponse = {
  readonly headers: Headers;
  readonly cookies: ResponseCookies;
};

export type NextMiddlewareInternals = {
  responseHeaders?: Headers;
  cookies?: ResponseCookies;
  nextUrl?: NextURL;
  searchParams?: URLSearchParams;
};

type OptionalPromise<T> = Promise<T> | T;

export type GenericHook<ExtraArgs extends any[] = []> = (
  req: NextMiddlewareRequest,
  res: NextMiddlewareResponse,
  ...extra: ExtraArgs
) => OptionalPromise<NextResponse | undefined>;

export type ParamsHook = (
  params: ParamType
) => OptionalPromise<ParamType | undefined>;

export type RewriteHook = GenericHook<[destination: string]>;

export type RedirectHook = GenericHook<[destination: string, status?: number]>;

export type JsonHook = GenericHook<[data: unknown]>;

export type ResponseHook = (res: Response) => OptionalPromise<void>;

export type MiddleWareHandlerResult =
  | { redirect: string | URL | NextURL; status?: number }
  | { rewrite: string | URL | NextURL }
  | { json: unknown }
  | void;

type BaseHandler<Param extends DefaultParam, R> = (
  req: NextMiddlewareRequest<Param>,
  res: NextMiddlewareResponse
) => OptionalPromise<R>;

export type MiddlewareHandler<Param extends DefaultParam = DefaultParam> =
  BaseHandler<Param, MiddleWareHandlerResult>;

export type Forwarder<Param extends DefaultParam = DefaultParam> = BaseHandler<
  Param,
  string | void
>;

export type RewriteHandler<Param extends DefaultParam = DefaultParam> =
  BaseHandler<Param, string | URL | NextURL | void>;

export type RedirectHandler<Param extends DefaultParam = DefaultParam> =
  BaseHandler<
    Param,
    | string
    | URL
    | NextURL
    | {
        destination: string | URL | NextURL;
        status?: number;
      }
    | void
  >;

export type RuntimeNext = ((params: ParamType) => string) | true | undefined;
