# Codestra Corporate Design System

## Purpose

This document is the visual and interaction source of truth for the Codestra public website. The goal is a disciplined, premium corporate experience with the clarity, restraint and operational confidence found in leading aerospace and technology brands—without copying their assets, typography, page composition or intellectual property.

Every public page and landing page must use the shared tokens and components defined here. New work must extend the system rather than invent a parallel style.

## Brand foundation

Codestra uses a high-contrast dark identity with one controlled accent.

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Primary canvas | `--brand-canvas` | `#080808` | Main page background |
| Deep canvas | `--brand-canvas-deep` | `#050505` | Footer and deepest surfaces |
| Surface | `--brand-surface` | `#0F1012` | Cards, panels and form fields |
| Raised surface | `--brand-surface-raised` | `#151619` | Hover and elevated content |
| Primary text | `--brand-ink` | `#F7F8FA` | Headings and critical copy |
| Supporting text | `--brand-ink-soft` | `#C9CBD1` | Body copy |
| Muted text | `--brand-ink-muted` | `#979AA2` | Metadata and secondary labels |
| Border | `--brand-line` | `#292B30` | Dividers and card boundaries |
| Brand accent | `--brand-accent` | `#FFD700` | Primary CTA, focus, status and emphasis |

### Color rules

- Yellow is an action and emphasis color, not a decorative fill for large areas.
- Public pages use near-black backgrounds, warm-white type and restrained gray surfaces.
- Do not add blue, purple, green or gradient brand themes to marketing pages.
- Status colors are reserved for real success, warning, error or operational state.
- Do not place literal hex, RGB, HSL or Tailwind palette utilities in feature components. Use semantic variables.

## Typography

The UI font stack is defined by `--font-ui` and `--font-display`. It prioritizes Inter and production-safe system sans-serif fallbacks.

- Display headings: weight 720, very tight tracking, balanced line wrapping.
- Section headings: strong hierarchy with compact line height.
- Body copy: 16–21 px depending on context, maximum readable line length around 65–75 characters.
- Navigation, buttons and eyebrow labels: uppercase, small, carefully tracked.
- Do not introduce page-specific font families.
- Avoid excessive bold copy. Use hierarchy, space and contrast before adding weight.

## Layout discipline

The primary content width is `1280px`. Use the `.shell` class for aligned page content.

- Desktop side gutters: 24 px minimum.
- Mobile side gutters: 16 px minimum.
- Major sections: 96–144 px vertical space.
- Related items use the shared spacing scale in `corporate-design-system.css`.
- Prefer a 12-column mental model, clear alignment lines and intentional asymmetry.
- Use one dominant idea per viewport section.
- Avoid nested containers with unrelated widths.

## Radius, borders and elevation

Codestra uses precise geometry rather than soft, playful UI.

- Primary radius: 2–4 px.
- Cards and visual panels may use 4–14 px only when the content benefits from grouping.
- Do not use fully rounded pills for ordinary buttons or cards.
- Borders carry most of the structure. Shadows are reserved for elevated system visuals and overlays.
- Hover states should improve contrast or border emphasis; avoid exaggerated bouncing or scaling.

## Buttons and calls to action

Use the canonical `Button` component or the `.button` class family.

### Primary CTA

Class: `.button.button--primary`

Use for the single most important action in a section, such as “Start a project,” “Book a consultation,” or “Submit request.” It uses Codestra yellow with near-black text.

### Secondary CTA

Class: `.button.button--secondary`

Use for exploration, comparison or a lower-priority path. It uses a transparent dark surface and a controlled border.

### Quiet and link actions

Use `.button--quiet` or `.button--link` only for tertiary actions. Do not place three visually equal CTAs in the same decision area.

### CTA rules

- One primary CTA per section.
- Button text should start with a clear verb.
- Keep labels short and specific.
- Minimum target height is 44 px; the default is 50 px.
- Buttons use uppercase labels and consistent tracking.
- Never hardcode a new button color, radius or height inside a page.

## Header

The site header is fixed, 76 px high on desktop and 70 px on smaller screens.

- Brand at left, primary navigation centered, account and project actions at right.
- The primary navigation contains Services, Industries, Case studies and About.
- “Start a project” is the global primary CTA.
- Mobile navigation uses a full-width dark panel beneath the header.
- Do not create page-specific headers or alternate navigation color schemes.

## Footer

The footer always includes:

1. A final business CTA.
2. Codestra positioning and support contacts.
3. Solution links.
4. Company links.
5. Office information.
6. Legal and delivery-region information.

Do not reduce the footer to a single copyright row on landing pages. It is a trust and navigation surface.

## Landing-page structure

New landing pages should follow this order unless the user journey clearly requires another sequence:

1. **Hero:** one outcome-driven headline, one supporting paragraph, one primary and one secondary action.
2. **Trust or proof:** client evidence, operational capabilities, integrations or measurable outcomes.
3. **Problem and solution:** articulate the expensive operational problem before listing features.
4. **Capabilities:** three to six focused cards using the shared grid.
5. **How it works:** a three-step implementation or operating model.
6. **Security and reliability:** explain production controls where relevant.
7. **Use cases or industries:** make the offer concrete.
8. **Final CTA:** repeat the primary next step with a new supporting reason.
9. **Shared footer.**

Avoid filler sections, generic stock claims and repeated feature grids.

## Images and motion

- Prefer real product views, architecture visuals, customer environments and original diagrams.
- Avoid generic office stock photography when it does not add evidence.
- Images should support the message rather than serve as background decoration alone.
- Motion should communicate hierarchy, state or system flow.
- Default transition duration is 140–220 ms.
- Respect `prefers-reduced-motion`.
- Avoid parallax, continuous floating elements and large autoplay video unless performance and accessibility budgets are met.

## Accessibility

- All interactive controls must have visible keyboard focus.
- Minimum pointer target is 44 × 44 px.
- Heading levels must follow document order.
- Navigation must have accessible labels and current-page state.
- Form labels must remain visible; placeholders are not labels.
- Decorative icons use `aria-hidden="true"`.
- Meaningful images require useful alternative text.
- Color is never the only signal for state or validation.

## Implementation source of truth

- Tokens and public-page CSS: `src/styles/corporate-design-system.css`
- Shared header: `src/Components/Layouts/Navbar.tsx`
- Shared footer: `src/Components/Layouts/Footer.tsx`
- Legacy-compatible buttons: `src/Components/components/Button.tsx`
- Canonical reusable button: `src/Components/ui/button.tsx`
- Public-route boundary: `src/App.tsx`
- Automated guard: `scripts/check-design-system.mjs`

Run:

```bash
npm run test:design
```

The guard validates required tokens and components, then rejects newly added raw colors, arbitrary visual utilities, inline visual styles, unapproved font declarations and raw buttons outside the canonical implementation files.

## Change control

Any deliberate change to brand color, typography, spacing, geometry, shared navigation or CTA behavior must:

1. Update this document.
2. Update semantic tokens or shared components rather than individual pages.
3. Pass lint, unit tests, design guard, production build, SEO, performance and dependency checks.
4. Include desktop and mobile evidence in the pull request.
5. Receive review from the design-system code owner before merge when branch protection is enabled.
