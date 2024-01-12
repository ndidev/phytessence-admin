<script lang="ts">
  import { getContext } from "svelte";

  import { AutocompleteInput, QuantityInput } from "$lib/components";

  // Props
  export let contents: CustomerOrderBag["contents"][0];
  /** Bag index - Index de la ligne de sachet */
  export let bi: number;
  /** Contents index - Index de la ligne de contenu */
  export let ci: number;

  // Local
  const plants = getContext<PlantAutocomplete[]>("plants");
  const batches = getContext<BatchAutocomplete[]>("batches");
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

<div class="card mt-2 p-2">
  <fieldset
    class="grid align-end gap-2 md:grid-cols-2 md:gap-4 xl:grid-cols-[repeat(3,_1fr)_auto]"
  >
    <input
      type="hidden"
      name="bags.{bi}.contents.{ci}.id"
      value={contents.id}
      readonly
    />

    <!-- Plante -->
    <AutocompleteInput
      label="Plante"
      name="bags.{bi}.contents.{ci}.plantId"
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
      name="bags.{bi}.contents.{ci}.batchId"
      data={filteredBatches}
      bind:value={contents.batchId}
      disabled={!contents.plantId}
      required
    />

    <!-- Quantité -->
    <QuantityInput
      name="bags.{bi}.contents.{ci}.quantity"
      bind:value={contents.quantity}
      unit={plant.unit}
      required
    />

    <div class="mt-2">
      <button
        type="button"
        class="btn variant-soft-error"
        title="Supprimer cette plante du sachet"
        on:click><span class="material-symbols-outlined">delete</span></button
      >
    </div>
  </fieldset>
</div>
