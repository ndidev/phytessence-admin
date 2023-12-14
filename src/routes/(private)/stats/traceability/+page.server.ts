import type { PageServerLoad } from "./$types";
import { mysql } from "$lib/server";

export const load = (async () => {
  const sql = `
  SELECT
    searchTerm,
    type,
    id
  FROM (
    SELECT
      batchNumberPhytessence as searchTerm,
      "batch" as type,
      id
    FROM batches
    UNION
    SELECT
      batchNumberSupplier as searchTerm,
      "sb" as type,
      batchNumberSupplier as id
    FROM batches
    UNION
    SELECT
      number as searchTerm,
      "bag" as type,
      id
    FROM customersOrdersBags
  ) tmp
  ORDER BY searchTerm
  `;

  const [searchTable] = (await mysql.query(sql)) as unknown as Array<
    {
      searchTerm: string;
      type: "batch" | "bag" | "sb";
      id: ID;
    }[]
  >;

  searchTable.forEach((line) => {
    if (line.type === "sb") {
      line.id = encodeURIComponent(line.id);
    }
  });

  return { searchTable };
}) satisfies PageServerLoad;
