# Notes for Claude

## Who you're working with
Dee is learning to build and run this site and isn't a developer. Explain the *why* behind each change, not just the *what*, in plain language. Keep explanations brief, using bullets or tables.

## The site
- Built with **Eleventy** (added 2026-11-17 so recipes can be one template + one data file each, and so the header/footer are written once). Don't add other frameworks or build tools without a clear reason, explained first.
- Everything we write lives in `src/`. Eleventy builds the finished site into `_site/` (never edit or commit that).
- Shared header/footer: `src/_includes/layouts/base.njk`. Nav and site settings: `src/_data/site.json`.
- Reusable pieces live in `src/_includes/components/` (e.g. `quill-tip.njk`).
- Check every change with `npm run build` (published view) and `SHOW_DRAFTS=1 npm run build` (includes drafts).
- **Recipe cards** (10×15 cm, two-sided): `src/_includes/components/recipe-card.njk`, fitted and printed by `src/js/card.js`. After Eleventy builds, `scripts/make-cards.js` photographs each card into `card-front.jpg` / `card-back.jpg` for photo printing (added 2026-11-17: photo services print images, not web pages). It uses `playwright-core` with the Chrome already installed on GitHub's computers (no browser download), and warns if a card's text doesn't fit even at the smallest size.
- `site.url` in `src/_data/site.json` is used for the QR codes on cards. Update it if the site's address changes (e.g. a custom domain).
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

## Recipes
- One file per recipe in `src/recipes/`, laid out by `src/_includes/layouts/recipe.njk`. Copy `src/recipes/_recipe-template.md` to start one; it explains every field.
- When Dee shares a recipe from her notes: keep her wording and amounts, tidy only lightly, and mark every gap as `[Placeholder: …]`. Never invent amounts, times or tips and present them as hers. New recipes start as `draft: true`.
- Amounts must be numbers (0.75, not ¾). Tags must come from `src/_data/recipeTags.json`.
- **Measuring system (`measures:`)**: always check the source.
  - Dee's own handwritten notebooks: Australian (`au`: 250 ml cup, 20 ml tablespoon).
  - Her grandmother's handwritten book: early entries are imperial, later ones (after 1966) metric. Check each entry, and ask Dee if unclear. Imperial isn't supported by the converter yet: add it when the first imperial recipe arrives.
  - Cookbooks from other countries: check which system the book uses; ask if it isn't stated.
- **Oven temperatures**: assume Dee's numbers are fan-forced (the site default) unless she says otherwise. Set `ovenType: conventional` only when the source says so.
- **Flour**: if a recipe says sifted, add `sifted: true` (it uses the lighter ~125 g/cup weight). If unclear, ask.
- **Dee's recipe writing style** (from her commercial recipe-writing experience):
  - Each step is a short, clear sentence. Easy to follow while multitasking.
  - Flag pressure points and things to watch for, briefly. Never turn a step into a paragraph.
  - No life story. The intro is one or two sentences at most: people came for the recipe.
  - Old recipes (e.g. her grandmother's books) are updated with proper testing and full instructions, and adjusted for modern ingredients (produce, chickens etc. are different sizes now; commercial tomatoes are sweeter). Never invent those adjustments: Dee supplies them after testing.
  - Published cookbook recipes are never copied. What gets published is Dee's own adapted version (her margin notes and changes), in her words.
- The build refuses published recipes that still contain placeholders, unknown tags or non-number amounts. Don't weaken these checks to get a build through: fix the recipe.

## Files
- Image file names: lowercase with dashes, no spaces (`quill-hero.webp`).
- Web images should be compressed (aim for under ~200 KB). Originals stay out of the repo.
