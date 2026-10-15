# Optional feature routes

Public features that should remain isolated from the core marketing shell register a route from this directory.

Each `*.tsx` module exports a `featureRoute` object with a root-relative `path` and a React `element`. The website shell discovers these modules with `import.meta.glob`, allowing a feature branch to add a route without editing `src/App.tsx`.

The Odoo/Kong/Caddy lead-intake feature is intentionally implemented in its own branch using this extension point.
