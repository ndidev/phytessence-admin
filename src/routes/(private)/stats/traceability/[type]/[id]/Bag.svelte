<script lang="ts">
  import { afterUpdate } from "svelte";

  import { formatQuantity } from "$lib/utils";

  type Data = {
    customerOrder: {
      orderId: CustomerOrder["id"];
      customerName: Customer["name"];
      orderDate: CustomerOrder["orderDate"];
    };
    contents: {
      plantId: Plant["id"];
      plantName: Plant["name"];
      quantity: Quantity;
      unit: Plant["unit"];
      batchId: Batch["id"];
      batchNumberPhytessence: Batch["batchNumberPhytessence"];
    }[];
  };

  // Props
  export let data: Data;

  // Local
  let customerOrder: Data["customerOrder"];
  let orderContents: Data["contents"] = [];

  afterUpdate(() => {
    customerOrder = data.customerOrder;
    orderContents = data.contents;
  });
</script>

<h2 class="h2">Commande client</h2>

<div class="card p-2 my-4">
  {#if customerOrder?.orderId}
    <div>{customerOrder?.customerName || "Client inconnu"}</div>
    <div>
      Commande du {new Date(customerOrder?.orderDate).toLocaleDateString()}
    </div>
    <a href="/orders/customers/{customerOrder?.orderId}" class="underline"
      >Voir la commande</a
    >
  {:else}
    <div>Ce sachet a été préparé mais ne fait partie d'aucune commande.</div>
  {/if}
</div>

<h2 class="h2">Contenu du sachet</h2>

{#each orderContents || [] as contents}
  <div class="card mt-2 p-2">
    <!-- Plante -->
    <div>
      {contents.plantName}
    </div>

    <!-- Lot Phyt'Essence -->
    Lot Phyt'Essence :
    <a href="/stats/traceability/batch/{contents.batchId}" class="underline"
      ><span>{contents.batchNumberPhytessence}</span></a
    >

    <!-- Quantité -->
    <div>
      Quantité : <span>{formatQuantity(contents.quantity, contents.unit)}</span>
    </div>
  </div>
{:else}
  <div class="card p-2 mt-2">Le sachet est vide</div>
{/each}
