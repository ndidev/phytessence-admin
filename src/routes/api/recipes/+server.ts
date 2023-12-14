import type { RequestHandler } from "./$types";
import { mysql } from "$lib/server";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ request }) => {
  const query = new URL(request.url).searchParams;
  const format = query.get("format");

  let recipes;

  switch (format) {
    default:
      recipes = await getFullActiveRecipes();
      break;
  }

  // return new Response();
  return json(recipes);
};

/**
 * Récupérer les recettes actives au complet.
 */
async function getFullActiveRecipes() {
  const recipesPromise = mysql.query(
    `SELECT * FROM recipes WHERE active = 1 ORDER BY name`
  );

  const recipesBagsPromise = mysql.query(`
    SELECT *
    FROM recipesBags
    WHERE recipeId IN (
      SELECT id FROM recipes WHERE active = 1
    )`);

  const recipesBagsContentsPromise = mysql.query(`
      SELECT rbc.*
      FROM recipesBagsContents rbc
      JOIN plants p ON rbc.plantId = p.id
      WHERE bagId IN (
        SELECT id
        FROM recipesBags
        WHERE recipeId IN (
          SELECT id FROM recipes WHERE active = 1
        )
      )
      ORDER BY p.name`);

  const promiseResults = (await Promise.all([
    recipesPromise,
    recipesBagsPromise,
    recipesBagsContentsPromise,
  ])) as unknown as Array<any>;

  const recipes = promiseResults[0][0] as Recipe[];
  const recipesBags = promiseResults[1][0] as RecipeBag[];
  const recipesBagsContents = promiseResults[2][0] as RecipeBag["contents"];

  recipes.forEach((recipe) => {
    recipe.bags = recipesBags.filter(({ recipeId }) => recipeId === recipe.id);

    recipe.bags.forEach((bag) => {
      bag.contents = recipesBagsContents.filter(
        ({ bagId }) => bagId === bag.id
      );

      // Rétablir les types numériques
      bag.quantity = parseInt(String(bag.quantity));
      bag.contents.forEach((content) => {
        content.quantity = parseFloat(String(content.quantity));
      });
    });
  });

  return recipes;
}
