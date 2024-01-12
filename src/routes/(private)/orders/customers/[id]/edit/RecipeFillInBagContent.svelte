<script lang="ts">
  import { AutocompleteInput, QuantityInput } from "$lib/components";

  // Props
  export let contents: RecipeWithBatch["bags"][number]["contents"][number];
  export let plants: PlantAutocomplete[] = [];
  export let batches: BatchAutocomplete[];

  // Local
  let plant =
    plants.find(({ id }) => contents.plantId === id) ||
    ({ id: "", name: "", unit: "g" } as PlantAutocomplete);
  let filteredBatches = batches.filter(({ plantId }) => plantId === plant.id);
  let batchNumberAutocomplete: AutocompleteInput<Plant["id"]>;

  function filterBatches(plantId: Plant["id"]) {
    filteredBatches = batches.filter(
      ({ plantId: plantId_ }) => plantId === plantId_
    );
  }
</script>

<div class="grid align-end gap-2 md:gap-4 xl:grid-cols-[2fr_1fr_1fr]">
  <!-- Plante -->
  <AutocompleteInput
    label="Plante"
    data={plants}
    bind:value={contents.plantId}
    onInput={() => batchNumberAutocomplete.reset()}
    afterSelection={filterBatches}
    required
  />

  <!-- Lot Phyt'Essence -->
  <AutocompleteInput
    bind:this={batchNumberAutocomplete}
    label="Numéro de lot"
    data={filteredBatches}
    bind:value={contents.batchId}
    disabled={!contents.plantId}
  />

  <!-- Quantité -->
  <QuantityInput bind:value={contents.quantity} unit={plant?.unit || ""} />
</div>
