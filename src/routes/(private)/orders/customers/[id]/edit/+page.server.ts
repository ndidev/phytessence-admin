import type { PageServerLoad, Actions } from "./$types";
import { error, fail } from "@sveltejs/kit";
import { mysql } from "$lib/server";
import { isNewId, nanoid, parseFormData } from "$lib/utils";

export const load = (async ({ fetch, params }) => {
  // Récupération d'une commande, ou nouvelle commande
  let order: CustomerOrder = {
    id: "",
    customerId: "",
    orderDate: "",
    bags: [],
    comments: "",
  };

  // Commande
  if (params.id !== "new") {
    const [orderRows] = await mysql.execute(
      `SELECT * FROM customersOrders WHERE id = :id`,
      { id: params.id }
    );

    const orderResult = orderRows as CustomerOrder[];

    if (orderResult.length !== 1) {
      throw error(404, "Commande non trouvée");
    }

    order = { ...order, ...orderResult[0] };

    // Sachets
    const [bags] = (await mysql.execute(
      `SELECT * FROM customersOrdersBags WHERE orderId = :orderId  ORDER BY number`,
      { orderId: order.id }
    )) as unknown as Array<Bag[]>;

    const bagsIds = bags.map(({ id }) => id);

    // Contenu des sachets
    if (bagsIds.length > 0) {
      const [bagsContents] = (await mysql.query(
        `SELECT c.*
          FROM customersOrdersBagsContents c
          JOIN plants p ON p.id = c.plantId
          WHERE c.bagId IN (:bagsIds)
          ORDER BY p.name`,
        { bagsIds }
      )) as unknown as Array<Bag["contents"]>;

      // Lier le contenu des sachets aux sachets
      bags.forEach((bag) => {
        bag.contents = bagsContents.filter(({ bagId }) => bagId === bag.id);
      });

      order.bags = bags;
    }
  }

  // Liste des clients
  const customersResponse = await fetch("/api/customers?format=autocomplete");
  const customers = (await customersResponse.json()) as CustomerAutocomplete[];

  // Liste des plantes
  const plantsResponse = await fetch("/api/plants?format=autocomplete");
  const plants = (await plantsResponse.json()) as PlantAutocomplete[];

  // Liste des lots
  const batchesResponse = await fetch("/api/plants?format=batches");
  const batches = (await batchesResponse.json()) as PlantBatch[];

  // Dernier numéro de sachet
  const lastbagNumber = await getLastbagNumber();

  return {
    order,
    customers,
    plants,
    batches,
    lastbagNumber,
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
            comments = :comments
      `,
        {
          id: orderId,
          customerId: parsedData.customerId,
          orderDate: parsedData.orderDate || null,
          comments: parsedData.comments,
        }
      );

      let lastbagNumber = await getLastbagNumber();

      // Sachets
      for (const bag of parsedData.bags || []) {
        const bagId = nanoid();

        await mysql.execute(
          `INSERT INTO customersOrdersBags
            SET
              id = :bagId,
              orderId = :orderId,
              number = :number
        `,
          {
            bagId,
            orderId,
            number: bag.number.trim() || ++lastbagNumber,
          }
        );

        // Contents
        for (const contents of bag.contents || []) {
          await mysql.execute(
            `INSERT INTO customersOrdersBagsContents
              SET
                id = :id,
                bagId = :bagId,
                plantId = :plantId,
                quantity = :quantity,
                batchId = :batchId
          `,
            {
              id: nanoid(),
              bagId,
              plantId: contents.plantId,
              quantity: contents.quantity,
              batchId: contents.batchId,
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
          comments = :comments
          WHERE
          id = :id
      `,
        {
          id: orderId,
          customerId: parsedData.customerId,
          orderDate: parsedData.orderDate || null,
          comments: parsedData.comments,
        }
      );

      let lastbagNumber = await getLastbagNumber();

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
                number = :number`
          : `UPDATE customersOrdersBags
              SET
                orderId = :orderId,
                number = :number
              WHERE
                id = :bagId`;

        await mysql.execute(bagSql, {
          bagId,
          orderId,
          number: bag.number.trim() || ++lastbagNumber,
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
                  plantId = :plantId,
                  quantity = :quantity,
                  batchId = :batchId`
            : `UPDATE customersOrdersBagsContents
                SET
                  bagId = :bagId,
                  plantId = :plantId,
                  quantity = :quantity,
                  batchId = :batchId
                WHERE
                  id = :contentsId`;

          await mysql.execute(contentsSql, {
            contentsId,
            bagId,
            plantId: contents.plantId,
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

/**
 * Faire un nouveau numéro de lot client (numéro de sachet).
 */
async function getLastbagNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const datePart = [year, month, day].join("");

  const [lastbagNumberRows] = (await mysql.query(
    `
    SELECT number
    FROM customersOrdersBags
    WHERE number REGEXP '^${datePart}[0-9]{3}$'
    ORDER BY number DESC
    LIMIT 1
  `
  )) as unknown as Array<{ number: string }[]>;

  const lastbagNumber = lastbagNumberRows[0]?.number;

  return parseInt(lastbagNumber || datePart + "000");
}
