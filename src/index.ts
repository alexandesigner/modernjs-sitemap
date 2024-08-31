import type {
  ModifyFileSystemRoutesParams,
  ModifyServerRoutesParams,
  Route,
  SitemapConfig,
  SitemapItem,
  SSGRouteOptions,
  StaticRoute,
} from './types';
import { generateRobotsTxt, generateSitemap } from './generator';
import { createRouteObject, getRoutes, mergeRoutes } from './utils';

/**
 * Sitemap plugin for Modern.js framework that generates sitemaps and robots.txt based on file system and server routes.
 * @returns An object containing the plugin's name and setup function.
 */
export const sitemapPlugin = ({
  basepath,
  routes,
  robots,
  outDir,
  exclude,
}: SitemapConfig) => ({
  name: 'modernjs-sitemap',
  async setup(api: any) {
    if (!basepath) {
      throw new Error('basepath is required for sitemap generation.');
    }
    const config = api.useConfigContext();
    const sitemapConfig = routes || [];
    const SSRModes = ['stream', 'string'];
    const ssgRoutes = config?.output?.ssg?.routes ?? [];
    let systemRoutes: StaticRoute[] = [];
    let serverRoutes: Route[] = [];
    let mergedRoutes: Route[] = [];

    /**
     * Parses SSG routes to standardize their format.
     * @param ssgRoutes Array of SSG routes to be parsed.
     * @returns Array of parsed routes.
     */
    const parseSSGRoutes = (ssgRoutes: SSGRouteOptions[]): Route[] => {
      return ssgRoutes.reduce((acc: Route[], route: SSGRouteOptions) => {
        if (typeof route === 'string') {
          acc.push(createRouteObject(route));
        } else if (typeof route === 'object') {
          if (!route?.params) {
            acc.push(createRouteObject(route.url, route.output));
            return acc;
          }
          for (const param of route.params) {
            acc.push(
              createRouteObject(
                route.url.replace(':id', param.id),
                '',
                '.html',
                route.headers,
              ),
            );
          }
        }
        return acc;
      }, []);
    };
    return {
      /**
       * Modifies the file system routes and generates a sitemap if SSR is enabled.
       * @param entrypoint The entry point configuration.
       * @param routes The array of routes from the file system.
       * @returns The modified file system routes.
       */
      async modifyFileSystemRoutes({
        entrypoint,
        routes,
      }: ModifyFileSystemRoutesParams) {
        let configuredRoutes = [];
        systemRoutes = getRoutes(routes) as StaticRoute[];

        // Parse SSG routes if they exist in the configuration
        const ssgParsedRoutes = config?.output?.ssg
          ? parseSSGRoutes(ssgRoutes)
          : [];
        mergedRoutes = [...systemRoutes, ...ssgParsedRoutes];

        // Generate sitemap if SSR is enabled
        if (
          config?.server?.ssr ||
          SSRModes.includes(config?.server?.ssr?.mode)
        ) {
          mergedRoutes = mergeRoutes(routes, mergedRoutes);
        }

        // Apply custom sitemap configurations from modern.config.ts
        configuredRoutes = applySitemapConfig(mergedRoutes, {
          basepath,
          routes: sitemapConfig,
        });

        // Exclude routes from the sitemap if they are specified in the configuration
        if (exclude) {
          configuredRoutes = configuredRoutes.filter(
            route => !exclude.includes(route.urlPath),
          );
        }

        await generateSitemap(basepath, configuredRoutes, outDir);

        // Generate robots.txt if configuration is provided
        if (robots) {
          generateRobotsTxt(robots, outDir ?? '/config/public');
        }

        return {
          entrypoint,
          routes,
        };
      },
      /**
       * Modifies the server routes and merges them with system routes.
       * @param routes The array of server routes.
       * @returns The modified server routes.
       */
      async modifyServerRoutes({ routes }: ModifyServerRoutesParams) {
        serverRoutes = mergeRoutes(routes, mergedRoutes);

        // Exclude routes from the sitemap if they are specified in the configuration
        if (exclude) {
          serverRoutes = serverRoutes.filter(
            route => !exclude.includes(route.urlPath),
          );
        }

        return {
          routes: serverRoutes,
        };
      },
    };
  },
});

/**
 * Applies the custom sitemap configuration to the routes.
 * @param routes The original array of routes.
 * @param options The custom sitemap configuration from modern.config.ts.
 * @returns The updated array of routes with applied sitemap configurations.
 */
function applySitemapConfig(
  routes: Route[],
  options: {
    basepath?: string;
    routes?: SitemapItem[];
  },
): Route[] {
  const opts = new Map(options.routes?.map(item => [item.urlPath, item]));
  return routes.map(route => {
    const customConfig = opts.get(route.urlPath);
    return customConfig
      ? {
          ...route,
          priority: customConfig.priority || '0.5',
          changefreq: customConfig.changefreq || 'monthly',
        }
      : route;
  });
}

export default sitemapPlugin;
