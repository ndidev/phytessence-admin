import type { RequestHandler } from "./$types";
import { mysql } from "$lib/server";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ request }) => {
  const query = new URL(request.url).searchParams;
  const format = query.get("format");

  let plants;
  let plantsRows;

  switch (format) {
    case "names":
      [plantsRows] = await mysql.query(
        `SELECT id, name, unit
          FROM plants
          ORDER BY name ASC`
      );
      plants = plantsRows as PlantAutocomplete[];
      break;

    case "autocomplete":
      [plantsRows] = await mysql.query(
        `SELECT id, name, unit
          FROM plants
          WHERE active = 1
          ORDER BY name ASC`
      );
      plants = plantsRows as PlantAutocomplete[];
      break;

    case "batches":
      [plantsRows] = await mysql.query(
        `SELECT
            b.id,
            b.batchNumberPhytessence,
            p.id as plantId,
            p.name
          FROM batches b
          LEFT JOIN suppliersOrdersContents c ON b.suppliersContentsId = c.id
          LEFT JOIN plants p ON c.plantId = p.id
          ORDER BY
            p.name ASC,
            batchNumberPhytessence ASC`
      );
      plants = plantsRows as PlantAutocomplete[];
      break;

    default:
      [plantsRows] = await mysql.query(`SELECT * FROM plants`);
      plants = plantsRows as Plant[];
      break;
  }

  // return new Response();
  return json(plants);
};
