<script lang="ts">
  import { AutocompleteInput, QuantityInput } from "$lib/components";

  export let contents: RecipeWithBatch["bags"][number]["contents"][number];
  export let plant: PlantAutocomplete;
  export let batches: {
    id: string;
    name: string;
  }[];
</script>

<div class="grid align-end gap-2 md:gap-4 xl:grid-cols-[2fr_1fr_1fr]">
  <!-- Plante -->
  <div class="self-center">{plant?.name || "Plante inconnue"}</div>

  <!-- Lot Phyt'Essence -->
  <AutocompleteInput
    label="Numéro de lot"
    name=""
    data={batches}
    bind:value={contents.batchId}
  />

  <!-- Quantité -->
  <QuantityInput
    name=""
    bind:value={contents.quantity}
    unit={plant?.unit || ""}
  />
</div>
