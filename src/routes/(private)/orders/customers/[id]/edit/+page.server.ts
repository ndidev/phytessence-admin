import type { PageServerLoad, Actions } from "./$types";
import { error, fail } from "@sveltejs/kit";
import { mysql, getLastBagNumber } from "$lib/server";
import { createNewId, isNewId, nanoid, parseFormData } from "$lib/utils";

export const load = (async ({ fetch, params, url }) => {
  // Récupération d'une commande, ou nouvelle commande
  let order: CustomerOrder = {
    id: "",
    customerId: "",
    orderDate: "",
    workforceCost: 0,
    suppliesCost: 0,
    sellingPrice: 0,
    distributionChannelId: null,
    bags: [],
    comments: "",
  };

  const copy = url.searchParams.get("copy");

  const orderId = params.id === "new" ? copy : params.id;

  // Dernier numéro de sachet
  let lastBagNumber = await getLastBagNumber();

  // Commande
  if (orderId) {
    const [orderRows] = await mysql.execute(
      `SELECT * FROM customersOrders WHERE id = :orderId`,
      // { id: params.id }
      { orderId }
    );

    const orderResult = orderRows as CustomerOrder[];

    if (orderResult.length !== 1) {
      error(404, "Commande non trouvée");
    }

    order = { ...order, ...orderResult[0] };

    // Sachets
    const [bags] = (await mysql.execute(
      `SELECT * FROM customersOrdersBags WHERE orderId = :orderId  ORDER BY number`,
      { orderId }
    )) as unknown as Array<CustomerOrderBag[]>;

    const bagsIds = bags.map(({ id }) => id);

    // Contenu des sachets
    if (bagsIds.length > 0) {
      const [bagsContents] = (await mysql.query(
        `
          SELECT
            cobc.*,
            sf.plantId
          FROM customersOrdersBagsContents cobc
          JOIN suppliersFull sf ON sf.batchId = cobc.batchId
          WHERE cobc.bagId IN (:bagsIds)
          ORDER BY
            sf.plantName,
            sf.batchNumberPhytessence`,
        { bagsIds }
      )) as unknown as Array<CustomerOrderBag["contents"]>;

      // Lier le contenu des sachets aux sachets
      bags.forEach((bag) => {
        bag.contents = bagsContents.filter(({ bagId }) => bagId === bag.id);
      });

      order.bags = bags;
    }

    if (copy) {
      order.id = "";
      order.orderDate = "";
      order.bags.forEach((bag) => {
        bag.id = createNewId();
        bag.number = "~" + ++lastBagNumber;
        bag.contents.forEach((contents) => {
          contents.bagId = createNewId();
          contents.batchId = "";
        });
      });
    }
  }

  // Liste des clients
  const customersResponse = await fetch("/api/customers?format=autocomplete");
  const customers = (await customersResponse.json()) as CustomerAutocomplete[];

  // Liste des plantes
  const plantsResponse = await fetch("/api/plants?format=autocomplete");
  const plants = (await plantsResponse.json()) as PlantAutocomplete[];

  // Liste des recettes
  const recipesResponse = await fetch("/api/recipes");
  const recipes = (await recipesResponse.json()) as Recipe[];

  // Liste des lots
  const batchesResponse = await fetch("/api/batches?format=autocomplete");
  const batches = (await batchesResponse.json()) as BatchAutocomplete[];

  // Liste des canaux de distribution
  const distributionChannelsResponse = await fetch(
    "/api/distributionChannels?format=autocomplete"
  );
  const distributionChannels =
    (await distributionChannelsResponse.json()) as DistributionChannelAutocomplete[];

  // Liste des types de sachet
  const bagTypesResponse = await fetch("/api/bagTypes?format=autocomplete");
  const bagTypes = (await bagTypesResponse.json()) as BagTypeAutocomplete[];

  // Liste des sachets préparés
  const [preparedBags] = (await mysql.query(
    `SELECT id, number FROM customersOrdersBags WHERE orderId IS NULL ORDER BY number DESC`
  )) as unknown as PreparedBag[][];

  return {
    order,
    customers,
    plants,
    recipes,
    batches,
    distributionChannels,
    bagTypes,
    preparedBags,
    lastBagNumber,
  };
}) satisfies PageServerLoad;

export const actions = {
  /**
   * Créer une commande client.
   */
  create: async ({ request }) => {
    const data = await request.formData();
    const parsedData = parseFormData<CustomerOrder>(data);

    /* Validation */
    let validationError = false;
    let validationErrorMessage: string[] = [];

    if (!parsedData.customerId) {
      validationError = true;
      validationErrorMessage.push("Le client est obligatoire.");
    }

    if (!parsedData.orderDate) {
      validationError = true;
      validationErrorMessage.push("La date de commande est obligatoire.");
    }

    if (validationError) {
      return fail(400, {
        message: validationErrorMessage.join("<br>"),
      });
    }
    /* Fin validation */

    /** Identifiant de la commande. */
    const orderId = nanoid();

    try {
      await mysql.beginTransaction();

      // Commande
      await mysql.execute(
        `INSERT INTO customersOrders
          SET
            id = :id,
            customerId = :customerId,
            orderDate = :orderDate,
            distributionChannelId = :distributionChannelId,
            workforceCost = :workforceCost,
            suppliesCost = :suppliesCost,
            sellingPrice = :sellingPrice,
            comments = :comments
      `,
        {
          id: orderId,
          customerId: parsedData.customerId,
          orderDate: parsedData.orderDate || null,
          distributionChannelId: parsedData.distributionChannelId || null,
          workforceCost: parsedData.workforceCost || 0,
          suppliesCost: parsedData.suppliesCost || 0,
          sellingPrice: parsedData.sellingPrice || 0,
          comments: parsedData.comments,
        }
      );

      let lastBagNumber = await getLastBagNumber();

      // Sachets
      for (const bag of parsedData.bags || []) {
        const bagId = isNewId(bag.id) ? nanoid() : bag.id;

        const bagSql = isNewId(bag.id)
          ? `INSERT INTO customersOrdersBags
              SET
                id = :bagId,
                orderId = :orderId,
                number = :number,
                bagTypeId = :bagTypeId`
          : `UPDATE customersOrdersBags
              SET
                orderId = :orderId,
                number = :number,
                bagTypeId = :bagTypeId
              WHERE
                id = :bagId`;

        await mysql.execute(bagSql, {
          bagId,
          orderId,
          number: bag.number.trim() || ++lastBagNumber,
          bagTypeId: bag.bagTypeId || null,
        });

        // Contents
        const contentsIds =
          bag.contents.length === 0 ? [""] : bag.contents.map(({ id }) => id);

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

        for (const contents of bag.contents) {
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
      message: `La commande a été créée.`,
      orderId,
    };
  },

  /**
   * Mettre à jour une commande client.
   */
  update: async ({ params, request }) => {
    const data = await request.formData();
    const parsedData = parseFormData<CustomerOrder>(data);

    /* Validation */
    let validationError = false;
    let validationErrorMessage: string[] = [];

    if (!parsedData.customerId) {
      validationError = true;
      validationErrorMessage.push("Le client est obligatoire.");
    }

    if (!parsedData.orderDate) {
      validationError = true;
      validationErrorMessage.push("La date de commande est obligatoire.");
    }

    if (validationError) {
      return fail(400, {
        message: validationErrorMessage.join("<br>"),
      });
    }
    /* Fin validation */

    try {
      await mysql.beginTransaction();

      const orderId = params.id;

      // Commande
      await mysql.execute(
        `UPDATE customersOrders
          SET
          customerId = :customerId,
          orderDate = :orderDate,
          distributionChannelId = :distributionChannelId,
          workforceCost = :workforceCost,
          suppliesCost = :suppliesCost,
          sellingPrice = :sellingPrice,
          comments = :comments
          WHERE
          id = :id
      `,
        {
          id: orderId,
          customerId: parsedData.customerId,
          orderDate: parsedData.orderDate || null,
          distributionChannelId: parsedData.distributionChannelId || null,
          workforceCost: parsedData.workforceCost || 0,
          suppliesCost: parsedData.suppliesCost || 0,
          sellingPrice: parsedData.sellingPrice || 0,
          comments: parsedData.comments,
        }
      );

      let lastBagNumber = await getLastBagNumber();

      parsedData.bags ||= [];

      // Sachets
      const bagsIds =
        parsedData.bags.length === 0
          ? [""]
          : parsedData.bags.map(({ id }) => id);

      // Supprimer les sachets qui ne sont pas dans les données transmises
      await mysql.query(
        `DELETE FROM customersOrdersBags
          WHERE orderId = :orderId
          AND NOT id IN(:bagsIds)`,
        {
          orderId,
          bagsIds,
        }
      );

      for (const bag of parsedData.bags) {
        const bagId = isNewId(bag.id) ? nanoid() : bag.id;

        const bagSql = isNewId(bag.id)
          ? `INSERT INTO customersOrdersBags
              SET
                id = :bagId,
                orderId = :orderId,
                number = :number,
                bagTypeId = :bagTypeId`
          : `UPDATE customersOrdersBags
              SET
                orderId = :orderId,
                number = :number,
                bagTypeId = :bagTypeId
              WHERE
                id = :bagId`;

        await mysql.execute(bagSql, {
          bagId,
          orderId: bag.orderId || null,
          number: bag.number.trim() || ++lastBagNumber,
          bagTypeId: bag.bagTypeId || null,
        });

        bag.contents ||= [];

        // Contents
        const contentsIds =
          bag.contents.length === 0 ? [""] : bag.contents.map(({ id }) => id);

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

        for (const contents of bag.contents) {
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
   * Supprimer une commande client.
   */
  delete: async ({ params }) => {
    try {
      await mysql.execute(
        `DELETE FROM customersOrders WHERE id = '${params.id}'`
      );
    } catch (err) {
      console.error(err);

      return fail(500, { message: "Erreur lors de la suppression." });
    }

    return {
      message: "La commande a été supprimée.",
    };
  },
} satisfies Actions;
