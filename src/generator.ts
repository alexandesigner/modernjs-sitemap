import fs from 'node:fs';
import path from 'node:path';
import type { Route, SitemapConfig } from './types';

/**
 * Generates a sitemap XML file based on the provided routes.
 * @param basepath The base path for the sitemap.
 * @param routes Array of routes to be included in the sitemap.
 * @param outDir The output directory for the sitemap file.
 */
export async function generateSitemap(
  basepath: string,
  routes: Route[],
  outDir?: string,
) {
  const outputPath = path.resolve(
    process.cwd(),
    outDir ?? 'config/public',
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

/**
 * Generates a robots.txt file based on the provided configuration.
 * @param basepath The base path for URLs.
 * @param robotsConfig The robots configuration from modern.config.ts.
 */
export const generateRobotsTxt = async (
  robotsConfig: SitemapConfig['robots'],
  outDir = 'config/public',
) => {
  const outputDirPath = path.join(process.cwd(), outDir); // Use path.join for relative directory
  const robotsFilePath = path.join(outputDirPath, 'robots.txt');
  let robotsTxtContent = '';

  if (typeof robotsConfig === 'boolean' && robotsConfig) {
    // Default allow all if robots is true
    robotsTxtContent = 'User-agent: *\nDisallow:\n';
  } else if (typeof robotsConfig === 'object') {
    robotsTxtContent += `User-agent: ${robotsConfig.userAgent || '*'}\n`;

    if (robotsConfig.disallow) {
      const disallow = Array.isArray(robotsConfig.disallow)
        ? robotsConfig.disallow
        : [robotsConfig.disallow];
      for (const rule of disallow) {
        robotsTxtContent += `Disallow: ${rule}\n`;
      }
    }

    if (robotsConfig.allow) {
      const allow = Array.isArray(robotsConfig.allow)
        ? robotsConfig.allow
        : [robotsConfig.allow];
      for (const rule of allow) {
        robotsTxtContent += `Allow: ${rule}\n`;
      }
    }
  }

  try {
    await fs.promises.access(outputDirPath).catch(async () => {
      await fs.promises.mkdir(outputDirPath, { recursive: true });
    });

    await fs.promises.writeFile(robotsFilePath, robotsTxtContent, 'utf8');
    console.log(`Generated robots.txt at ${robotsFilePath}`);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
  }
};
