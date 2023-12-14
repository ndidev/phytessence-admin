<script lang="ts">
  import { getContext } from "svelte";

  import { formatQuantity } from "$lib/utils";

  export let contents: RecipeBag["contents"][0];

  const plants = getContext<PlantAutocomplete[]>("plants");

  $: plant =
    plants.find(({ id }) => contents.plantId === id) ||
    ({ id: "", name: "", unit: "g" } as PlantAutocomplete);
</script>

<div class="card mt-2 p-2">
  <!-- Plante -->
  <div>
    {plant.name}
  </div>

  <!-- Quantité -->
  <div>
    Quantité : <span>{formatQuantity(contents.quantity, plant.unit)}</span>
  </div>
</div>
