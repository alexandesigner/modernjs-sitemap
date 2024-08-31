import type {
  ModifyFileSystemRoutesParams,
  ModifyServerRoutesParams,
  Route,
  SitemapConfig,
  SitemapItem,
  StaticRoute,
} from './types';
import { generateSitemap } from './generator';
import { getRoutes, mergeRoutes } from './utils';

/**
 * Sitemap plugin for Modern.js framework that generates sitemaps based on file system and server routes.
 * @returns An object containing the plugin's name and setup function.
 */
export const sitemapPlugin = ({ options }: SitemapConfig) => ({
  name: '@modern-js/plugin-sitemap',
  async setup(api: any) {
    let systemRoutes: StaticRoute[] = [];
    let serverRoutes: Route[] = [];

    const config = api.useConfigContext();
    const sitemapConfig = options || [];

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
        systemRoutes = getRoutes(routes) as StaticRoute[];

        let mergedRoutes: Route[] = [...systemRoutes];

        if (
          config?.server?.ssr ||
          config?.server?.ssr?.mode === 'stream' ||
          config?.server?.ssr?.mode === 'string'
        ) {
          mergedRoutes = mergeRoutes(routes, systemRoutes);
        }

        // Apply custom sitemap configurations from modern.config.ts
        const configuredRoutes = applySitemapConfig(
          mergedRoutes,
          sitemapConfig,
        );

        await generateSitemap(sitemapConfig?.basepath ?? '', configuredRoutes);

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
        serverRoutes = mergeRoutes(routes, systemRoutes);

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
 * @param config The custom sitemap configuration from modern.config.ts.
 * @returns The updated array of routes with applied sitemap configurations.
 */
function applySitemapConfig(
  routes: Route[],
  options: {
    basepath?: string;
    routes?: SitemapItem[];
  },
): Route[] {
  const opts = new Map(options?.routes?.map(item => [item.urlPath, item]));

  const parseRoutes = routes.map(route => {
    const customConfig = opts.get(route.urlPath);

    if (customConfig) {
      return {
        ...route,
        priority: customConfig.priority || '0.5',
        changefreq: customConfig.changefreq || 'monthly',
      };
    }

    return route;
  });

  return parseRoutes;
}

export default sitemapPlugin;
