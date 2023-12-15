<script lang="ts">
  import { afterUpdate } from "svelte";

  import { DateUtils, formatQuantity } from "$lib/utils";

  type Data = {
    plantName: Plant["name"];
    unit: Plant["unit"];
    suppliers: {
      name: Supplier["name"];
      orders: {
        id: SupplierOrder["id"];
        orderDate: SupplierOrder["orderDate"];
        batches: {
          id: Batch["id"];
          number: Batch["batchNumberPhytessence"];
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
  let plants: Data = [];

  afterUpdate(() => {
    plants = data;
  });
</script>

<!-- Plantes -->
<ul>
  {#each plants || [] as plant}
    <li>
      <h2 class="h2">{plant.plantName}</h2>

      <!-- Fournisseurs -->
      <ul>
        {#each plant?.suppliers || [] as supplier}
          <li class="card p-2 my-4">
            <h3 class="h3">{supplier.name}</h3>

            <!-- Commandes fournisseurs -->
            <ul class="ml-2">
              {#each supplier?.orders || [] as supplierOrder}
                <li class="mt-2">
                  <div>
                    Commande du {new DateUtils(supplierOrder.orderDate).format()
                      .short}
                  </div>

                  <!-- Lots Phyt'Essence -->
                  <ul class="ml-2">
                    {#each supplierOrder?.batches || [] as batch}
                      <li class="mt-2">
                        <a
                          href="/stats/traceability/batch/{batch.id}"
                          class="underline"
                        >
                          <h4 class="h4">Lot n° {batch.number}</h4></a
                        >

                        <!-- Clients -->
                        <ul class="ml-2">
                          {#each batch.customers as customers}
                            <li class="mt-2">
                              <h5 class="h5">{customers.name}</h5>

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
