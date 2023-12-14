import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql } from "$lib/server";

export const load = (async ({ fetch, params }) => {
  // Récupération d'une recette, ou nouvelle recette
  let recipe: Recipe = {
    id: "",
    name: "",
    description: "",
    bags: [],
    active: true,
  };

  if (params.id !== "new") {
    const [recipeResult] = (await mysql.execute(
      `SELECT * FROM recipes WHERE id = :id`,
      { id: params.id }
    )) as unknown as Array<Recipe[]>;

    if (recipeResult.length !== 1) {
      error(404, "Recette non trouvée");
    }

    recipe = { ...recipe, ...recipeResult[0] };

    // Sachets
    const [bagsRows] = (await mysql.execute(
      `SELECT * FROM recipesBags WHERE recipeId = :recipeId ORDER BY number`,
      {
        recipeId: recipe.id,
      }
    )) as unknown as Array<RecipeBag[]>;

    const bagsIds = bagsRows.map(({ id }) => id);

    let bagsContentsResult: RecipeBag["contents"] = [];

    // Contenu des sachets
    if (bagsIds.length > 0) {
      const [bagsContentsRows] = await mysql.query(
        `SELECT rbc.*
          FROM recipesBagsContents rbc
          JOIN plants p ON p.id = rbc.plantId
          WHERE rbc.bagId IN (:bagsIds)
          ORDER BY p.name`,
        {
          bagsIds,
        }
      );

      bagsContentsResult = bagsContentsRows as RecipeBag["contents"];
    }

    // Lier le contenu des sachets aux sachets
    const bags = bagsRows.map((bag) => {
      bag.contents = bagsContentsResult.filter(({ bagId }) => bagId === bag.id);

      // Rétablir les types numériques
      bag.quantity = parseInt(String(bag.quantity));
      bag.contents.forEach((content) => {
        content.quantity = parseFloat(String(content.quantity));
      });

      return bag;
    });

    recipe.bags = bags;
  }

  // Liste des plantes
  const plantsResponse = await fetch("/api/plants?format=name");
  const plants = (await plantsResponse.json()) as PlantAutocomplete[];

  return {
    recipe,
    plants,
  };
}) satisfies PageServerLoad;
