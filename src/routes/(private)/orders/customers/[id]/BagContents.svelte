<script lang="ts">
  import { getContext } from "svelte";

  import { formatQuantity } from "$lib/utils";

  export let contents: Bag["contents"][0];

  const plants = getContext<PlantAutocomplete[]>("plants");
  const batches = getContext<PlantBatch[]>("batches");

  $: plant =
    plants.find(({ id }) => contents.plantId === id) ||
    ({ id: "", name: "", unit: "g" } as PlantAutocomplete);

  $: batchNumberPhytessence =
    batches.find((batch) => batch.id === contents.batchId)
      ?.batchNumberPhytessence || "Numéro de lot non trouvé";
</script>

<div class="card mt-2 p-2">
  <!-- Plante -->
  <div>
    {plant.name}
  </div>

  <!-- Lot Phyt'Essence -->
  Lot Phyt'Essence : <span>{batchNumberPhytessence}</span>

  <!-- Quantité -->
  <div>
    Quantité : <span>{formatQuantity(contents.quantity, plant.unit)}</span>
  </div>
</div>
