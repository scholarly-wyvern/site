// Portion maths, shared by two places:
//   1. Eleventy uses it to write the starting amounts into each page.
//   2. The portion calculator (recipe.js) uses it in the visitor's browser.
// Keeping it in one file means both always round amounts the same way.

// Kitchen-friendly fractions: amounts get rounded to the nearest of these
const FRACTIONS = [
  [0, ""],
  [1 / 8, "⅛"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [1 / 2, "½"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
  [1, ""],
];

// Units weighed or measured precisely: shown as whole numbers, not fractions
const METRIC_SMALL = ["g", "ml"];
const METRIC_LARGE = ["kg", "l"];

// Units that change when there's more than one
const PLURALS = { cup: "cups", clove: "cloves", can: "cans", tin: "tins", pinch: "pinches" };

// The scaling rules an ingredient can have (see the recipe template file)
export const SCALE_RULES = ["scale", "whole", "none"];

// Work out the new amount for one ingredient.
//   rule "scale": multiply (the default)
//   rule "whole": multiply, then round to a whole number, never below 1 (eggs)
//   rule "none":  never changes (a pinch, to taste)
export function scaleAmount(amount, factor, rule = "scale") {
  if (amount === undefined || amount === null || rule === "none") return amount;
  const value = amount * factor;
  if (rule === "whole") return Math.max(1, Math.round(value));
  return value;
}

// Turn a number into something you'd read in a recipe: 0.75 -> "¾", 1.5 -> "1½"
export function formatAmount(value, unit) {
  if (value === undefined || value === null || value === "") return "";

  if (METRIC_SMALL.includes(unit)) {
    // 125.4 g -> 125 g; big amounts round to the nearest 5 (nobody weighs 312 g)
    if (value >= 100) return String(Math.round(value / 5) * 5);
    return String(Math.max(1, Math.round(value)));
  }
  if (METRIC_LARGE.includes(unit)) {
    return String(Math.round(value * 100) / 100);
  }

  // Cups, spoons and counted items: whole number plus the nearest fraction
  let whole = Math.floor(value);
  const remainder = value - whole;
  let [bestValue, bestSymbol] = FRACTIONS[0];
  for (const [fracValue, symbol] of FRACTIONS) {
    if (Math.abs(remainder - fracValue) < Math.abs(remainder - bestValue)) {
      bestValue = fracValue;
      bestSymbol = symbol;
    }
  }
  if (bestValue === 1) whole += 1;
  if (whole === 0 && bestSymbol === "") return "⅛"; // tiny, but not nothing
  return `${whole || ""}${bestSymbol}`;
}

// "cup" -> "cups" when there's more than one
export function formatUnit(unit, value) {
  if (!unit) return "";
  if (value > 1 && PLURALS[unit]) return PLURALS[unit];
  return unit;
}
