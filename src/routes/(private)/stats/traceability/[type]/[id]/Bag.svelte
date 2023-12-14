<script lang="ts">
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

  export let data: Data;
</script>

<h2 class="h2">Commande client</h2>

<div class="card p-2 my-4">
  <div>{data?.customerOrder?.customerName || "Client inconnu"}</div>
  <div>
    Commande du {new Date(data?.customerOrder?.orderDate).toLocaleDateString()}
  </div>
  <a href="/orders/customers/{data?.customerOrder?.orderId}" class="underline"
    >Voir la commande</a
  >
</div>

<h2 class="h2">Contenu du sachet</h2>

<div class="card p-2 my-4">
  {#each data?.contents || [] as contents}
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
        Quantité : <span
          >{formatQuantity(contents.quantity, contents.unit)}</span
        >
      </div>
    </div>
  {:else}
    <div class="card p-2 mt-2">Le sachet est vide</div>
  {/each}
</div>
