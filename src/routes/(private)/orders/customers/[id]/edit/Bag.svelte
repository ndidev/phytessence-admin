<script lang="ts">
  import { getContext } from "svelte";

  import { getModalStore } from "@skeletonlabs/skeleton";

  import BagContents from "./BagContents.svelte";

  import { ConfirmModal, AutocompleteInput } from "$lib/components";

  import { createNewId, isNewId } from "$lib/utils";

  // Props
  export let bag: CustomerOrderBag;
  /** Bag index - Index de la ligne de sachet */
  export let bi: number;

  // Local
  const modalStore = getModalStore();
  const bagTypes = getContext<BagTypeAutocomplete[]>("bagTypes");

  function addBagContents() {
    bag.contents.push({
      id: createNewId(),
      bagId: bag.id,
      plantId: "",
      batchId: "",
      quantity: 0,
    });

    bag = bag;
  }

  function deleteBagContents(
    contentsId: CustomerOrderBag["contents"][number]["id"]
  ) {
    if (isNewId(contentsId)) {
      _actualDelete();
    }

    if (!isNewId(contentsId)) {
      modalStore.trigger({
        type: "component",
        component: {
          ref: ConfirmModal,
          props: {
            title: "Supprimer la plante du sachet",
            onConfirm: () => {
              _actualDelete();
              modalStore.clear();
            },
            onCancel: () => {
              modalStore.close();
            },
          },
          slot: "<p>Confirmez-vous la suppression de cette plante du sachet ?</p>",
        },
      });
    }

    function _actualDelete() {
      bag.contents = bag.contents.filter(({ id }) => id !== contentsId);
    }
  }

  let tempBagNumber = bag.number.startsWith("~");
  let bagNumber = bag.number.replace("~", "");
</script>

<div class="card my-2 p-4">
  <div class="mt-2">
    <input type="hidden" name="bags.{bi}.id" value={bag.id} readonly />

    <div class="h6 mt-2">
      Sachet n°<input
        class="input-bag-number"
        type="text"
        style:width="{bagNumber.length}ch"
        bind:value={bagNumber}
        on:input={() => (tempBagNumber = false)}
      />
      {#if tempBagNumber}
        <span>(numéro temporaire)</span>
      {/if}

      <input
        type="hidden"
        name="bags.{bi}.number"
        value={tempBagNumber ? "" : bagNumber}
        readonly
      />
    </div>

    <div class="my-2">
      <AutocompleteInput
        placeholder="Type de sachet"
        name="bags.{bi}.bagTypeId"
        data={bagTypes}
        bind:value={bag.bagTypeId}
      />
    </div>

    {#each bag.contents as contents, ci (contents.id)}
      <BagContents
        {contents}
        {ci}
        {bi}
        on:click={() => deleteBagContents(contents.id)}
      />
    {:else}
      <div class="card p-2 mt-2">Le sachet est vide</div>
    {/each}
  </div>

  <button
    type="button"
    class="btn variant-filled-surface mt-2"
    on:click={addBagContents}>Ajouter une plante</button
  >

  <button type="button" class="btn variant-soft-error mt-2" on:click
    >Supprimer ce sachet de la commande</button
  >
</div>

<style>
  .input-bag-number {
    @apply shadow-none ring-0 border-0 bg-transparent p-0;
  }

  .input-bag-number:hover,
  .input-bag-number:focus {
    @apply bg-primary-200;
  }
</style>
