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


// =====================================================================
// MEASUREMENT CONVERSION (the "As written / US / Metric" toggle)
// =====================================================================
// Cups and spoons aren't the same size everywhere. The big one is the
// tablespoon: an Australian tablespoon is 20 ml, a US one about 15 ml.
// Each recipe says which system it was written in ("measures: au").

// Millilitres per cup / tablespoon / teaspoon in each system
export const SYSTEMS = {
  au: { cup: 250, tbsp: 20, tsp: 5 },
  us: { cup: 236.6, tbsp: 14.79, tsp: 4.93 },
  metric: { cup: 250, tbsp: 15, tsp: 5 },
};

const SPOONS_AND_CUPS = ["cup", "tbsp", "tsp"];
const GRAMS_PER_OUNCE = 28.35;

function toMl(value, unit, system) {
  if (unit === "ml") return value;
  if (unit === "l") return value * 1000;
  if (SPOONS_AND_CUPS.includes(unit)) return value * SYSTEMS[system][unit];
  return null;
}

function toGrams(value, unit) {
  if (unit === "g") return value;
  if (unit === "kg") return value * 1000;
  return null;
}

// Write an amount of liquid or dry goods the way a US recipe would:
// "½ cup + 1 tbsp", "2 tbsp + 2 tsp", "1 tsp"
function formatUsVolume(ml) {
  const { cup, tbsp, tsp } = SYSTEMS.us;

  if (ml >= cup / 4 - tbsp / 2) {
    const cups = ml / cup;
    // US cup measures: ¼ ⅓ ½ ⅔ ¾ (no ⅛ cup)
    const options = [0, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 1].map((f) => Math.floor(cups) + f).filter((v) => v > 0);
    const nearestValue = options.reduce((a, b) => (Math.abs(b - cups) < Math.abs(a - cups) ? b : a));
    const nearest = formatAmount(nearestValue, "cup");
    // Close enough to a tidy cup measure? (within half a tbsp or 6%)
    if (Math.abs(nearestValue - cups) * cup <= Math.max(tbsp / 2, ml * 0.06)) {
      return `${nearest} ${nearestValue > 1 ? "cups" : "cup"}`;
    }
    // Otherwise: the cup measure just below, plus tablespoons
    const below = [0, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4]
      .map((f) => Math.floor(cups) + f)
      .filter((v) => v <= cups && v > 0)
      .pop();
    const extraTbsp = Math.round((ml - below * cup) / tbsp);
    const cupText = formatAmount(below, "cup");
    return `${cupText} ${below > 1 ? "cups" : "cup"}` + (extraTbsp ? ` + ${extraTbsp} tbsp` : "");
  }

  if (ml >= tbsp * 0.9) {
    const wholeTbsp = Math.floor(ml / tbsp + 0.1);
    const extraTsp = Math.round(((ml - wholeTbsp * tbsp) / tsp) * 2) / 2;
    if (extraTsp >= 3) return `${wholeTbsp + 1} tbsp`;
    return `${wholeTbsp} tbsp` + (extraTsp ? ` + ${formatAmount(extraTsp, "tsp")} tsp` : "");
  }

  return `${formatAmount(ml / tsp, "tsp")} tsp`;
}

// Convert one ingredient for the chosen view.
//   view: "original" | "us" | "metric"
//   from: the system the recipe was written in ("au", "us", "metric")
//   info: { gPerMl, liquid } from ingredientWeights.json (may be empty)
// Returns the full text to show (e.g. "½ cup + 1 tbsp"), or null to keep
// the amount as written (pinches, counted items, or nothing to convert).
export function convertAmount(value, unit, from, view, info = {}) {
  if (view === "original" || value === undefined || value === null || !unit) return null;

  const grams = toGrams(value, unit);
  const ml = toMl(value, unit, from);

  if (view === "us") {
    if (ml !== null) return formatUsVolume(ml);
    if (grams !== null) {
      // Weighed ingredients: into cups if we know how heavy they are
      // (most US kitchens don't have scales), otherwise ounces
      if (info.gPerMl) return formatUsVolume(grams / info.gPerMl);
      const oz = grams / GRAMS_PER_OUNCE;
      return `${oz >= 10 ? Math.round(oz) : Math.round(oz * 2) / 2} oz`.replace(".5", "½");
    }
    return null;
  }

  if (view === "metric") {
    if (grams !== null) return null; // already metric
    if (ml === null) return null;
    if (unit === "tsp") return null; // a teaspoon is 5 ml everywhere
    if (info.gPerMl && !info.liquid) return `${formatAmount(ml * info.gPerMl, "g")} g`;
    return `${formatAmount(ml, "ml")} ml`;
  }

  return null;
}

// Oven temperatures: 150°C -> 300°F (rounded to the nearest 25, like US oven dials)
export function toFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 / 25 + 32 / 25) * 25;
}
