import type { Route, ExtractedPath, StaticRoute } from './types';

/**
 * Represents HTTP headers for a route.
 */
type Headers = Record<string, string>;

/**
 * Recursively extracts paths from the given routes, appending them to the parent path.
 * @param routes - Array of routes to extract paths from.
 * @param parentPath - The base path to append to each route's path.
 * @returns An array of extracted paths, including all children routes.
 */
export function extractPaths(
  routes: Route[],
  parentPath = '',
): ExtractedPath[] {
  return routes.reduce((acc: ExtractedPath[], route: Route) => {
    if (
      route.path &&
      typeof route.path === 'string' &&
      !route.path.includes(':')
    ) {
      const fullPath = `${parentPath}/${route.path}`.replace(/\/+/g, '/');

      acc.push({
        urlPath: fullPath,
        entryPath: '.html',
        entryName: route.id,
      });

      if (Array.isArray(route.children) && route.children.length > 0) {
        acc.push(...extractPaths(route.children, fullPath));
      }
    }

    return acc;
  }, []);
}

/**
 * Retrieves all unique routes from the given array of routes.
 * @param routes - Array of routes to be processed.
 * @returns An array of unique extracted paths.
 */
export const getRoutes = (routes: Route[]): ExtractedPath[] => {
  try {
    const extractedPaths = extractPaths(routes);
    return uniqueByKey(extractedPaths, item => item.urlPath);
  } catch (error) {
    console.error('Error reading routes:', error);
    return [];
  }
};

/**
 * Creates a unique array based on the provided key identifier.
 * @param items - Array of items to be filtered for uniqueness.
 * @param getKey - Function to obtain the key identifier for the uniqueness check.
 * @returns An array of unique items.
 */
export function uniqueByKey<T>(items: T[], getKey: (item: T) => string): T[] {
  return Array.from(new Map(items.map(item => [getKey(item), item])).values());
}

/**
 * Merges base routes and additional routes, ensuring each route is unique based on the urlPath.
 * @param baseRoutes - The base set of routes.
 * @param additionalRoutes - The additional routes to merge.
 * @returns An array of unique routes.
 */
export const mergeRoutes = (
  baseRoutes: Route[],
  additionalRoutes: Route[],
): Route[] =>
  uniqueByKey([...baseRoutes, ...additionalRoutes], route => route.urlPath);

/**
 * Creates a route object with the provided parameters.
 * @param urlPath - The URL path for the route.
 * @param entryName - The name of the entry file.
 * @param entryPath - The path to the entry file.
 * @param headers - Optional headers to be included in the route.
 * @returns A route object.
 */
export const createRouteObject = (
  urlPath: string,
  entryName = '',
  entryPath = '.html',
  headers?: Headers,
): StaticRoute => ({
  urlPath,
  entryName,
  entryPath,
  headers,
});
