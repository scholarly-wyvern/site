# Notes for Claude

## Who you're working with
Dee is learning to build and run this site and isn't a developer. Explain the *why* behind each change, not just the *what*, in plain language. Keep explanations brief, using bullets or tables.

## The site
- Plain static HTML + CSS for now: no frameworks or build tools until there's a clear reason to add them (and explain the reason first).
- The plan and decisions live in the claude.ai Project "Scholar's Wyvern Site" (`site-plan.md`, `asset-list.md`).
- The mascot is a butterfly-winged wyvern called **Quill**.

## Design rules
- Everything follows the Scholar's Wyvern design system. Its tokens are copied into the top of `css/styles.css`.
- Use the role tokens (`var(--ink)`, `var(--action)`, …), never raw hex colours, in new CSS.
- Night theme (`class="theme-night"`) for heroes and footers; Parchment (the default) for reading areas.
- Links are always underlined. One primary button per view. Gold (`--gilt`) is for ornament only, and lime (`--highlight`) only for small accents.
- Keep the focus outline and real `<a>` / `<button>` elements, so everything works with a keyboard.

## Content rules
- The site is public. No real names, contact details or anything private.
- Never put photos of children's faces or children's names on the site.
- D&D rules text is written in our own words. If SRD 5.2 text is used, add its CC BY 4.0 credit line.
- Campaign content is only published after the players have reached it in play.

## Files
- Image file names: lowercase with dashes, no spaces (`quill-hero.webp`).
- Web images should be compressed (aim for under ~200 KB). Originals stay out of the repo.
