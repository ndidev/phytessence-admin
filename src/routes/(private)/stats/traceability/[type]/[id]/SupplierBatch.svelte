<script lang="ts">
  import { afterUpdate } from "svelte";

  import { DateUtils, formatQuantity } from "$lib/utils";

  type Data = {
    inward: {
      plantId: Plant["id"];
      quantity: Quantity;
      supplierId: Supplier["id"];
    }[];
    outward: {
      id: Plant["id"];
      name: Plant["name"];
      unit: Plant["unit"];
      suppliers: {
        id: Supplier["id"];
        name: Supplier["name"];
        orders: {
          id: SupplierOrder["id"];
          orderDate: SupplierOrder["orderDate"];
          batches: {
            id: Batch["id"];
            number: Batch["batchNumberPhytessence"];
            preparedBags: {
              id: PreparedBag["id"];
              number: PreparedBag["number"];
              quantity: Quantity;
            }[];
            customers: {
              name: Customer["name"];
              orders: {
                orderDate: CustomerOrder["orderDate"];
                bags: {
                  id: CustomerOrderBag["id"];
                  number: CustomerOrderBag["number"];
                  quantity: Quantity;
                }[];
              }[];
            }[];
          }[];
        }[];
      }[];
    }[];
  };

  // Props

  /**
   * ```
   * Plante[] (nom)
   *  Fournisseurs[] (nom)
   *    Commandes[] (date)
   *      Lot Phyt'Essence[] (n° de lot)
   *        Clients[] (nom)                         <---------------------
   *          Commandes clients[] (date)            <-- == Composant Batch
   *            Sachet[] (n° de sachet + quantité)  <---------------------
   * ```
   */
  export let data: Data;

  // Local
  let inward: Data["inward"] = [];
  let outward: Data["outward"] = [];

  afterUpdate(() => {
    ({ inward, outward } = data);
  });
</script>

<!-- Plantes -->
<ul>
  {#each outward || [] as plant}
    <li>
      <h2 class="h2">{plant.name}</h2>

      <!-- Fournisseurs -->
      <ul>
        {#each plant?.suppliers || [] as supplier}
          {@const inwardQuantity = inward
            .filter(
              ({ supplierId, plantId }) =>
                supplierId === supplier.id && plantId === plant.id
            )
            .map(({ quantity }) => quantity)
            .reduce((prev, acc) => prev + acc, 0)}
          {@const outwardQuantity = supplier.orders
            .map(({ batches }) =>
              batches.map(({ customers, preparedBags }) => [
                ...customers.map(({ orders }) =>
                  orders.map(({ bags }) => bags.map(({ quantity }) => quantity))
                ),
                ...preparedBags.map(({ quantity }) => quantity),
              ])
            )
            .flat(4)
            .reduce((prev, acc) => prev + acc, 0)}

          <li class="card p-2 my-4">
            <h3 class="h3">{supplier.name}</h3>

            <div class="ml-2">
              Entrée : {formatQuantity(inwardQuantity, plant.unit)}
              <br />
              Sortie : {formatQuantity(outwardQuantity, plant.unit)}
              <br />
              Restant : {formatQuantity(
                inwardQuantity - outwardQuantity,
                plant.unit
              )}
            </div>

            <!-- Commandes fournisseurs -->
            <ul class="ml-2">
              {#each supplier?.orders || [] as supplierOrder}
                <li class="mt-4">
                  <h4 class="h4">
                    Commande du {new DateUtils(supplierOrder.orderDate).format()
                      .short}
                  </h4>

                  <!-- Lots Phyt'Essence -->
                  <ul class="ml-2">
                    {#each supplierOrder?.batches || [] as batch}
                      <li class="mt-2">
                        <a
                          href="/stats/traceability/batch/{batch.id}"
                          class="underline"
                        >
                          <h5 class="h5">Lot n°{batch.number}</h5></a
                        >

                        <ul class="ml-2">
                          <!-- Sachets préparés -->
                          <li class="mt-2">
                            <h6 class="h6">Sachets préparés</h6>

                            <ul class="ml-4">
                              {#each batch.preparedBags as bag}
                                <li>
                                  Sachet numéro <a
                                    href="/stats/traceability/bag/{bag.id}"
                                    class="underline">{bag.number}</a
                                  >
                                  - {formatQuantity(bag.quantity, plant.unit)}
                                </li>
                              {:else}
                                <li>
                                  Aucun sachet préparé ne contient ce lot.
                                </li>
                              {/each}
                            </ul>
                          </li>

                          <!-- Clients -->
                          {#each batch.customers as customers}
                            <li class="mt-2">
                              <h6 class="h6">
                                {customers.name}
                              </h6>

                              <!-- Commandes clients -->
                              <ul class="ml-2">
                                {#each customers.orders as customerOrder}
                                  <li>
                                    <div>
                                      Commande du {new DateUtils(
                                        customerOrder.orderDate
                                      ).format().short}
                                    </div>

                                    <!-- Sachets -->
                                    <ul class="ml-2">
                                      {#each customerOrder.bags as bag}
                                        <li>
                                          Sachet numéro <a
                                            href="/stats/traceability/bag/{bag.id}"
                                            class="underline">{bag.number}</a
                                          >
                                          - {formatQuantity(
                                            bag.quantity,
                                            plant.unit
                                          )}
                                        </li>
                                      {/each}
                                    </ul>
                                  </li>
                                {/each}
                              </ul>
                            </li>
                          {:else}
                            <li>Aucune commande client associée à ce lot.</li>
                          {/each}
                        </ul>
                      </li>
                    {/each}
                  </ul>
                </li>
              {/each}
            </ul>
          </li>
        {/each}
      </ul>
    </li>
  {/each}
</ul>

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->
