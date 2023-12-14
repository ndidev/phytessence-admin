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

  const types = ["batch", "bag", "sb"] as const;
  type ItemType = (typeof types)[number];

  if (!params.id || !types.includes(params.type as ItemType)) {
    return redirect(302, "/stats/traceability");
  }

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

    default:
      return redirect(302, "/stats/traceability");
  }

  // Fonctions

  async function getBatchData(id: ID): Promise<Item> {
    const category = "Lot Phyt'Essence";

    const supplierOrderDataSql = `
      SELECT
        b.batchNumberPhytessence,
        p.name as plantName,
        b.batchNumberSupplier,
        s.name as supplierName,
        so.orderDate,
        so.deliveryDate,
        so.supplierReference
      FROM batches b
      JOIN suppliersOrdersContents soc ON soc.id = b.suppliersContentsId
      JOIN suppliersOrders so ON so.id = soc.orderId
      JOIN suppliers s ON s.id = so.supplierId
      JOIN plants p ON p.id = soc.plantId
      WHERE
        b.id = :id
      `;

    const supplierOrderDataResult = mysql.execute(supplierOrderDataSql, {
      id,
    });

    const customersOrdersDataSql = `
      SELECT
        c.id as customerId,
        c.name as customerName,
        co.id as orderId,
        co.orderDate,
        cob.number as bagNumber,
        cobc.quantity,
        p.unit
      FROM customersOrdersBagsContents cobc
      JOIN customersOrdersBags cob ON cob.id = cobc.bagId
      JOIN customersOrders co ON co.id = cob.orderId
      JOIN customers c ON c.id = co.customerId
      JOIN plants p ON p.id = cobc.plantId
      WHERE cobc.batchId = :id
      ORDER BY
        customerName,
        orderDate,
        bagNumber
    `;

    const customersOrdersResult = mysql.execute(customersOrdersDataSql, {
      id,
    });

    const supplierOrderData = (
      (await supplierOrderDataResult) as Array<any>
    )[0][0];

    const customersOrdersRows = (
      (await customersOrdersResult) as Array<any>
    )[0];

    // Regrouper les commandes clients par client
    const customersIdsDone: ID[] = [];
    const ordersIdsDone: ID[] = [];
    const customersOrdersData = customersOrdersRows
      .map((line: any) => {
        if (customersIdsDone.includes(line.customerId)) return;

        customersIdsDone.push(line.customerId);

        return {
          customerName: line.customerName,
          orders: customersOrdersRows
            .filter(
              ({ customerId }: { customerId: ID }) =>
                line.customerId === customerId
            )
            .map(({ orderDate, orderId }: any) => {
              if (ordersIdsDone.includes(orderId)) return;

              ordersIdsDone.push(orderId);

              return {
                orderDate,
                bags: customersOrdersRows
                  .filter((line_: any) => line_.orderId === orderId)
                  .map(({ bagNumber, quantity, unit }: any) => ({
                    bagNumber,
                    quantity: parseFloat(quantity),
                    unit,
                  }))
                  .filter((bag: any) => bag),
              };
            })
            .filter((order: any) => order),
        };
      })
      .filter((customer: any) => customer);

    const data = {
      supplierOrder: supplierOrderData,
      customersOrders: customersOrdersData,
    };

    const name = supplierOrderData.batchNumberPhytessence;

    return {
      category,
      name,
      data,
    };
  }

  async function getBagData(id: ID): Promise<Item> {
    const category = "Sachet";

    const sql = `SELECT * FROM customersOrdersBags WHERE id = :id`;

    const [dataRows] = (await mysql.execute(sql, { id })) as unknown as Array<
      CustomerOrderBag[]
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

  console.log(JSON.stringify(item, null, 2));

  return {
    item,
  };
}) satisfies PageServerLoad;
