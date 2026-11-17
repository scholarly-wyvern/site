// Settings shared by every file in src/recipes/:
// they all use the recipe template and join the "recipe" collection,
// which is how the Recipes landing page finds them.
export default {
  layout: "layouts/recipe.njk",
  tags: ["recipe"],
};
