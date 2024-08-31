import type { Route, ExtractedPath } from './types';

/**
 * Recursively extracts paths from the given routes, appending them to the parent path.
 * @param routes Array of routes to extract paths from.
 * @param parentPath The base path to append to each route's path.
 * @returns An array of extracted paths, including all children routes.
 */
export function extractPaths(
  routes: Route[],
  parentPath: string,
): ExtractedPath[] {
  return routes.reduce((acc: ExtractedPath[], route: Route) => {
    let values = acc;
    if (
      route.path &&
      typeof route.path === 'string' &&
      !route.path.includes(':')
    ) {
      const fullPath = `${parentPath ?? ''}/${route.path}`.replace(/\/+/g, '/');

      values.push({
        urlPath: fullPath,
        entryPath: '.html',
        entryName: route.id,
      });

      if (Array.isArray(route.children) && route.children.length > 0) {
        const childPaths = extractPaths(route.children, fullPath);
        values = values.concat(childPaths);
      }
    }

    return values;
  }, []);
}

/**
 * Retrieves all unique routes from the given array of routes.
 * @param routes Array of routes to be processed.
 * @returns An array of unique extracted paths.
 */
export const getRoutes = (routes: Route[]): ExtractedPath[] => {
  try {
    const extractedPaths = extractPaths(routes, '');
    const parseRoutes = uniqueByKey(extractedPaths, item => item.urlPath);
    return parseRoutes;
  } catch (error) {
    console.error('Error reading routes:', error);
    return [];
  }
};

/**
 * Creates a unique array based on the provided key identifier.
 * @param items Array of items to be merged.
 * @param getKey Function to obtain the key identifier for the Map.
 * @returns Array of unique items.
 */
export function uniqueByKey<T>(items: T[], getKey: (item: T) => string): T[] {
  return Array.from(new Map(items.map(item => [getKey(item), item])).values());
}

/**
 * Merges base routes and additional routes, ensuring each route is unique based on the urlPath.
 * @param baseRoutes Base routes.
 * @param additionalRoutes Additional routes.
 * @returns Array of unique routes.
 */
export const mergeRoutes = (
  baseRoutes: Route[],
  additionalRoutes: Route[],
): Route[] => {
  return uniqueByKey(
    [...baseRoutes, ...additionalRoutes],
    route => route.urlPath,
  );
};
