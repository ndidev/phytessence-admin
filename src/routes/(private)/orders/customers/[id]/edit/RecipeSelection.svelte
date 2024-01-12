<script lang="ts">
  import type { SvelteComponent } from "svelte";

  import { getModalStore, ListBox, ListBoxItem } from "@skeletonlabs/skeleton";

  import RecipeFillIn from "./RecipeFillIn.svelte";

  import { SearchInput } from "$lib/components";
  import { normalize } from "$lib/utils";

  // Props
  export let parent: SvelteComponent;
  export let recipes: Recipe[] = [];
  export let plants: PlantAutocomplete[] = [];
  export let batches: PlantBatch[] = [];
  export let bagTypes: BagTypeAutocomplete[] = [];

  // Local
  const modalStore = getModalStore();
  let selectedRecipe: Recipe;
  let searchTerm = "";
  let matchingRecipes = recipes;

  function onFormSubmit() {
    modalStore.update((modals) => [
      {
        type: "component",
        component: {
          ref: RecipeFillIn,
          props: {
            recipe: structuredClone(selectedRecipe),
            plants,
            batches,
            bagTypes,
          },
        },
        response: (r) => {
          if (!r) return;

          if ($modalStore[0].response) {
            $modalStore[0].response(r);
          }
          modalStore.close();
        },
      },
      ...modals,
    ]);
  }

  /**
   * Rechercher une/des commande(s) dans la liste.
   */
  function searchRecipe(searchTerm: string) {
    searchTerm = searchTerm.trim();

    if (searchTerm === "") {
      matchingRecipes = recipes;
    } else {
      matchingRecipes = recipes.filter(({ name, description }) => {
        const haystack = normalize(`${name} ${description}`);

        return normalize(searchTerm)
          .split(" ")
          .map((needle) => haystack.includes(needle))
          .every((needleFound) => needleFound === true);
      });
    }
  }
</script>

{#if $modalStore[0]}
  <div class="card p-4 w-modal shadow-xl space-y-4">
    <header class="text-2xl font-bold">Choix de recette</header>

    <SearchInput
      placeholder="Rechercher une recette..."
      bind:value={searchTerm}
      on:input={() => searchRecipe(searchTerm)}
    />

    {#if matchingRecipes.length > 0}
      <ListBox
        class="border border-surface-500 p-4 rounded-container-token max-h-[60vh] overflow-y-auto"
      >
        {#each matchingRecipes as recipe}
          <ListBoxItem
            bind:group={selectedRecipe}
            name={recipe.name}
            value={recipe}>{recipe.name}</ListBoxItem
          >
        {/each}
      </ListBox>
    {:else}
      <div
        class="border border-surface-500 p-4 rounded-container-token max-h-[60vh] overflow-y-auto"
      >
        Aucune recette trouvée.
      </div>
    {/if}

    <footer class="modal-footer">
      <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
        >Annuler</button
      >
      <button
        class="btn {parent.buttonPositive}"
        on:click={onFormSubmit}
        disabled={!selectedRecipe}>Valider</button
      >
    </footer>
  </div>
{/if}
