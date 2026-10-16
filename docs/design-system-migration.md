# Codestra Marketing UI Migration

## Why this bridge exists

Several public pages were created before the corporate design system and contain page-level Tailwind colors, oversized radii and custom CTA treatments. Rewriting every page in one release would create avoidable regression risk.

`src/styles/legacy-marketing-normalization.css` provides a controlled transition layer. It maps those existing utility patterns back to the official Codestra palette, geometry, elevation and interactive rules at the `.marketing-route` boundary.

The bridge is not a second design system and must not receive new feature styling.

## Current behavior

All public routes are wrapped by `MarketingRoute` in `src/App.tsx`. The corporate token layer loads after the original stylesheet, followed by the legacy normalization bridge. This means:

- Shared header, footer, typography, CTA, focus and form rules apply to every public page.
- Existing black, gray, white and yellow utility colors resolve to semantic Codestra colors.
- Existing oversized marketing-card radii are reduced to the corporate geometry scale.
- Existing pill CTAs are normalized to the canonical button shape.
- Authenticated application routes under `/auth/*` are not restyled by this migration.

## Rules for new work

- Do not add selectors to the legacy bridge for a new feature.
- Use `MarketingLayout` or the shared `Navbar` and `Footer` on new public pages.
- Use `Button` from `src/Components/ui/button.tsx` for new actions.
- Use semantic variables from `corporate-design-system.css`.
- Keep page-specific CSS under `src/styles` only when a reusable component cannot express the requirement.
- Run `npm run test:design` before opening or updating a pull request.

## Migration order

1. Services and Industries landing pages.
2. Case studies and About.
3. Contact, sales and support forms.
4. Electronic billing pages.
5. Hiring, Privacy, Login and Signup.
6. Remove normalized legacy utility classes after each page is converted.
7. Delete the compatibility bridge only after repository-wide search confirms no mapped legacy classes remain.

## Per-page completion criteria

A page is fully migrated when:

- It uses the shared shell.
- It contains no literal visual colors.
- It contains no arbitrary radius or spacing utilities.
- It uses canonical buttons.
- Desktop, tablet and mobile views preserve the same hierarchy.
- Keyboard focus, form labels and reduced motion are verified.
- SEO metadata and performance budgets pass.
- The page no longer depends on a selector in the compatibility bridge.
