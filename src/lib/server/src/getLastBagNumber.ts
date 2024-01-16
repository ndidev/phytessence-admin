import { mysql } from "$lib/server";

/**
 * Faire un nouveau numéro de lot client (numéro de sachet).
 */
export async function getLastBagNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const datePart = [year, month, day].join("");

  const [lastBagNumberRows] = (await mysql.query(
    `
    SELECT number
    FROM customersOrdersBags
    WHERE number REGEXP '^${datePart}[0-9]{3}$'
    ORDER BY number DESC
    LIMIT 1
  `
  )) as unknown as Array<{ number: string }[]>;

  const lastBagNumber = lastBagNumberRows[0]?.number;

  return parseInt(lastBagNumber || datePart + "000");
}
