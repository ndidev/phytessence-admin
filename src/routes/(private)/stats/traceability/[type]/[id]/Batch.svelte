<script lang="ts">
  import { formatQuantity } from "$lib/utils";

  type Data = {
    supplierOrder: {
      batchNumberPhytessence: string;
      plantName: string;
      batchNumberSupplier: string;
      supplierName: Supplier["name"];
      orderDate: string;
      deliveryDate: string;
      supplierReference: string;
    };
    customersOrders: {
      customerName: string;
      orders: {
        orderDate: CustomerOrder["orderDate"];
        bags: {
          bagNumber: CustomerOrder["bags"][0]["number"];
          quantity: number;
          unit: Plant["unit"];
        }[];
      }[];
    }[];
  };

  export let data: Data;
</script>

<h2 class="h2">Commande fournisseur</h2>

<div class="card p-2 my-4">
  <div>Plante : {data?.supplierOrder?.plantName}</div>
  <div>Fournisseur : {data?.supplierOrder?.supplierName}</div>
  <div>
    Commande du {new Date(data?.supplierOrder?.orderDate).toLocaleDateString()},
    livrée le {new Date(data?.supplierOrder?.deliveryDate).toLocaleDateString()}
  </div>
  <div>
    Référence fournisseur de la commande : {data?.supplierOrder
      ?.supplierReference}
  </div>
  <div>
    Numéro de lot fournisseur : <a
      href="/stats/traceability/sb/{encodeURIComponent(
        data?.supplierOrder?.batchNumberSupplier
      )}"
      class="underline">{data?.supplierOrder?.batchNumberSupplier}</a
    >
  </div>
</div>

<h2 class="h2">Commandes clients</h2>

{#each data?.customersOrders || [] as customerData}
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
                Sachet numéro {bag.bagNumber} - {formatQuantity(
                  bag.quantity,
                  bag.unit
                )}
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
