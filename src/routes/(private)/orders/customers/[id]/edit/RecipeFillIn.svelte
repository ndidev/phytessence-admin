<script lang="ts">
  import type { SvelteComponent } from "svelte";

  import { getModalStore } from "@skeletonlabs/skeleton";

  import RecipeFillInBagContent from "./RecipeFillInBagContent.svelte";

  import { QuantityInput } from "$lib/components";

  // Props
  export let parent: SvelteComponent;
  export let recipe: RecipeWithBatch;
  export let plants: PlantAutocomplete[] = [];
  export let batches: PlantBatch[] = [];

  // Local
  const modalStore = getModalStore();

  function onFormSubmit() {
    if ($modalStore[1].response) {
      $modalStore[1].response(recipe);
    }
    modalStore.clear();
  }

  function filterBatches(plantId: Plant["id"]) {
    return batches
      .filter(({ plantId: plantId_ }) => plantId === plantId_)
      .map((batch) => ({
        id: batch.id,
        name: batch.batchNumberPhytessence,
      }));
  }
</script>

{#if $modalStore[0]}
  <div class="card p-4 w-modal shadow-xl space-y-4">
    <header class="text-2xl font-bold">{recipe.name}</header>

    {#each recipe.bags as bag (bag.id)}
      <div class="card p-2 my-2">
        <div class="h6">
          Sachet n°{bag.number}
        </div>

        <QuantityInput name="" bind:value={bag.quantity} step={1} />

        {#each bag.contents as contents (contents.id)}
          {@const plant = (plants || []).find(
            ({ id }) => id === contents.plantId
          ) || { id: "", name: "Plante inconnue", unit: "g" }}
          {@const filteredBatches = filterBatches(plant.id)}

          <RecipeFillInBagContent
            {contents}
            batches={filteredBatches}
            {plant}
          />
        {:else}
          <div class="card p-2 mt-2">Le sachet est vide</div>
        {/each}
      </div>
    {:else}
      <div class="card p-2 mt-2">La recette est vide</div>
    {/each}

    <footer class="modal-footer">
      <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
        >Annuler</button
      >
      <button class="btn {parent.buttonPositive}" on:click={onFormSubmit}
        >Valider</button
      >
    </footer>
  </div>
{/if}
