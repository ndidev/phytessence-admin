import type { PageServerLoad, Actions } from "./$types";
import { error, fail } from "@sveltejs/kit";
import { mysql, getLastBagNumber } from "$lib/server";
import { isNewId, nanoid, parseFormData } from "$lib/utils";

export const load = (async ({ fetch, params, url }) => {
  // Récupération d'une commande, ou nouvelle commande
  let bag: PreparedBag = {
    id: "",
    orderId: null,
    number: "",
    bagTypeId: null,
    contents: [],
  };

  const copy = url.searchParams.get("copy");

  const bagId = params.id === "new" ? copy : params.id;

  // Dernier numéro de sachet
  let lastBagNumber = await getLastBagNumber();

  // Sachet
  if (bagId) {
    const [bagRows] = await mysql.execute(
      `SELECT * FROM customersOrdersBags WHERE id = :bagId`,
      { bagId }
    );

    const bagResult = bagRows as PreparedBag[];

    if (bagResult.length !== 1) {
      error(404, "Sachet non trouvé");
    }

    bag = { ...bag, ...bagResult[0] };

    const [bagsContents] = (await mysql.query(
      `
          SELECT
            cobc.*,
            sf.plantId
          FROM customersOrdersBagsContents cobc
          JOIN suppliersFull sf ON sf.batchId = cobc.batchId
          WHERE cobc.bagId = :bagId
          ORDER BY
            sf.plantName,
            sf.batchNumberPhytessence`,
      { bagId }
    )) as unknown as Array<PreparedBag["contents"]>;

    // Lier le contenu des sachets aux sachets
    bag.contents = bagsContents.filter(({ bagId }) => bagId === bag.id);
  }

  if (params.id === "new") {
    bag.id = "";
    bag.number = "~" + String(++lastBagNumber);
  }

  // Liste des plantes
  const plantsResponse = await fetch("/api/plants?format=autocomplete");
  const plants = (await plantsResponse.json()) as PlantAutocomplete[];

  // Liste des recettes
  const recipesResponse = await fetch("/api/recipes");
  const recipes = (await recipesResponse.json()) as Recipe[];

  // Liste des lots
  const batchesResponse = await fetch("/api/batches?format=autocomplete");
  const batches = (await batchesResponse.json()) as BatchAutocomplete[];

  // Liste des types de sachet
  const bagTypesResponse = await fetch("/api/bagTypes?format=autocomplete");
  const bagTypes = (await bagTypesResponse.json()) as BagTypeAutocomplete[];

  return {
    bag,
    plants,
    recipes,
    batches,
    bagTypes,
  };
}) satisfies PageServerLoad;

export const actions = {
  /**
   * Créer une commande client.
   */
  create: async ({ request }) => {
    const data = await request.formData();
    const parsedData = parseFormData<PreparedBag>(data);

    /* Validation */
    let validationError = false;
    let validationErrorMessage: string[] = [];

    if (validationError) {
      return fail(400, {
        message: validationErrorMessage.join("<br>"),
      });
    }
    /* Fin validation */

    // Sachet
    const bagId = nanoid();

    try {
      await mysql.beginTransaction();

      let lastBagNumber = await getLastBagNumber();

      await mysql.execute(
        `INSERT INTO customersOrdersBags
            SET
              id = :bagId,
              orderId = NULL,
              number = :number,
              bagTypeId = :bagTypeId
        `,
        {
          bagId,
          number: parsedData.number.trim() || ++lastBagNumber,
          bagTypeId: parsedData.bagTypeId || null,
        }
      );

      // Contents
      for (const contents of parsedData.contents || []) {
        await mysql.execute(
          `INSERT INTO customersOrdersBagsContents
              SET
                id = :id,
                bagId = :bagId,
                quantity = :quantity,
                batchId = :batchId
          `,
          {
            id: nanoid(),
            bagId,
            quantity: contents.quantity,
            batchId: contents.batchId,
          }
        );
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
      message: `Le sachet été créé.`,
      bagId,
    };
  },

  /**
   * Mettre à jour une commande client.
   */
  update: async ({ params, request }) => {
    const data = await request.formData();
    const parsedData = parseFormData<PreparedBag>(data);

    /* Validation */
    let validationError = false;
    let validationErrorMessage: string[] = [];

    if (validationError) {
      return fail(400, {
        message: validationErrorMessage.join("<br>"),
      });
    }
    /* Fin validation */

    try {
      await mysql.beginTransaction();

      const bagId = params.id;

      let lastBagNumber = await getLastBagNumber();

      // Sachet
      const bagSql = `
        UPDATE customersOrdersBags
        SET
          number = :number,
          bagTypeId = :bagTypeId
        WHERE
          id = :bagId`;

      await mysql.execute(bagSql, {
        bagId,
        number: parsedData.number.trim() || ++lastBagNumber,
        bagTypeId: parsedData.bagTypeId || null,
      });

      parsedData.contents ||= [];

      // Contents
      const contentsIds =
        parsedData.contents.length === 0
          ? [""]
          : parsedData.contents.map(({ id }) => id);

      // Supprimer les lignes de contenu qui ne sont pas dans les données transmises
      await mysql.query(
        `DELETE FROM customersOrdersBagsContents
            WHERE bagId = :bagId
            AND NOT id IN(:contentsIds)`,
        {
          bagId,
          contentsIds,
        }
      );

      for (const contents of parsedData.contents) {
        const contentsId = isNewId(contents.id) ? nanoid() : contents.id;

        const contentsSql = isNewId(contents.id)
          ? `INSERT INTO customersOrdersBagsContents
                SET
                  id = :contentsId,
                  bagId = :bagId,
                  quantity = :quantity,
                  batchId = :batchId`
          : `UPDATE customersOrdersBagsContents
                SET
                  bagId = :bagId,
                  quantity = :quantity,
                  batchId = :batchId
                WHERE
                  id = :contentsId`;

        await mysql.execute(contentsSql, {
          contentsId,
          bagId,
          quantity: contents.quantity,
          batchId: contents.batchId,
        });
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
      message: "Le sachet a été modifié.",
    };
  },

  /**
   * Supprimer une commande client.
   */
  delete: async ({ params }) => {
    try {
      await mysql.execute(
        `DELETE FROM customersOrdersBags WHERE id = '${params.id}'`
      );
    } catch (err) {
      console.error(err);

      return fail(500, { message: "Erreur lors de la suppression." });
    }

    return {
      message: "Le sachet a été supprimé.",
    };
  },
} satisfies Actions;
