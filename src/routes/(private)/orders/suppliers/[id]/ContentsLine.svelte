<script lang="ts">
  import { getContext } from "svelte";

  import { formatQuantity } from "$lib/utils";

  import Batch from "./Batch.svelte";

  export let contents: SupplierOrder["contents"][0];

  const plants = getContext<PlantAutocomplete[]>("plants");
  $: plant =
    plants.find(({ id }) => contents.plantId === id) ||
    ({ id: "", name: "Plante inconnue", unit: "g" } as PlantAutocomplete);
</script>

<div class="card my-2 p-4">
  <!-- Plante -->
  <div class="h4 mb-2">
    {plant.name}
  </div>

  <!-- Quantité -->
  <div>
    Quantité : <span>{formatQuantity(contents.quantity, plant.unit)}</span>
  </div>

  <!-- Coût HT -->
  <div>
    Coût HT (€/{plant.unit === "g" ? "kg" : plant.unit}) :
    <span>{formatQuantity(contents.cost, "€")}</span>
  </div>

  <!-- Taux de TVA -->
  <div>
    TVA : <span>{formatQuantity(contents.vat, "%")}</span>
  </div>

  <div class="mt-2">
    <div class="h6 mt-2">Lots</div>

    {#each contents.batches as batch}
      <Batch {batch} {plant} />
    {:else}
      <div class="card p-2 mt-2">Aucun lot renseigné</div>
    {/each}
  </div>
</div>
