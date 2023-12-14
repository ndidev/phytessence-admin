import type { PageServerLoad, Actions } from "./$types";
import { error, fail } from "@sveltejs/kit";
import { mysql } from "$lib/server";
import { createNewId, isNewId, nanoid, parseFormData } from "$lib/utils";

export const load = (async ({ fetch, params, url }) => {
  // Récupération d'une recette, ou nouvelle recette
  let recipe: Recipe = {
    id: "",
    name: "",
    description: "",
    bags: [],
    active: true,
  };

  const copy = url.searchParams.get("copy");

  const recipeId = params.id === "new" ? copy : params.id;

  if (recipeId) {
    const [recipeResult] = (await mysql.execute(
      `SELECT * FROM recipes WHERE id = :recipeId`,
      { recipeId }
    )) as unknown as Array<Recipe[]>;

    if (recipeResult.length !== 1) {
      throw error(404, "Recette non trouvée");
    }

    recipe = { ...recipe, ...recipeResult[0] };

    // Sachets
    const [bagsRows] = (await mysql.execute(
      `SELECT * FROM recipesBags WHERE recipeId = :recipeId ORDER BY number`,
      {
        recipeId,
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

    if (copy) {
      let lastBagNumber = 0;
      recipe.id = "";
      recipe.bags.forEach((bag) => {
        bag.id = createNewId();
        bag.number = ++lastBagNumber;
        bag.contents.forEach((contents) => {
          contents.bagId = createNewId();
        });
      });
    }
  }

  // Liste des plantes
  const plantsResponse = await fetch("/api/plants?format=autocomplete");
  const plants = (await plantsResponse.json()) as PlantAutocomplete[];

  return {
    recipe,
    plants,
  };
}) satisfies PageServerLoad;

export const actions = {
  /**
   * Créer une recette.
   */
  create: async ({ request }) => {
    const data = await request.formData();
    const parsedData = parseFormData<Recipe>(data);

    /* Validation */
    let validationError = false;
    let validationErrorMessage: string[] = [];

    if (!parsedData.name) {
      validationError = true;
      validationErrorMessage.push("Le nom de la recette est obligatoire.");
    }

    if (validationError) {
      return fail(400, {
        message: validationErrorMessage.join("<br>"),
      });
    }
    /* Fin validation */

    /** Identifiant de la recette. */
    const recipeId = nanoid();

    try {
      await mysql.beginTransaction();

      // Commande
      await mysql.execute(
        `INSERT INTO recipes
          SET
            id = :id,
            name = :name,
            description = :description,
            active = :active
      `,
        {
          id: recipeId,
          name: parsedData.name,
          description: parsedData.description,
          active: !!parsedData.active,
        }
      );

      // Sachets
      parsedData.bags ||= [];

      parsedData.bags.forEach((bag, i) => {
        bag.number = i + 1;
      });

      for (const bag of parsedData.bags) {
        const bagId = nanoid();

        await mysql.execute(
          `INSERT INTO recipesBags
            SET
              id = :bagId,
              recipeId = :recipeId,
              number = :number,
              quantity = :quantity
        `,
          {
            bagId,
            recipeId,
            number: bag.number,
            quantity: bag.quantity,
          }
        );

        // Contents
        for (const contents of bag.contents || []) {
          await mysql.execute(
            `INSERT INTO recipesBagsContents
              SET
                id = :id,
                bagId = :bagId,
                plantId = :plantId,
                quantity = :quantity
          `,
            {
              id: nanoid(),
              bagId,
              plantId: contents.plantId,
              quantity: contents.quantity,
            }
          );
        }
      }

      await mysql.commit();
    } catch (e) {
      await mysql.rollback();

      console.error(e);

      return fail(500, {
        message: "Erreur lors de la création",
      });
    }

    return {
      message: `La recette a été créée.`,
      recipeId,
    };
  },

  /**
   * Mettre à jour une recette.
   */
  update: async ({ params, request }) => {
    const data = await request.formData();
    const parsedData = parseFormData<Recipe>(data);

    /* Validation */
    let validationError = false;
    let validationErrorMessage: string[] = [];

    if (!parsedData.name) {
      validationError = true;
      validationErrorMessage.push("Le nom de la recette est obligatoire.");
    }

    if (validationError) {
      return fail(400, {
        message: validationErrorMessage.join("<br>"),
      });
    }
    /* Fin validation */

    try {
      await mysql.beginTransaction();

      const recipeId = params.id;

      // Commande
      await mysql.execute(
        `UPDATE recipes
          SET
            name = :name,
            description = :description,
            active = :active
          WHERE
          id = :id
      `,
        {
          id: recipeId,
          name: parsedData.name,
          description: parsedData.description,
          active: !!parsedData.active,
        }
      );

      // Sachets
      parsedData.bags ||= [];

      parsedData.bags.forEach((bag, i) => {
        bag.number = i + 1;
      });

      const bagsIds =
        parsedData.bags.length === 0
          ? [""]
          : parsedData.bags.map(({ id }) => id);

      // Supprimer les sachets qui ne sont pas dans les données transmises
      await mysql.query(
        `DELETE FROM recipesBags
          WHERE recipeId = :recipeId
          AND NOT id IN(:bagsIds)`,
        {
          recipeId,
          bagsIds,
        }
      );

      for (const bag of parsedData.bags) {
        const bagId = isNewId(bag.id) ? nanoid() : bag.id;

        const bagSql = isNewId(bag.id)
          ? `INSERT INTO recipesBags
              SET
                id = :bagId,
                recipeId = :recipeId,
                number = :number,
                quantity = :quantity`
          : `UPDATE recipesBags
              SET
                number = :number,
                quantity = :quantity
              WHERE
                id = :bagId`;

        await mysql.execute(bagSql, {
          bagId,
          recipeId,
          number: bag.number,
          quantity: bag.quantity,
        });

        // Contents
        bag.contents ||= [];

        const contentsIds =
          bag.contents.length === 0 ? [""] : bag.contents.map(({ id }) => id);

        // Supprimer les lignes de contenu qui ne sont pas dans les données transmises
        await mysql.query(
          `DELETE FROM recipesBagsContents
              WHERE bagId = :bagId
              AND NOT id IN(:contentsIds)`,
          {
            bagId,
            contentsIds,
          }
        );

        for (const contents of bag.contents) {
          const contentsId = isNewId(contents.id) ? nanoid() : contents.id;

          const contentsSql = isNewId(contents.id)
            ? `INSERT INTO recipesBagsContents
                  SET
                    id = :contentsId,
                    bagId = :bagId,
                    plantId = :plantId,
                    quantity = :quantity`
            : `UPDATE recipesBagsContents
                  SET
                    bagId = :bagId,
                    plantId = :plantId,
                    quantity = :quantity
                  WHERE
                    id = :contentsId`;

          await mysql.execute(contentsSql, {
            contentsId,
            bagId,
            plantId: contents.plantId,
            quantity: contents.quantity,
          });
        }
      }

      await mysql.commit();
    } catch (e) {
      await mysql.rollback();

      console.error(e);

      return fail(500, {
        message: "Erreur lors de la mise à jour",
      });
    }

    return {
      message: "La commande a été modifiée.",
    };
  },

  /**
   * Supprimer une recette.
   */
  delete: async ({ params }) => {
    try {
      await mysql.execute(`DELETE FROM recipes WHERE id = '${params.id}'`);

      return {
        message: "La recette a été supprimée.",
      };
    } catch (err) {
      const error = err as MySQLError;

      return fail(500, {
        message: "Erreur lors de la suppression.",
      });
    }
  },
} satisfies Actions;
