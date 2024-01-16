import type { RequestHandler } from "./$types";
import { mysql } from "$lib/server";
import { json, error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
  const [preparedBagRows] = (await mysql.query(
    `
    SELECT
      *
    FROM customersOrdersBags
    WHERE id = :id`,
    {
      id: params.id,
    }
  )) as unknown as Array<PreparedBag[]>;

  const preparedBag = preparedBagRows[0];

  const [contentsRows] = (await mysql.query(
    `
    SELECT
      contentsId as id,
      plantId,
      batchId,
      quantity
    FROM customersFull
    WHERE bagId = :bagId`,
    { bagId: params.id }
  )) as unknown as Array<PreparedBag["contents"]>;

  preparedBag.contents = contentsRows.map((row) => {
    row.bagId = params.id;

    return row;
  });

  return json(preparedBag);
};
