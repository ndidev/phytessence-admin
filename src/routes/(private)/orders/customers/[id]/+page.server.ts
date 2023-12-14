import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql } from "$lib/server";

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
      `SELECT * FROM customersOrders WHERE id = '${params.id}'`
    );

    const orderResult = orderRows as CustomerOrder[];

    if (orderResult.length !== 1) {
      error(404, "Commande non trouvée");
    }

    order = { ...order, ...orderResult[0] };

    // Sachets
    const [bagsRows] = (await mysql.execute(
      `SELECT * FROM customersOrdersBags WHERE orderId = :orderId ORDER BY number`,
      {
        orderId: order.id,
      }
    )) as unknown as Array<CustomerOrderBag[]>;

    const bagsIds = bagsRows.map(({ id }) => id);

    let bagsContentsResult: CustomerOrderBag["contents"] = [];

    // Contenu des sachets
    if (bagsIds.length > 0) {
      const [bagsContentsRows] = await mysql.query(
        `SELECT cobc.*
          FROM customersOrdersBagsContents cobc
          JOIN plants p ON p.id = cobc.plantId
          JOIN batches b ON cobc.batchId = b.id
          WHERE cobc.bagId IN (:bagsIds)
          ORDER BY
            p.name,
            b.batchNumberPhytessence`,
        {
          bagsIds,
        }
      );

      bagsContentsResult = bagsContentsRows as CustomerOrderBag["contents"];
    }

    // Lier le contenu des sachets aux sachets
    const bags = bagsRows.map((bag) => {
      bag.contents = bagsContentsResult.filter(({ bagId }) => bagId === bag.id);

      // Rétablir les types numériques
      bag.contents.forEach((content) => {
        content.quantity = parseFloat(String(content.quantity));
      });

      return bag;
    });

    order.bags = bags;
  }

  // Liste des clients
  const customersResponse = await fetch("/api/customers?format=names");
  const customers = (await customersResponse.json()) as CustomerAutocomplete[];

  // Liste des plantes
  const plantsResponse = await fetch("/api/plants?format=names");
  const plants = (await plantsResponse.json()) as PlantAutocomplete[];

  // Liste des lots
  const batchesResponse = await fetch("/api/plants?format=batches");
  const batches = (await batchesResponse.json()) as PlantBatch[];

  return {
    order,
    customers,
    plants,
    batches,
  };
}) satisfies PageServerLoad;
