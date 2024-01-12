<script lang="ts">
  import type { SvelteComponent } from "svelte";

  import { getModalStore } from "@skeletonlabs/skeleton";

  import RecipeFillInBagContent from "./RecipeFillInBagContent.svelte";

  import { QuantityInput, AutocompleteInput } from "$lib/components";

  // Props
  export let parent: SvelteComponent;
  export let recipe: RecipeWithBatch;
  export let plants: PlantAutocomplete[] = [];
  export let batches: BatchAutocomplete[] = [];
  export let bagTypes: BagTypeAutocomplete[] = [];

  // Local
  const modalStore = getModalStore();

  function onFormSubmit() {
    if ($modalStore[1].response) {
      $modalStore[1].response(recipe);
    }
    modalStore.clear();
  }
</script>

{#if $modalStore[0]}
  <div class="card p-4 w-modal shadow-xl space-y-4">
    <header class="text-2xl font-bold">{recipe.name}</header>

    <!-- Focus trap -->
    <input class="hidden" />

    {#each recipe.bags as bag (bag.id)}
      <div class="card p-2 my-2">
        <div class="h6">
          Sachet n°{bag.number}
        </div>

        <div class="my-2">
          <AutocompleteInput
            placeholder="Type de sachet"
            name=""
            data={bagTypes}
            bind:value={bag.bagTypeId}
          />
        </div>

        <QuantityInput name="" bind:value={bag.quantity} step={1} />

        {#each bag.contents as contents (contents.id)}
          <RecipeFillInBagContent {contents} {plants} {batches} />
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
