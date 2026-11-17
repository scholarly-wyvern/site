// The portion calculator and measurement toggle on recipe pages.
//
// The page already shows the original amounts without this script, so the
// recipe still works if JavaScript fails or is switched off. This script
// only adds the controls and redoes the amounts when someone changes them.

import { scaleAmount, formatAmount, formatUnit, convertAmount, toFahrenheit } from "./scale.js";

const calc = document.querySelector("[data-portion-calc]");

// The visitor's measurement choice is remembered in their own browser, so a
// US visitor only picks "US cups" once, not on every recipe.
const STORAGE_KEY = "sw-measures";
function loadChoice() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
function saveChoice(value) {
  try { localStorage.setItem(STORAGE_KEY, value); } catch { /* private browsing: fine */ }
}

if (calc) {
  const base = Number(calc.dataset.base);
  const from = calc.dataset.measures; // the system the recipe was written in
  const input = calc.querySelector("#portion-yield");
  const scaleNote = calc.querySelector("[data-scale-note]");
  const convertNote = calc.querySelector("[data-convert-note]");
  const status = calc.querySelector("[data-status]");
  const yieldUnit = calc.dataset.unit;
  const ingredients = document.querySelectorAll("[data-amount]");
  const temperatures = document.querySelectorAll("[data-temp-c]");
  const radios = calc.querySelectorAll('input[name="measures"]');

  let target = base;
  let view = "original";

  function render() {
    const factor = target / base;
    input.value = target;

    for (const line of ingredients) {
      const unit = line.dataset.unit || "";
      const rule = line.dataset.scale;
      const scaled = scaleAmount(Number(line.dataset.amount), factor, rule);
      const info = { gPerMl: Number(line.dataset.gPerMl) || undefined, liquid: line.hasAttribute("data-liquid") };
      const converted = rule === "none" ? null : convertAmount(scaled, unit, from, view, info);

      const qty = line.querySelector("[data-qty]");
      const unitEl = line.querySelector("[data-unit-label]");
      if (converted) {
        qty.textContent = converted; // already includes the unit, e.g. "½ cup + 1 tbsp"
        if (unitEl) unitEl.textContent = "";
      } else {
        qty.textContent = formatAmount(scaled, unit);
        if (unitEl) unitEl.textContent = formatUnit(unit, scaled);
      }
    }

    for (const temp of temperatures) {
      const c = Number(temp.dataset.tempC);
      temp.textContent = view === "us" ? `${toFahrenheit(c)}°F` : `${c}°C`;
    }

    // Notes only appear when they apply
    if (scaleNote) scaleNote.hidden = factor === 1;
    convertNote.hidden = view === "original";

    for (const button of calc.querySelectorAll("[data-factor]")) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.factor) === factor));
    }
  }

  function setYield(value) {
    target = Math.max(1, Math.round(Number(value) || base));
    render();
    // Tell screen-reader users the amounts changed (the page doesn't reload)
    status.textContent = `Amounts updated for ${target} ${yieldUnit}.`;
  }

  calc.querySelector("[data-less]").addEventListener("click", () => setYield(target - 1));
  calc.querySelector("[data-more]").addEventListener("click", () => setYield(target + 1));
  input.addEventListener("change", () => setYield(input.value));
  for (const button of calc.querySelectorAll("[data-factor]")) {
    button.addEventListener("click", () => setYield(base * Number(button.dataset.factor)));
  }

  for (const radio of radios) {
    radio.addEventListener("change", () => {
      view = radio.value;
      saveChoice(view);
      render();
      status.textContent = "Measurements changed.";
    });
  }

  // Use the visitor's saved choice, if this recipe offers it
  const saved = loadChoice();
  const savedRadio = [...radios].find((r) => r.value === saved);
  if (savedRadio) {
    savedRadio.checked = true;
    view = saved;
  }

  render();
  calc.hidden = false; // the controls only appear once they can work
}
