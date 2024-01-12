import type { RequestHandler } from "./$types";
import { mysql } from "$lib/server";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ request }) => {
  const query = new URL(request.url).searchParams;
  const format = query.get("format");

  let batches;
  let batchesRows;

  switch (format) {
    case "autocomplete":
      [batchesRows] = await mysql.query(
        `SELECT
            sf.batchId as id,
            sf.batchNumberPhytessence as name,
            sf.plantId
          FROM suppliersFull sf
          ORDER BY
            sf.batchNumberPhytessence ASC`
      );
      batches = batchesRows as BatchAutocomplete[];
      break;

    default:
      [batchesRows] = await mysql.query(`
        SELECT
          b.id,
          soc.id as suppliersContentsId,
          b.batchNumberSupplier,
          b.batchNumberPhytessence,
          b.phytBatchIsSupplierBatch,
          b.expiryDate,
          b.quantity
        FROM batches b
        LEFT JOIN suppliersOrdersContents soc ON b.suppliersContentsId = soc.id
        ORDER BY
          p.name ASC,
          b.batchNumberPhytessence ASC`);
      batches = batchesRows as Batch[];
      break;
  }

  // return new Response();
  return json(batches);
};
