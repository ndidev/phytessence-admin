<script lang="ts">
  import BagContents from "./BagContents.svelte";

  import { ConfirmModal } from "$lib/components";

  import { createNewId, isNewId, modalStore } from "$lib/utils";

  export let bag: Bag;
  /** Bag index - Index de la ligne de sachet */
  export let bi: number;

  function addBagContents() {
    bag.contents.push({
      id: createNewId(),
      bagId: bag.id,
      plantId: "",
      quantity: 0,
      batchId: "",
    });

    bag = bag;
  }

  function deleteBagContents(contentsId: Bag["contents"][0]["id"]) {
    if (isNewId(contentsId)) {
      _actualDelete();
    }

    if (!isNewId(contentsId)) {
      $modalStore.trigger({
        type: "component",
        component: {
          ref: ConfirmModal,
          props: {
            title: "Supprimer le lot",
            onConfirm: () => {
              _actualDelete();
              $modalStore.clear();
            },
            onCancel: () => {
              $modalStore.close();
            },
          },
          slot: "<p>Confirmez-vous la suppression de ce lot de la commande ?</p>",
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
    </div>
    <input
      type="hidden"
      name="bags.{bi}.number"
      value={tempBagNumber ? "" : bagNumber}
      readonly
    />

    {#each bag.contents as contents, ci (ci)}
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
