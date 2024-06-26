import {
  Branch,
  BranchTypes,
  PathSegmentSwitch,
} from "@cxnpl/next-app-middleware-runtime/dist/router/ejected";
import { FlattenedRoute, RouteTypes, SegmentLayout } from "../types";

type MatcherMap = Map<string, FlattenedRoute | MatcherMap | true>;

export const toMatcherMap = (
  endpoints: (readonly [string, FlattenedRoute | SegmentLayout])[]
) => {
  const map: MatcherMap = new Map();
  for (const [pathHash, route] of endpoints) {
    let currentMap = map;
    const segments = pathHash.slice(1).split("/");
    let isCatchAll = false;
    for (const segment of segments.slice(0, -1)) {
      if (segment === "*") {
        isCatchAll = true;
        break;
      }
      if (!currentMap.has(segment)) currentMap.set(segment, new Map());
      currentMap = currentMap.get(segment) as MatcherMap;
    }
    currentMap.set(
      isCatchAll ? "*" : "",
      route instanceof Array ? route : [route, { type: RouteTypes.NEXT }]
    );
  }
  return map;
};

export const addRoutesToMap = (map: MatcherMap, routeHashes: string[]) => {
  for (const routeHash of routeHashes) {
    const segments = routeHash.slice(1).split("/");
    let currentMap = map;
    let isCatchAll = false;
    for (const segment of segments.slice(0, -1)) {
      if (segment === "*") {
        isCatchAll = true;
        break;
      }
      if (!currentMap.has(segment)) currentMap.set(segment, new Map());
      currentMap = currentMap.get(segment) as MatcherMap;
    }
    currentMap.set(isCatchAll ? "*" : "", true);
  }
  return map;
};

const ejectPage = (
  page: SegmentLayout,
  appliedParams: Set<string>,
  catchAllApplied: boolean
): Branch => {
  const segments = page.externalPath.split("/");
  const [segment] = segments.filter(
    (segment) => segment.startsWith(":") && !appliedParams.has(segment.slice(1))
  );

  if (segment) {
    const name = segment.slice(1);
    const index = segments.indexOf(segment) - 1;
    appliedParams.add(name);
    return {
      type: BranchTypes.DYNAMIC,
      name,
      index,
      then: ejectPage(page, appliedParams, catchAllApplied),
    };
  }

  const lastSegment = segments[segments.length - 2];
  if (lastSegment.startsWith("*") && !catchAllApplied) {
    const name = lastSegment.slice(1);
    const index = segments.indexOf(lastSegment) - 1;
    return {
      type: BranchTypes.CATCH_ALL,
      name,
      index,
      then: ejectPage(page, appliedParams, true),
    };
  }

  if (page.external)
    return {
      type: BranchTypes.EXTERNAL,
    };
  if (page.rewrite)
    return {
      type: BranchTypes.REWRITE,
      location: page.location,
      internalPath: page.internalPath,
      fallback:
        page.redirect || page.page
          ? ejectPage(
              { ...page, rewrite: false },
              appliedParams,
              catchAllApplied
            )
          : undefined,
    };
  if (page.redirect)
    return {
      type: BranchTypes.REDIRECT,
      location: page.location,
      internalPath: page.internalPath,
      fallback: page.page
        ? ejectPage(
            { ...page, redirect: false },
            appliedParams,
            catchAllApplied
          )
        : undefined,
    };
  return {
    type: BranchTypes.NEXT,
    internalPath: page.internalPath,
    externalPath: page.externalPath,
  };
};

const ejectRoute = (
  [currentSegment, config, next, forward]: FlattenedRoute,
  appliedParams = new Set<string>(),
  catchAllApplied = false
): Branch => {
  const segments = currentSegment.externalPath.split("/");
  const [segment] = segments.filter(
    (segment) => segment.startsWith(":") && !appliedParams.has(segment.slice(1))
  );

  if (segment) {
    const name = segment.slice(1);
    const index = segments.indexOf(segment) - 1;
    appliedParams.add(name);
    return {
      type: BranchTypes.DYNAMIC,
      name,
      index,
      then: ejectRoute(
        [currentSegment, config, next, forward],
        appliedParams,
        catchAllApplied
      ),
    };
  }
  const lastSegment = segments[segments.length - 2];
  if (lastSegment.startsWith("*") && !catchAllApplied) {
    const name = lastSegment.slice(1);
    const index = segments.indexOf(lastSegment) - 1;
    return {
      type: BranchTypes.CATCH_ALL,
      name,
      index,
      then: ejectRoute(
        [currentSegment, config, next, forward],
        appliedParams,
        true
      ),
    };
  }

  switch (config.type) {
    case RouteTypes.MIDDLEWARE: {
      return {
        type: BranchTypes.MIDDLEWARE,
        internalPath: currentSegment.internalPath,
        location: currentSegment.location,
        then:
          next instanceof Array
            ? ejectRoute(next, appliedParams, catchAllApplied)
            : next
            ? ejectPage(next, appliedParams, catchAllApplied)
            : {
                type: BranchTypes.NOT_FOUND,
              },
      };
    }
    case RouteTypes.DYNAMIC_FORWARD: {
      return {
        type: BranchTypes.DYNAMIC_FORWARD,
        name: config.name,
        internalPath: currentSegment.internalPath,
        location: currentSegment.location,
        then:
          next instanceof Array
            ? ejectRoute(next, appliedParams, catchAllApplied)
            : next
            ? ejectPage(next, appliedParams, catchAllApplied)
            : {
                type: BranchTypes.NOT_FOUND,
              },
        forward:
          forward instanceof Array
            ? ejectRoute(forward, appliedParams, catchAllApplied)
            : forward
            ? ejectPage(forward, appliedParams, catchAllApplied)
            : {
                type: BranchTypes.NOT_FOUND,
              },
      };
    }
    case RouteTypes.STATIC_FORWARD: {
      return {
        type: BranchTypes.STATIC_FORWARD,
        name: config.name,
        internalPath: currentSegment.internalPath,
        location: currentSegment.location,
        then:
          next instanceof Array
            ? ejectRoute(next, appliedParams, catchAllApplied)
            : next
            ? ejectPage(next, appliedParams, catchAllApplied)
            : {
                type: BranchTypes.NOT_FOUND,
              },
        forward:
          forward instanceof Array
            ? ejectRoute(forward, appliedParams, catchAllApplied)
            : forward
            ? ejectPage(forward, appliedParams, catchAllApplied)
            : {
                type: BranchTypes.NOT_FOUND,
              },
      };
    }
    case RouteTypes.NEXT: {
      return ejectPage(currentSegment, appliedParams, catchAllApplied);
    }
    default: {
      const exhaustive: never = config;
      return exhaustive;
    }
  }
};

const specialCases = ["", ":", "*", "\\"];

const getMatcherMapInfo = (map: MatcherMap) => ({
  endpoint: map.get("") as FlattenedRoute | true | undefined,
  dynamic: map.get(":"),
  catchAll: map.get("*") as FlattenedRoute | true | undefined,
  external: (map.get("\\") as MatcherMap | undefined)?.get("") as
    | FlattenedRoute
    | undefined,
  static: Array.from(map.entries()).filter(
    ([segment]) => !specialCases.includes(segment)
  ),
});

export const ejectMatcherMap = (
  mapOrRoute: FlattenedRoute | MatcherMap | true,
  depth = 0
): Branch => {
  if (mapOrRoute === true)
    return {
      type: BranchTypes.SKIP,
    };
  if (mapOrRoute instanceof Map) {
    const map = getMatcherMapInfo(mapOrRoute);
    if (map.external) {
      return ejectRoute(map.external);
    }
    const cases: PathSegmentSwitch["cases"] = [
      {
        match: "",
        then: map.endpoint
          ? map.endpoint === true
            ? { type: BranchTypes.SKIP }
            : ejectRoute(map.endpoint)
          : {
              type: BranchTypes.NOT_FOUND,
            },
      },
      ...map.static.map(([segment, entry]) => {
        return {
          match: segment,
          then: ejectMatcherMap(entry, depth + 1),
        };
      }),
    ];
    if (map.dynamic) {
      if (map.catchAll)
        return {
          type: BranchTypes.SWITCH,
          index: depth,
          cases,
          defaultCase: ejectMatcherMap(map.dynamic, depth + 1),
          catchAll:
            map.catchAll === true
              ? { type: BranchTypes.SKIP }
              : ejectRoute(map.catchAll),
        };
      else
        return {
          type: BranchTypes.SWITCH,
          index: depth,
          cases,
          defaultCase: ejectMatcherMap(map.dynamic, depth + 1),
        };
    } else if (map.catchAll)
      return {
        type: BranchTypes.SWITCH,
        index: depth,
        cases,
        defaultCase:
          map.catchAll === true
            ? { type: BranchTypes.SKIP }
            : ejectRoute(map.catchAll),
      };
    else
      return {
        type: BranchTypes.SWITCH,
        index: depth,
        cases,
        defaultCase: { type: BranchTypes.NOT_FOUND },
      };
  } else {
    return ejectRoute(mapOrRoute);
  }
};
