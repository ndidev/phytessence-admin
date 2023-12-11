import type { PageServerLoad } from "./$types";
import { mysql } from "$lib/server";
import { error, redirect } from "@sveltejs/kit";

export const load = (async ({ params }) => {
  type Item = {
    category: string;
    name: string;
    data: any;
  };

  let item: Item = {
    category: "",
    name: "",
    data: {},
  };

  type ItemType = "batch" | "so" | "co" | "bag" | "sb";

  switch (params.type as ItemType) {
    case "batch":
      item = await getBatchData(params.id);
      break;

    case "bag":
      item = await getBagData(params.id);
      break;

    case "sb":
      item = await getSupplierBatchData(params.id);
      break;

    // case "so":
    //   return redirect(302, "/orders/suppliers/" + params.id);

    // case "co":
    //   return redirect(302, "/orders/customers/" + params.id);

    default:
      break;
  }

  // Fonctions

  async function getBatchData(id: ID): Promise<Item> {
    const category = "Lot Phyt'Essence";

    const sql = `SELECT * FROM batches WHERE id = :id`;

    const [dataRows] = (await mysql.execute(sql, { id })) as unknown as Array<
      Batch[]
    >;

    const data = dataRows[0];

    const name = data.batchNumberPhytessence;

    return {
      category,
      name,
      data,
    };
  }

  // async function getSupplierOrderData(id: ID): Promise<Item> {}

  // async function getCustomerOrderData(id: ID): Promise<Item> {}

  async function getBagData(id: ID): Promise<Item> {
    const category = "Sachet";

    const sql = `SELECT * FROM customersOrdersBags WHERE id = :id`;

    const [dataRows] = (await mysql.execute(sql, { id })) as unknown as Array<
      Bag[]
    >;

    const data = dataRows[0];

    const name = data.number;

    return {
      category,
      name,
      data,
    };
  }

  async function getSupplierBatchData(batchNumber: string): Promise<Item> {
    batchNumber = decodeURIComponent(batchNumber);

    const category = "Lot fournisseur";

    const sql = `SELECT * FROM batches WHERE batchNumberSupplier = :batchNumber`;

    const [dataRows] = (await mysql.execute(sql, {
      batchNumber,
    })) as unknown as Array<Batch[]>;

    const data = dataRows;

    const name = batchNumber;

    return {
      category,
      name,
      data,
    };
  }

  return {
    item,
  };
}) satisfies PageServerLoad;
