<script lang="ts">
  import { getContext } from "svelte";

  import { AutocompleteInput, QuantityInput } from "$lib/components";

  export let contents: RecipeBag["contents"][0];
  /** Bag index - Index de la ligne de sachet */
  export let bi: number;
  /** Contents index - Index de la ligne de contenu */
  export let ci: number;

  const plants = getContext<PlantAutocomplete[]>("plants");

  $: plant =
    plants.find(({ id }) => contents.plantId === id) ||
    ({ id: "", name: "", unit: "g" } as PlantAutocomplete);
</script>

<div class="card mt-2 p-2">
  <fieldset
    class="grid align-end gap-2 md:grid-cols-2 md:gap-4 xl:grid-cols-[repeat(2,_1fr)_auto]"
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
