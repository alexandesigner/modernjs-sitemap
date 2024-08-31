export type Route = {
  path?: string;
  children?: Route[];
  [key: string]: any;
};

export type ExtractedPath = {
  urlPath: string;
} & StaticRoute;

export type StaticRoute = {
  urlPath: string;
  entryPath: string;
  entryName: string;
  headers?: Record<string, string>;
};

export type ModifyFileSystemRoutesParams = {
  entrypoint: any;
  routes: Route[];
};

export type ModifyServerRoutesParams = {
  routes: Route[];
};

export interface SitemapItem {
  urlPath: string;
  priority: SitemapPriority;
  changefreq: SitemapChangefreq;
}

export interface SitemapConfig {
  basepath: string;
  routes?: SitemapItem[];
  robots?:
    | {
        userAgent: string;
        disallow?: string | string[];
        allow?: string | string[];
      }
    | boolean;
  outDir?: string;
  exclude?: string[];
}

export type SitemapChangefreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export type SitemapPriority =
  | '0.0'
  | '0.1'
  | '0.2'
  | '0.3'
  | '0.4'
  | '0.5'
  | '0.6'
  | '0.7'
  | '0.8'
  | '0.9'
  | '1.0';

export type SSGRouteOptions =
  | string
  | {
      url: string;
      output?: string;
      params?: Record<string, any>[];
      headers?: Record<string, any>;
    };
