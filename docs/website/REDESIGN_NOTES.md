# Codestra website modernization

This branch modernizes the public shell without changing the established React/Vite deployment stack.

## Design direction

- Retains Codestra's dark interface and gold accent.
- Uses a large, editorial layout with generous spacing and simple motion.
- Replaces the image-heavy homepage hero with CSS and semantic HTML.
- Keeps public navigation accessible by keyboard and on small screens.
- Uses system fonts to remove a render-blocking third-party font request.

## Performance decisions

- No global AOS initialization on the public application shell.
- No multi-megabyte hero image on the homepage.
- Route-level lazy loading remains enabled.
- Fingerprinted assets receive immutable caching; HTML remains uncached.
- Nginx compression is enabled for text assets.

## SEO foundation

- Clean default title and description.
- Canonical, Open Graph and Twitter metadata.
- Route-specific metadata for the existing public pages.
- Semantic headings, landmarks and crawlable links.
- `robots.txt`, web manifest and a scalable favicon.

A later stacked branch adds the service and industry landing-page system, static route generation and sitemap output.
