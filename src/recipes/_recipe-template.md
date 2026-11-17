---
# ===================================================================
# BLANK RECIPE: copy this file to start a new recipe.
#   1. Copy it and name the copy after the recipe, lowercase with dashes,
#      e.g. lemon-cake.md. That name becomes the web address:
#      /recipes/lemon-cake/
#   2. Fill in the parts below. Lines starting with # are notes and are
#      ignored. Delete anything optional you don't need.
#   3. Keep "draft: true" until it's ready. Drafts never get published.
# This file itself is never published (it starts with an underscore).
# ===================================================================

title: Recipe Name
description: "One or two sentences that appear under the title and in link previews."
draft: true

makes:
  verb: serves         # "serves" for meals, "makes" for biscuits, cakes, loaves
  amount: 4            # a number: the portion calculator starts from it
  unit: people         # people / biscuits / slices / loaves …
  # note: "approx."    # optional

prep: 15 min           # optional
cook: 30 min           # optional
oven: 180°C            # optional

# Tags must come from the list in src/_data/recipeTags.json
tags: [mains, vegetarian]

# Ingredients. "amount" must be a number: 0.5, not ½. Units: g, kg, ml, l,
# tsp, tbsp, cup, clove, can, tin, pinch, or leave the unit out for counted things.
# "scale" says how the portion calculator treats it:
#   scale (default, can be left out): multiplied normally
#   whole: rounded to a whole number, e.g. eggs
#   none:  never changes, e.g. a pinch of salt
# Leave "amount" out entirely for things like "salt and pepper, to taste".
ingredients:
  - group: For the sauce          # optional heading; leave out if only one group
    items:
      - { amount: 400, unit: g, item: chopped tomatoes }
      - { amount: 2, unit: clove, item: garlic, note: crushed }
      - { amount: 2, item: eggs, scale: whole }
      - { amount: 1, unit: pinch, item: chilli flakes, scale: none }
      - { item: salt and pepper, note: to taste }

# Shown when someone changes the portions: what doesn't scale simply
scalingNote: "Use a bigger pan for a double batch. Cooking time stays about the same."

# Quill's tips: one or two at most
tips:
  - "A short, useful tip."
---

1. First step of the method.
2. Second step.
