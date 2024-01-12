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

    redirect(302, "/stats/traceability");
  }

  return {
    item,
  };

  // Fonctions

  async function getBatchData(id: ID): Promise<Item> {
    const category = "Lot Phyt'Essence";

    const supplierOrderDataSql = `
      SELECT
        b.batchNumberPhytessence,
        b.quantity,
        p.name as plantName,
        p.unit as plantUnit,
        b.batchNumberSupplier,
        s.name as supplierName,
        so.id,
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
        cf.customerId,
        cf.customerName,
        cf.orderId,
        cf.orderDate,
        cf.bagId,
        cf.bagNumber,
        cf.quantity,
        p.unit
      FROM customersFull cf
      JOIN plants p ON p.id = cf.plantId
      WHERE cf.batchId = :id
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

    const [customersOrdersRows] = (await customersOrdersPromise) as Array<
      any[]
    >;

    // Regrouper les commandes clients par client
    const customersIdsDone: ID[] = [];
    const customersOrdersData = customersOrdersRows
      .map((line: any) => {
        if (customersIdsDone.includes(line.customerId)) return;

        customersIdsDone.push(line.customerId);

        const customersIdsSieve = customersOrdersRows.filter(
          ({ customerId }: any) => line.customerId === customerId
        );

        const ordersIdsDone: ID[] = [];

        return {
          customerName: line.customerName,
          orders: customersIdsSieve
            .map(({ orderDate, orderId }: any) => {
              if (ordersIdsDone.includes(orderId)) return;

              ordersIdsDone.push(orderId);

              const customersOrdersIdsSieve = customersIdsSieve.filter(
                (line_: any) => line_.orderId === orderId
              );

              return {
                orderDate,
                bags: customersOrdersIdsSieve
                  .map(({ bagNumber, bagId, quantity, unit }: any) => ({
                    id: bagId,
                    number: bagNumber,
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
        sf.batchNumberPhytessence
      FROM customersOrdersBagsContents cobc
      JOIN suppliersFull sf ON sf.batchId = cobc.batchId
      JOIN plants p ON p.id = sf.plantId
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

    const inwardSql = `
      SELECT
        b.quantity,
        soc.plantId,
        s.id as supplierId
      FROM batches b
      JOIN suppliersOrdersContents soc ON soc.id = b.suppliersContentsId
      JOIN suppliersOrders so ON so.id = soc.orderId
      JOIN suppliers s ON s.id = so.supplierId
      WHERE b.batchNumberSupplier = :batchNumber
      `;

    const outwardSql = `
      SELECT
        b.id as batchId,
        b.batchNumberPhytessence as batchNumberPhytessence,
        so.id as supplierOrderId,
        so.orderDate as supplierOrderDate,
        s.id as supplierId,
        s.name as supplierName,
        p.id as plantId,
        p.name as plantName,
        p.unit,
        cobc.quantity,
        cob.id as bagId,
        cob.number as bagNumber,
        co.orderDate as customerOrderDate,
        c.id as customerId,
        c.name as customerName
      FROM batches b
      LEFT JOIN suppliersOrdersContents soc ON soc.id = b.suppliersContentsId
      LEFT JOIN suppliersOrders so ON so.id = soc.orderId
      LEFT JOIN suppliers s ON s.id = so.supplierId
      LEFT JOIN plants p ON p.id = soc.plantId
      LEFT JOIN customersOrdersBagsContents cobc ON b.id = cobc.batchId
      LEFT JOIN customersOrdersBags cob ON cob.id = cobc.bagId
      LEFT JOIN customersOrders co ON co.id = cob.orderId
      LEFT JOIN customers c ON c.id = co.customerId
      WHERE b.batchNumberSupplier = :batchNumber
      ORDER BY
        p.name,
        s.name,
        so.orderDate,
        b.batchNumberPhytessence,
        c.name,
        co.orderDate,
        cob.number
    `;

    const [inwardResults] = (await mysql.execute(inwardSql, {
      batchNumber,
    })) as Array<any[]>;

    const [outwardResults] = (await mysql.execute(outwardSql, {
      batchNumber,
    })) as Array<any[]>;

    const inwardData = inwardResults.map((line) => {
      line.quantity = parseFloat(line.quantity);

      return line;
    });

    // Regrouper les données par
    // Plante > Fournisseur > Commande fournisseur > Lot > Client > Commande client > Sachet
    const plantsIdsDone: ID[] = [];
    const outwardData = outwardResults
      .map((line: any) => {
        if (plantsIdsDone.includes(line.plantId)) return;

        plantsIdsDone.push(line.plantId);

        const plantsSieve = outwardResults.filter(
          ({ plantId }: any) => plantId === line.plantId
        );

        const suppliersIdsDone: ID[] = [];

        return {
          id: line.plantId,
          name: line.plantName,
          unit: line.unit,
          suppliers: plantsSieve
            .map(({ supplierId, supplierName }: any) => {
              if (suppliersIdsDone.includes(supplierId)) return;

              suppliersIdsDone.push(supplierId);

              const suppliersSieve = plantsSieve.filter(
                (line_: any) => supplierId === line_.supplierId
              );

              const suppliersOrdersIdsDone: ID[] = [];

              return {
                id: supplierId,
                name: supplierName,
                orders: suppliersSieve
                  .map(({ supplierOrderId, supplierOrderDate }: any) => {
                    if (suppliersOrdersIdsDone.includes(supplierOrderId))
                      return;

                    suppliersOrdersIdsDone.push(supplierOrderId);

                    const suppliersOrdersSieve = suppliersSieve.filter(
                      (line_: any) => supplierOrderId === line_.supplierOrderId
                    );

                    const batchesIdsDone: ID[] = [];

                    return {
                      id: supplierOrderId,
                      orderDate: supplierOrderDate,
                      batches: suppliersOrdersSieve
                        .map(({ batchId, batchNumberPhytessence }: any) => {
                          if (batchesIdsDone.includes(batchId)) return;

                          batchesIdsDone.push(batchId);

                          const batchesSieve = suppliersOrdersSieve.filter(
                            (line_: any) => batchId === line_.batchId
                          );

                          const customersIdsDone: ID[] = [];

                          return {
                            id: batchId,
                            number: batchNumberPhytessence,
                            customers: batchesSieve
                              .filter(({ customerId }: any) => customerId)
                              .map(({ customerId, customerName }: any) => {
                                if (customersIdsDone.includes(customerId))
                                  return;

                                customersIdsDone.push(customerId);

                                const customersSieve = batchesSieve.filter(
                                  (line_) => customerId === line_.customerId
                                );

                                const customersOrdersIdsDone: ID[] = [];

                                return {
                                  name: customerName,
                                  orders: customersSieve
                                    .map(
                                      ({
                                        customerOrderDate,
                                        customerOrderId,
                                      }: any) => {
                                        if (
                                          customersOrdersIdsDone.includes(
                                            customerOrderId
                                          )
                                        )
                                          return;

                                        customersOrdersIdsDone.push(
                                          customerOrderId
                                        );

                                        const customerOrderSieve =
                                          customersSieve.filter(
                                            (line_: any) =>
                                              customerOrderId ===
                                              line_.customerOrderId
                                          );

                                        return {
                                          orderDate: customerOrderDate,
                                          bags: customerOrderSieve
                                            .map(
                                              ({
                                                bagNumber,
                                                bagId,
                                                quantity,
                                              }: any) => ({
                                                id: bagId,
                                                number: bagNumber,
                                                quantity: parseFloat(quantity),
                                              })
                                            )
                                            .filter((bag: any) => bag),
                                        };
                                      }
                                    )
                                    .filter(
                                      (customerOrder: any) => customerOrder
                                    ),
                                };
                              })
                              .filter((customer: any) => customer),
                          };
                        })
                        .filter((batch: any) => batch),
                    };
                  })
                  .filter((supplierOrder: any) => supplierOrder),
              };
            })
            .filter((supplier: any) => supplier),
        };
      })
      .filter((plant: any) => plant);

    const data = {
      inward: inwardData,
      outward: outwardData,
    };

    const name = batchNumber;

    return {
      category,
      name,
      data,
    };
  }
}) satisfies PageServerLoad;
