# Scholar's Wyvern

A personal library of games, food, books and crafts, guarded by Quill the wyvern.

Built step by step with Claude, as a live project for learning how to make and run a website.

## What's here

| Path | What it is |
|---|---|
| `src/` | Everything we write. Eleventy turns it into the finished site |
| `src/index.html` | Home page |
| `src/recipes/` | One file per recipe, plus `_recipe-template.md` to copy for new ones |
| `src/_includes/` | Layouts (the shared frame and the recipe template) and reusable pieces like Quill's tip |
| `src/_data/` | Site settings: the nav, the list of allowed recipe tags |
| `src/css/styles.css` | The shared stylesheet: colours, fonts, header, footer. One change here updates every page. |
| `src/js/` | The portion calculator, measurement toggle and recipe card printing |
| `scripts/make-cards.js` | Makes the 10×15 cm card images for photo printing, after each build |
| `src/images/` | Quill, the logos, favicons and guide art (web-sized copies; originals are kept elsewhere) |
| `eleventy.config.js` | Eleventy's settings, plus the recipe checks |
| `CLAUDE.md` | Instructions for Claude when it works on this repo |

## How it's built and published

The site is built with [Eleventy](https://www.11ty.dev/), which fills each page into shared templates. That way the header and footer are written once, and each recipe is a short text file rather than a whole web page. Eleventy writes the finished site into `_site/`, which isn't stored in the repo because it gets rebuilt every time. It will be published with GitHub Pages.

| Command | What it does |
|---|---|
| `npm install` | Downloads Eleventy (once) |
| `npm run build` | Builds the site exactly as visitors will see it (no drafts), then makes the recipe card images |
| `npm run preview` | Builds the site including drafts and serves it at http://localhost:8080 |
| `npm run cards` | Re-makes just the recipe card images (needs Google Chrome) |

## Adding a recipe

1. Copy `src/recipes/_recipe-template.md` and name the copy after the recipe, e.g. `lemon-cake.md`.
2. Fill it in, keeping `draft: true` while it's unfinished.
3. When it's ready, set `draft: false`. The build refuses a recipe that still has `[Placeholder: …]` text, an unknown tag, or an amount that isn't a number, so mistakes can't go live.
