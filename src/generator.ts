import fs from 'node:fs';
import path from 'node:path';
import type { Route } from './types';

/**
 * Generates a sitemap XML file based on the provided routes.
 * @param routes Array of routes to be included in the sitemap.
 */
export async function generateSitemap(basepath: string, routes: Route[]) {
  const outputPath = path.resolve(
    process.cwd(),
    'config/public',
    'sitemap.xml',
  );
  const outputDir = path.dirname(outputPath);

  try {
    // Check if the output directory exists, if not, create it.
    await fs.promises.access(outputDir).catch(async () => {
      await fs.promises.mkdir(outputDir, { recursive: true });
    });

    const content = createSitemapContent(basepath, routes);

    await fs.promises.writeFile(outputPath, content, 'utf8');
    console.log(`Sitemap generated at: ${outputPath}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

/**
 * Creates the XML content for the sitemap from the given routes.
 * @param routes Array of routes to include in the sitemap.
 * @returns A string representing the XML content of the sitemap.
 */
function createSitemapContent(basepath: string, routes: Route[]): string {
  const currentDate = new Date().toISOString().split('T')[0];

  const urls = routes
    .filter((route: Route) => route.entryPath?.includes('.html'))
    .map((route: Route) => createUrlEntry(basepath, route, currentDate))
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

/**
 * Creates an XML entry for a given route.
 * @param route The route for which to create the XML entry.
 * @param lastModDate The last modification date to include in the entry.
 * @returns A string representing the XML entry for the given route.
 */
function createUrlEntry(
  basepath: string,
  route: Route,
  lastModDate: string,
): string {
  const changefreq = route?.changefreq ?? 'monthly'; // Indicates how frequently the page is likely to change
  const priority = route?.priority ?? '0.8'; // Indicates the priority of this URL relative to other URLs on the site

  return `  <url>
    <loc>${basepath}${route.urlPath}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}
