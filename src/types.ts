export type Route = {
  path?: string;
  children?: Route[];
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any;
};

export type ExtractedPath = {
  urlPath: string;
} & StaticRoute;

export type StaticRoute = {
  urlPath: string;
  entryPath: string;
  entryName: string;
};

export type ModifyFileSystemRoutesParams = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  entrypoint: any;
  routes: Route[];
};

export type ModifyServerRoutesParams = {
  routes: Route[];
};

export interface SitemapItem {
  urlPath: string;
  priority: string;
  changefreq: string;
  entryName: string;
}

export interface SitemapConfig {
  basepath?: string;
  routes?: SitemapItem[];
}
