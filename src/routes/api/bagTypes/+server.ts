import type { RequestHandler } from "./$types";
import { mysql } from "$lib/server";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ request }) => {
  const query = new URL(request.url).searchParams;
  const format = query.get("format");

  let bagTypes;
  let bagTypesRows;

  switch (format) {
    case "autocomplete":
      [bagTypesRows] = await mysql.query(`
        SELECT
          id,
          name
        FROM bagTypes
        WHERE active = 1
        ORDER BY name ASC`);
      bagTypes = bagTypesRows as BagTypeAutocomplete[];
      break;

    case "names":
      [bagTypesRows] = await mysql.query(`
        SELECT
          id,
          name
        FROM bagTypes
        ORDER BY name ASC`);
      bagTypes = bagTypesRows as BagTypeAutocomplete[];
      break;

    default:
      [bagTypesRows] = await mysql.query(`
        SELECT
          id,
          name,
          active
        FROM bagTypes
        ORDER BY name ASC`);
      bagTypes = bagTypesRows as BagType[];
      break;
  }

  // return new Response();
  return json(bagTypes);
};
