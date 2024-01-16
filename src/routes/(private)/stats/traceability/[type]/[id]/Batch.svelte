<script lang="ts">
  import { afterUpdate } from "svelte";

  import { formatQuantity } from "$lib/utils";

  type Data = {
    supplierOrder: {
      id: ID;
      batchNumberPhytessence: Batch["batchNumberPhytessence"];
      plantName: Plant["name"];
      plantUnit: Plant["unit"];
      batchNumberSupplier: Batch["batchNumberSupplier"];
      supplierName: Supplier["name"];
      orderDate: SupplierOrder["orderDate"];
      deliveryDate: SupplierOrder["orderDate"];
      quantity: Quantity;
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
  let outwardQuantity = 0;

  afterUpdate(() => {
    customersOrders = data.customersOrders || [];
    supplierOrder = data.supplierOrder;

    outwardQuantity = customersOrders
      .map(({ orders }) =>
        orders.map(({ bags }) => bags.map(({ quantity }) => quantity))
      )
      .flat(2)
      .reduce((prev, acc) => prev + acc, 0);
  });
</script>

<h2 class="h2">Commande fournisseur</h2>

<div class="card p-2 my-4">
  {#if supplierOrder}
    <div>
      <a href="/orders/suppliers/{supplierOrder.id}" class="underline"
        >Accéder à la commande</a
      >
    </div>
    <div>Plante : {supplierOrder.plantName}</div>
    <div>Fournisseur : {supplierOrder.supplierName}</div>
    <div>
      Commande du {new Date(supplierOrder.orderDate).toLocaleDateString()},
      livrée le {new Date(supplierOrder.deliveryDate).toLocaleDateString()}
    </div>
    <div>
      Référence fournisseur de la commande : {supplierOrder.supplierReference}
    </div>
    <div>
      Numéro de lot fournisseur : <a
        href="/stats/traceability/sb/{encodeURIComponent(
          supplierOrder.batchNumberSupplier
        )}"
        class="underline">{supplierOrder.batchNumberSupplier}</a
      >
    </div>
    <div>
      Entrée : {formatQuantity(supplierOrder.quantity, supplierOrder.plantUnit)}
      <br />
      Sortie : {formatQuantity(outwardQuantity, supplierOrder.plantUnit)}
      <br />
      Restant : {formatQuantity(
        supplierOrder.quantity - outwardQuantity,
        supplierOrder.plantUnit
      )}
    </div>
  {/if}
</div>

<h2 class="h2">Commandes clients</h2>

{#each customersOrders || [] as customerData}
  <div class="card p-2 my-2">
    <span class="text-lg">{customerData.customerName || "En préparation"}</span>
    <ul class="ml-2">
      <!-- Commandes -->
      {#each customerData.orders as order}
        <li class="mt-2">
          {#if order.orderDate}
            <div>
              Commande du {new Date(order.orderDate).toLocaleDateString()}
            </div>
          {/if}
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
