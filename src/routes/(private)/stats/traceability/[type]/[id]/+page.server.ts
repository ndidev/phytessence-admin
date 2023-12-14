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

  try {
    if (!params.id) {
      throw new Error("id non fourni");
    }

    if (!types.includes(params.type as ItemType)) {
      throw new Error("Type inconnu");
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
        throw new Error("Type inconnu");
    }
  } catch (err) {
    console.error(err);

    return redirect(302, "/stats/traceability");
  }

  console.log(JSON.stringify(item, null, 2));

  return {
    item,
  };

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

    const supplierOrderDataPromise = mysql.execute(supplierOrderDataSql, {
      id,
    });

    const customersOrdersPromise = mysql.execute(customersOrdersDataSql, {
      id,
    });

    const [supplierOrderData] = (
      (await supplierOrderDataPromise) as Array<any>
    )[0];

    const [customersOrdersRows] = (await customersOrdersPromise) as Array<any>;

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

    const orderSql = `
      SELECT
        co.orderDate,
        c.name as customerName
      FROM customersOrders co
      JOIN customers c ON co.customerId = c.id
      WHERE co.id = (
        SELECT cob.orderId
        FROM customersOrdersBags cob
        WHERE cob.id = :id
      )
    `;

    const bagSql = `SELECT * FROM customersOrdersBags WHERE id = :id`;

    const contentsSql = `
      SELECT
        cobc.*,
        p.name as plantName,
        p.unit,
        b.batchNumberPhytessence
      FROM customersOrdersBagsContents cobc
      JOIN plants p ON p.id = cobc.plantId
      JOIN batches b ON cobc.batchId = b.id
      WHERE cobc.bagId = :id
      ORDER BY p.name`;

    const orderPromise = mysql.execute(orderSql, { id });
    const bagPromise = mysql.execute(bagSql, { id });
    const contentsPromise = mysql.execute(contentsSql, { id });

    const [orderData] = ((await orderPromise) as Array<any>)[0];
    const [bagData] = ((await bagPromise) as Array<any>)[0];
    const [contentsData] = await contentsPromise;

    if (!bagData) {
      throw new Error("Sachet inconnu");
    }

    const data = {
      customerOrder: {
        orderId: bagData.orderId,
        customerName: orderData.customerName,
        orderDate: orderData.orderDate,
      },
      contents: contentsData,
    };

    const name = bagData.number;

    return {
      category,
      name,
      data,
    };
  }

  async function getSupplierBatchData(batchNumber: string): Promise<Item> {
    batchNumber = decodeURIComponent(batchNumber);

    const category = "Lot fournisseur";

    const batchesSql = `SELECT * FROM batches WHERE batchNumberSupplier = :batchNumber`;
    const plantsSql = `
      SELECT
        p.name,
        p.unit
      FROM plants p
      WHERE p.id IN (
        SELECT soc.plantId
        FROM suppliersOrdersContents soc
        JOIN batches b ON b.suppliersContentsId = soc.id
        WHERE b.id = :batchId
      )
    `;

    const batchesPromise = mysql.execute(batchesSql, { batchNumber });

    const data = {};

    const name = batchNumber;

    return {
      category,
      name,
      data,
    };
  }
}) satisfies PageServerLoad;
