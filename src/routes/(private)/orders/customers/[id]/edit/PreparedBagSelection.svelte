<script lang="ts">
  import type { SvelteComponent } from "svelte";

  import { getModalStore, ListBox, ListBoxItem } from "@skeletonlabs/skeleton";

  import { SearchInput } from "$lib/components";
  import { normalize } from "$lib/utils";

  // Props
  export let parent: SvelteComponent;
  export let preparedBags: PreparedBag[] = [];

  // Local
  const modalStore = getModalStore();
  let selectedBag: PreparedBag;
  let searchTerm = "";
  let matchingBags = preparedBags;

  async function onFormSubmit() {
    if (!selectedBag) return;

    selectedBag = await (
      await fetch("/orders/preparations/" + selectedBag.id)
    ).json();

    console.log(selectedBag);

    if ($modalStore[0].response) {
      $modalStore[0].response(selectedBag);
    }
    modalStore.close();
  }

  /**
   * Rechercher un/des sachet(s) dans la liste.
   */
  function searchBag(searchTerm: string) {
    searchTerm = searchTerm.trim();

    if (searchTerm === "") {
      matchingBags = preparedBags;
    } else {
      matchingBags = preparedBags.filter(({ number }) => {
        const haystack = normalize(number);

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
    <header class="text-2xl font-bold">Choix de sachet préparé</header>

    <SearchInput
      placeholder="Rechercher un sachet..."
      bind:value={searchTerm}
      on:input={() => searchBag(searchTerm)}
    />

    {#if matchingBags.length > 0}
      <ListBox
        class="border border-surface-500 p-4 rounded-container-token max-h-[60vh] overflow-y-auto"
      >
        {#each matchingBags as bag}
          <ListBoxItem bind:group={selectedBag} name={bag.number} value={bag}
            >{bag.number}</ListBoxItem
          >
        {/each}
      </ListBox>
    {:else}
      <div
        class="border border-surface-500 p-4 rounded-container-token max-h-[60vh] overflow-y-auto"
      >
        Aucun sachet trouvé.
      </div>
    {/if}

    <footer class="modal-footer">
      <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
        >Annuler</button
      >
      <button
        class="btn {parent.buttonPositive}"
        on:click={onFormSubmit}
        disabled={!selectedBag}>Valider</button
      >
    </footer>
  </div>
{/if}
