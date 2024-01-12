import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql } from "$lib/server";

export const load = (async ({ fetch, params }) => {
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

  // Liste des canaux de distribution
  const distributionChannelsResponse = await fetch(
    "/api/distributionChannels?format=names"
  );
  const distributionChannels =
    (await distributionChannelsResponse.json()) as DistributionChannelAutocomplete[];

  // Liste des types de sachet
  const bagTypesResponse = await fetch("/api/bagTypes?format=names");
  const bagTypes = (await bagTypesResponse.json()) as BagTypeAutocomplete[];

  return {
    order,
    customers,
    plants,
    batches,
    distributionChannels,
    bagTypes,
  };
}) satisfies PageServerLoad;
