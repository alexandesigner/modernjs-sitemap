# Sitemap

> A basic plugin to generate the file with the application routes for https://modernjs.dev/

<p>
 <img alt="Static Badge" src="https://img.shields.io/badge/alexandesigner%2Fmodernjs-sitemap?style=flat-square&color=00a8f0">
 <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/modernjs-sitemap?style=flat-square&color=00a8f0">
 <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&color=00a8f0" alt="License" />
</p>

## Get started

**Using pnpm**

```sh
$ pnpm install --save modernjs-sitemap
```

**Usage in project**

```sh
import { sitemapPlugin } from 'modernjs-sitemap'

plugins: [..., sitemapPlugin({
    basepath: 'https://example.com'
})],
```

Props to extend configuration

```sh
- *basepath: String
- routes[]: Array with fields urlPath, priority, changefreq, entryName
```

Example:

```sh
import { sitemapPlugin } from 'modernjs-sitemap'

plugins: [..., sitemapPlugin({
    basepath: 'https://example.com',
    routes: [{ urlPath: '/', priority: '0.2', entryName: 'index' }]
})],
```

-----

## Development

### Setup

Install the dependencies:

```bash
pnpm run install
```

### Get Started

Run and debug the module:

```bash
pnpm run dev
```

Build the module for production:

```bash
pnpm run build
```

Enable optional features:

```bash
pnpm run new
```

Other commands:

```bash
pnpm run lint         # Lint and fix source files
pnpm run change       # Add a new changeset
pnpm run bump         # Update version and changelog via changeset
pnpm run release      # Release the package
```

## Bug?

Submit it in the [issues](https://github.com/alexandesigner/modernjs-sitemap/issues)

## Get Involved

We'd love for you to help us. If you'd like to be a contributor, check out our <a href="https://github.com/alexandesigner/modernjs-sitemap/blob/master/.github/CONTRIBUTING.md" target="_blank">Contributing guide</a>

<p>Designed with ♥ by <a target="_blank" href="https://github.com/alexandesigner" title="Allan Alexandre">Allan Alexandre</a>. Licensed under the <a target="_blank" href="https://github.com/vishnucss/vishnu#license" title="MIT License">MIT License</a>.</p>
