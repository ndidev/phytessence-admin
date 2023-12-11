import type { RequestHandler } from "./$types";
import { mysql } from "$lib/server";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ request }) => {
  const query = new URL(request.url).searchParams;
  const format = query.get("format");

  let suppliers;
  let suppliersRows;

  switch (format) {
    case "autocomplete":
      [suppliersRows] = await mysql.query(
        `SELECT id, name
          FROM suppliers
          WHERE active = 1
          ORDER BY name ASC`
      );
      suppliers = suppliersRows as SupplierAutocomplete[];
      break;

    default:
      [suppliersRows] = await mysql.query(`SELECT * FROM suppliers`);
      suppliers = suppliersRows as Supplier[];
      break;
  }

  // return new Response();
  return json(suppliers);
};
