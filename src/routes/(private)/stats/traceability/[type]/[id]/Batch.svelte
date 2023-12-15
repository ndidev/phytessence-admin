<script lang="ts">
  import { afterUpdate } from "svelte";

  import { formatQuantity } from "$lib/utils";

  type Data = {
    supplierOrder: {
      batchNumberPhytessence: Batch["batchNumberPhytessence"];
      plantName: Plant["name"];
      batchNumberSupplier: Batch["batchNumberSupplier"];
      supplierName: Supplier["name"];
      orderDate: SupplierOrder["orderDate"];
      deliveryDate: SupplierOrder["orderDate"];
      supplierReference: SupplierOrder["supplierReference"];
    };
    customersOrders: {
      customerName: Customer["name"];
      orders: {
        orderDate: CustomerOrder["orderDate"];
        bags: {
          id: CustomerOrderBag["id"];
          number: CustomerOrderBag["number"];
          quantity: Quantity;
          unit: Plant["unit"];
        }[];
      }[];
    }[];
  };

  // Props
  export let data: Data;

  // Local
  let customersOrders: Data["customersOrders"] = [];
  let supplierOrder: Data["supplierOrder"];

  afterUpdate(() => {
    customersOrders = data.customersOrders;
    supplierOrder = data.supplierOrder;
  });
</script>

<h2 class="h2">Commande fournisseur</h2>

<div class="card p-2 my-4">
  <div>Plante : {supplierOrder?.plantName}</div>
  <div>Fournisseur : {supplierOrder?.supplierName}</div>
  <div>
    Commande du {new Date(supplierOrder?.orderDate).toLocaleDateString()},
    livrée le {new Date(supplierOrder?.deliveryDate).toLocaleDateString()}
  </div>
  <div>
    Référence fournisseur de la commande : {supplierOrder?.supplierReference}
  </div>
  <div>
    Numéro de lot fournisseur : <a
      href="/stats/traceability/sb/{encodeURIComponent(
        supplierOrder?.batchNumberSupplier
      )}"
      class="underline">{data?.supplierOrder?.batchNumberSupplier}</a
    >
  </div>
</div>

<h2 class="h2">Commandes clients</h2>

{#each customersOrders || [] as customerData}
  <div class="card p-2 my-2">
    <span class="text-lg">{customerData.customerName}</span>
    <ul class="ml-2">
      <!-- Commandes -->
      {#each customerData.orders as order}
        <li class="mt-2">
          <div>
            Commande du {new Date(order.orderDate).toLocaleDateString()}
          </div>
          <ul class="ml-2">
            <!-- Sachets -->
            {#each order.bags as bag}
              <li>
                Sachet numéro <a
                  href="/stats/traceability/bag/{bag.id}"
                  class="underline">{bag.number}</a
                >
                - {formatQuantity(bag.quantity, bag.unit)}
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  </div>
{:else}
  <div>Ce lot n'est utilisé dans aucune commande client.</div>
{/each}
