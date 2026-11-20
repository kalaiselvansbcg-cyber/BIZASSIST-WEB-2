---
name: quiet-luxury-theme
description: Design tokens, typography, components and motion rules for the BizAssist AI "Quiet Luxury" theme. Use whenever styling or editing any BizAssist AI page.
---

# Quiet Luxury Theme

### Intent
Almost monochrome, editorial, calm and premium. Inspired by the restraint and whitespace of high-end fashion sites (Louis Vuitton, Peter England). Take the feel only. Do not copy logos, wording, images or brand assets.

### Tokens (single source of truth: `css/theme.css` or the top of the main stylesheet)
```css
:root {
  --bg: #FAF8F5;           /* page (warm cream) */
  --surface: #FFFFFF;      /* cards, forms, modals */
  --surface-alt: #EFEBE4;  /* panels, image frames */
  --ink: #111111;          /* text, primary buttons, lines of emphasis */
  --ink-soft: #5E5A53;     /* body copy */
  --muted: #6F6A61;        /* small labels (AA on --bg) */
  --line: #E3DED6;         /* hairlines */
  --accent: #B3402A;       /* ONLY Urgent dots and error text */
  --radius: 0;
  --font-serif: "Cormorant Garamond", "Playfair Display", Georgia, serif;
  --font-sans: "Inter", "Helvetica Neue", Arial, sans-serif;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}
```
Color budget: cream, white, warm gray, black, plus the one red accent. No teal, amber, green, blue, gradients, glow or drop shadows. Status is shown with text, a small dot, and filled vs hollow shapes, never with colored backgrounds.

### Typography
- Google Fonts: Cormorant Garamond (400, 500, 400 italic) and Inter (400, 500), `font-display: swap`, preload the main files.
- h1 `clamp(44px, 6vw, 88px)`, h2 `clamp(32px, 4vw, 56px)`, serif, weight 400, line-height 1.05 to 1.15. One italic phrase per headline.
- Body: Inter 16 to 18px, line-height 1.6, `--ink-soft`.
- Labels, nav, buttons, table heads: Inter 12 to 13px, uppercase, letter-spacing 0.18 to 0.22em, weight 500.
- Logo "BIZASSIST AI": serif, uppercase, letter-spacing 0.4em.

### Layout
- Max width 1380px, side padding `clamp(20px, 5vw, 110px)`, section padding `clamp(96px, 12vw, 180px)` vertical. One idea per screen.
- 1px `--line` hairlines. Cards: white, 1px border, no radius, no shadow.
- Two-column editorial layouts collapse to one column under 860px.

### Components
- **Primary button:** solid `--ink`, white uppercase label, sharp corners, padding 20px 40px. Hover: becomes `--bg` with `--ink` text and 1px `--ink` border (250ms).
- **Secondary:** underlined text link with a thin arrow; underline slides in from the left on hover.
- **Focus:** 2px `--ink` outline, 3px offset on every interactive element.
- **Inputs:** white, 1px `--line` border, uppercase label above, border turns `--ink` on focus. Errors in `--accent` with a small dot.
- **Chips and status:** bordered rectangles or text with a leading dot. Urgent = red dot + "URGENT". All other priorities use ink dots.
- **Ticket tracker:** 2px line with five 10px squares. Done = filled ink, current = hollow with 1.5px ink border, future = `--line`. Fill animates left to right.
- **Cards grid:** shared hairline borders, small uppercase category, serif title, "OPEN" link with arrow. Hover: `--surface-alt` background, arrow moves 6px.
- **Accordion:** hairline rows, thin plus/minus icon that rotates, `aria-expanded` kept in sync.
- **Chatbot and modals:** white panel, 1px ink border, sharp corners. The floating button is a small black square with a thin line icon.
- **Icons:** 1.5px stroke line icons, `currentColor`. No emoji anywhere.

### Motion
- Easing `--ease`, 250 to 600ms. No bounces, spins, custom cursors or parallax.
- Scroll reveal: fade up 16px once, stagger 80ms (IntersectionObserver). Only hide content when a `js` class is on `<html>` so nothing disappears if JS fails.
- Header hides on scroll down and returns on scroll up, gaining a hairline after scrolling.
- Full-screen menu overlay with large serif links, ESC to close, focus trap, focus restored on close.
- Wrap all motion in `@media (prefers-reduced-motion: no-preference)`.
