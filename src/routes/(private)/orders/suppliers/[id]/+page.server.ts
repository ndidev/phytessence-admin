import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { mysql } from "$lib/server";

export const load = (async ({ fetch, params }) => {
  // Récupération d'une commande, ou nouvelle commande
  let order: SupplierOrder = {
    id: "",
    supplierId: "",
    orderDate: "",
    deliveryDate: null,
    supplierReference: null,
    contents: [],
    comments: "",
  };

  if (params.id !== "new") {
    const [orderRows] = await mysql.execute(
      `SELECT * FROM suppliersOrders WHERE id = :id`,
      { id: params.id }
    );

    const orderResult = orderRows as SupplierOrder[];

    if (orderResult.length !== 1) {
      error(404, "Commande non trouvée");
    }

    order = { ...order, ...orderResult[0] };

    const [contents] = (await mysql.execute(
      `SELECT
          c.*,
          p.name
        FROM suppliersOrdersContents c
        JOIN plants p ON p.id = c.plantId
        WHERE orderId = :orderId
        ORDER BY p.name`,
      {
        orderId: params.id,
      }
    )) as unknown as Array<SupplierOrder["contents"]>;

    const contentsId = contents.map(({ id }) => id);

    if (contentsId.length > 0) {
      const [batchesRows] = (await mysql.query(
        `SELECT *
          FROM batches
          WHERE suppliersContentsId IN (:contentsIds)
          ORDER BY CAST(batchNumberPhytessence AS UNSIGNED)`,
        {
          contentsIds: contents.map(({ id }) => id),
        }
      )) as unknown as Array<SupplierOrder["contents"][number]["batches"]>;

      contents.forEach((content) => {
        content.batches = batchesRows.filter(
          ({ suppliersContentsId }) => suppliersContentsId === content.id
        );
      });

      order.contents = contents;
    }
  }

  // Liste des fournisseurs
  const suppliersResponse = await fetch("/api/suppliers?format=autocomplete");
  const suppliers = (await suppliersResponse.json()) as SupplierAutocomplete[];

  // Liste des plantes
  const plantsResponse = await fetch("/api/plants?format=autocomplete");
  const plants = (await plantsResponse.json()) as PlantAutocomplete[];

  return {
    order,
    suppliers,
    plants,
  };
}) satisfies PageServerLoad;
