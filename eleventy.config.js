// Eleventy settings: how the site gets built.
//
// Eleventy reads everything in src/, fills pages into the shared layouts,
// and writes the finished website into _site/. Visitors only ever see
// _site/ (GitHub builds it for us), so never edit files in _site/ by hand.

import { formatAmount, formatUnit, formatTemperature, SCALE_RULES } from "./src/js/scale.js";
import recipeTags from "./src/_data/recipeTags.json" with { type: "json" };
import ingredientWeights from "./src/_data/ingredientWeights.json" with { type: "json" };

// Set SHOW_DRAFTS=1 (the "npm run preview" command does) to see draft
// recipes while working on them. The published site never includes them.
const showDrafts = Boolean(process.env.SHOW_DRAFTS);

export default function (eleventyConfig) {
  // Copy these folders across as they are: they need no processing.
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/js");

  // Files starting with "_" are notes or blanks to copy, not pages
  eleventyConfig.ignores.add("src/**/_*.md");

  // --- Filters: small helpers the templates use -------------------------
  // {{ 0.75 | amount("cup") }} -> "¾"
  eleventyConfig.addFilter("amount", (value, unit) => formatAmount(value, unit));
  // {{ "cup" | unitLabel(2) }} -> "cups"
  eleventyConfig.addFilter("unitLabel", (unit, value) => formatUnit(unit, value));
  // Highlights "[Placeholder: …]" text so gaps are easy to spot in drafts
  eleventyConfig.addFilter("placeholders", (text) => {
    if (typeof text !== "string") return text;
    return text.replace(/\[Placeholder:[^\]]*\]/g, (match) => `<mark class="placeholder">${match}</mark>`);
  });

  // Marks oven temperatures ("150°C") so they can be shown for the reader's
  // oven: fan-forced or conventional, °C or °F. "detailed" shows both oven
  // types (used for the Oven line at the top of a recipe).
  eleventyConfig.addFilter("temperatures", (text, ovenType = "fan", detailed = false) => {
    if (typeof text !== "string") return text;
    return text.replace(/(\d{2,3})\s?°C(?:\s+(?:fan-forced|fan|conventional))?/g, (match, c) =>
      `<span data-temp-c="${c}"${detailed ? " data-temp-detailed" : ""}>${formatTemperature(Number(c), ovenType, "original", detailed)}</span>`);
  });

  // How heavy an ingredient is, for the measurement toggle. A value on the
  // ingredient line wins over the shared table in ingredientWeights.json.
  eleventyConfig.addFilter("ingredientInfo", (ingredient) => {
    const shared = ingredientWeights[(ingredient.item || "").toLowerCase()] ?? {};
    // Sifted ingredients are lighter per cup, so use the sifted weight if known
    const sharedWeight = ingredient.sifted ? (shared.gPerMlSifted ?? shared.gPerMl) : shared.gPerMl;
    return { gPerMl: ingredient.gPerMl ?? sharedWeight, liquid: ingredient.liquid ?? shared.liquid };
  });

  // --- Recipe checks -----------------------------------------------------
  // These run before each recipe is built. If something's wrong, the build
  // stops with a plain-English message, so mistakes can't reach the live site.
  eleventyConfig.addPreprocessor("recipe-checks", "md", (data, content) => {
    if (!data.tags?.includes("recipe")) return; // not a recipe: skip

    const name = data.page.inputPath;
    if (data.draft && !showDrafts) return false; // drafts are left out

    const problems = [];

    if (typeof data.makes?.amount !== "number") {
      problems.push('"makes: amount" must be a number, e.g. 4');
    }

    if (data.ovenType && !["fan", "conventional"].includes(data.ovenType)) {
      problems.push('"ovenType" must be fan or conventional');
    }

    if (data.measures && !["au", "us", "metric"].includes(data.measures)) {
      problems.push('"measures" must be au, us or metric');
    }

    for (const tag of data.tags) {
      if (tag !== "recipe" && !(tag in recipeTags)) {
        problems.push(`the tag "${tag}" isn't in src/_data/recipeTags.json (add it there, or fix the spelling)`);
      }
    }

    for (const group of data.ingredients ?? []) {
      for (const item of group.items ?? []) {
        if (item.amount !== undefined && typeof item.amount !== "number") {
          problems.push(`"${item.item}": the amount must be a number (write 0.5, not ½ or "1/2")`);
        }
        if (item.scale && !SCALE_RULES.includes(item.scale)) {
          problems.push(`"${item.item}": scale must be one of ${SCALE_RULES.join(", ")}`);
        }
      }
    }

    if (!data.draft) {
      const text = JSON.stringify([data.title, data.description, data.makes, data.prep, data.cook,
        data.ingredients, data.scalingNote, data.tips, data.storage, data.keeps, data.freezing]) + content;
      if (text.includes("[Placeholder")) {
        problems.push('it still has "[Placeholder: …]" text. Fill those in or delete them, or set "draft: true"');
      }
    }

    if (problems.length) {
      throw new Error(`Recipe problem in ${name}:\n  - ${problems.join("\n  - ")}`);
    }
  });

  return {
    dir: {
      input: "src", // what we write
      output: "_site", // what Eleventy builds (not committed)
      includes: "_includes", // layouts and reusable pieces
      data: "_data", // site-wide settings, e.g. the nav
    },
    // Let .html and .md pages use the same template language as the layouts
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
