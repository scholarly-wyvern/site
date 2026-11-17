// The portion calculator on recipe pages.
//
// The page already shows the original amounts without this script, so the
// recipe still works if JavaScript fails or is switched off. This script
// only adds the controls and does the maths when someone changes the yield.

import { scaleAmount, formatAmount, formatUnit } from "./scale.js";

const calc = document.querySelector("[data-portion-calc]");

if (calc) {
  const base = Number(calc.dataset.base);
  const input = calc.querySelector("input");
  const note = calc.querySelector("[data-scale-note]");
  const status = calc.querySelector("[data-status]");
  const yieldUnit = calc.dataset.unit;
  const ingredients = document.querySelectorAll("[data-amount]");

  function update(newYield) {
    // Keep the number sensible: at least 1, whole numbers only
    const target = Math.max(1, Math.round(Number(newYield) || base));
    input.value = target;
    const factor = target / base;

    for (const line of ingredients) {
      const amount = Number(line.dataset.amount);
      const unit = line.dataset.unit || "";
      const scaled = scaleAmount(amount, factor, line.dataset.scale);
      line.querySelector("[data-qty]").textContent = formatAmount(scaled, unit);
      const unitEl = line.querySelector("[data-unit-label]");
      if (unitEl) unitEl.textContent = formatUnit(unit, scaled);
    }

    // Show the "what doesn't scale" note only when the recipe has changed
    if (note) note.hidden = factor === 1;
    // Tell screen-reader users the amounts changed (the page doesn't reload)
    status.textContent = `Amounts updated for ${target} ${yieldUnit}.`;

    for (const button of calc.querySelectorAll("[data-factor]")) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.factor) === factor));
    }
  }

  calc.querySelector("[data-less]").addEventListener("click", () => update(Number(input.value) - 1));
  calc.querySelector("[data-more]").addEventListener("click", () => update(Number(input.value) + 1));
  input.addEventListener("change", () => update(input.value));
  for (const button of calc.querySelectorAll("[data-factor]")) {
    button.addEventListener("click", () => update(base * Number(button.dataset.factor)));
  }

  calc.hidden = false; // the controls only appear once they can work
}
