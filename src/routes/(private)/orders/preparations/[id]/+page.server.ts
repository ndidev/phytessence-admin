import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql } from "$lib/server";

export const load = (async ({ fetch, params }) => {
  // Récupération d'un sachet, ou nouveau sachet
  let bag: PreparedBag = {
    id: "",
    orderId: null,
    number: "",
    bagTypeId: null,
    contents: [],
  };

  // Commande
  if (params.id !== "new") {
    const [bagRows] = await mysql.execute(
      `SELECT * FROM customersOrdersBags WHERE id = '${params.id}'`
    );

    const bagResult = bagRows as PreparedBag[];

    if (bagResult.length !== 1) {
      error(404, "Sachet non trouvé");
    }

    bag = { ...bag, ...bagResult[0] };

    let bagsContentsResult: CustomerOrderBag["contents"] = [];

    // Contenu du sachet
    const [bagsContentsRows] = await mysql.query(
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
      {
        bagId: params.id,
      }
    );

    bagsContentsResult = bagsContentsRows as CustomerOrderBag["contents"];

    // Lier le contenu des sachets aux sachets
    bag.contents = bagsContentsResult.filter(({ bagId }) => bagId === bag.id);

    // Rétablir les types numériques
    bag.contents.forEach((content) => {
      content.quantity = parseFloat(String(content.quantity));
    });
  }

  // Liste des plantes
  const plantsResponse = await fetch("/api/plants?format=names");
  const plants = (await plantsResponse.json()) as PlantAutocomplete[];

  // Liste des lots
  const batchesResponse = await fetch("/api/plants?format=batches");
  const batches = (await batchesResponse.json()) as PlantBatch[];

  // Liste des types de sachet
  const bagTypesResponse = await fetch("/api/bagTypes?format=names");
  const bagTypes = (await bagTypesResponse.json()) as BagTypeAutocomplete[];

  return {
    bag,
    plants,
    batches,
    bagTypes,
  };
}) satisfies PageServerLoad;
