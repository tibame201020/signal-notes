# Blog content conventions

The blog is a static Astro site intended to be published as a dedicated GitHub Pages repository.

## Post structure

```text
src/content/posts/<slug>/
  index.md
  assets/             # article-local images
  source.md.txt       # optional untouched source snapshot
public/assets/posts/<slug>/
  ...                 # raw static/downloadable assets
```

Only `index.md` / `index.mdx` files are loaded as posts.

## Frontmatter

```yaml
---
title: "..."
slug: "stable-url-slug"
description: "..."
publishedAt: 2026-10-07
updatedAt: 2026-10-07
category:
  name: "AI / Agent"
  slug: "ai-agent"
tags:
  - name: "Multi-Agent"
    slug: "multi-agent"
draft: false
featured: false
---
```

- One primary category per post.
- Zero or more tags.
- Taxonomy slugs are URL-safe and stable.
- `draft: true` keeps a post out of generated routes.

## Assets

Use `src/content/posts/<slug>/assets/` for article-local images referenced from Markdown. Relative Markdown image paths such as `![alt](./assets/figure.svg)` are verified to build correctly and are emitted as static assets.

Use `public/assets/posts/<slug>/` for files copied byte-for-byte, such as downloadable attachments or assets that need stable URLs.

Article content and assets are Git-versioned. SQLite records paths and publication URLs; it does not store article/media blobs.

## Generated routes

- `/` latest posts + taxonomy entry points
- `/articles/` all posts
- `/articles/<slug>/`
- `/categories/`
- `/categories/<slug>/`
- `/tags/`
- `/tags/<slug>/`
- `/rss.xml`
- sitemap generated at build time

## Publishing model

The root `content-production` repository remains the local source repository.

Only the `blog/` subtree should be pushed to the dedicated GitHub Pages repository. That keeps video/n8n/local-service code out of the public publishing repository.
