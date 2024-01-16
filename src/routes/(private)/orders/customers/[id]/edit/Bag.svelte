<script lang="ts">
  import { getContext, createEventDispatcher } from "svelte";

  import { getModalStore } from "@skeletonlabs/skeleton";

  import BagContents from "./BagContents.svelte";
  import BagDeletionModal from "./BagDeletionModal.svelte";

  import { AutocompleteInput } from "$lib/components";

  import { createNewId, isNewId } from "$lib/utils";

  // Props
  export let bag: CustomerOrderBag;
  export let order: CustomerOrder;
  /** Bag index - Index de la ligne de sachet */
  export let bi: number;

  // Local
  const modalStore = getModalStore();
  const bagTypes = getContext<BagTypeAutocomplete[]>("bagTypes");

  const dispatch = createEventDispatcher();

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

  function deleteBag() {
    if (isNewId(bag.id)) {
      _actualDelete();
    } else {
      modalStore.trigger({
        type: "component",
        component: {
          ref: BagDeletionModal,
          props: {
            title: "Supprimer le sachet",
            onPreserve: () => {
              _setPreserveBag();
              modalStore.clear();
            },
            onDelete: () => {
              _actualDelete();
              modalStore.clear();
            },
            onCancel: () => {
              modalStore.close();
            },
          },
          slot:
            "<p>" +
            `Confirmez-vous la suppression de ce sachet de la commande ?<br/>` +
            `Vous pouvez conserver le sachet en préparation (mettre de côté).` +
            "</p>",
        },
      });
    }

    function _setPreserveBag() {
      bag.orderId = null;
    }

    function _actualDelete() {
      order.bags = order.bags.filter(({ id }) => id !== bag.id);
      dispatch("bagDeleted");
    }
  }

  function restoreBag() {
    bag.orderId = order.id;
    order.bags = order.bags;
  }

  let tempBagNumber = bag.number.startsWith("~");
  let bagNumber = bag.number.replace("~", "");
</script>

<div class="bag card my-2 p-4">
  <div class="mt-2" class:disabled={bag.orderId === null}>
    <input type="hidden" name="bags.{bi}.id" value={bag.id} readonly />
    <input
      type="hidden"
      name="bags.{bi}.orderId"
      bind:value={bag.orderId}
      readonly
    />

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
        {bag}
        {contents}
        {ci}
        {bi}
        on:contentsDeleted={() => (bag.contents = bag.contents)}
      />
    {:else}
      <div class="card p-2 mt-2">Le sachet est vide</div>
    {/each}
  </div>

  <button
    type="button"
    class="btn variant-filled-surface mt-2"
    on:click={addBagContents}
    disabled={bag.orderId === null}>Ajouter une plante</button
  >

  {#if bag.orderId !== null}
    <button
      type="button"
      class="btn variant-soft-error mt-2"
      on:click={deleteBag}>Supprimer ce sachet de la commande</button
    >
  {:else}
    <button
      type="button"
      class="btn variant-ghost-warning mt-2"
      on:click={restoreBag}>Rétablir ce sachet dans la commande</button
    >
  {/if}
</div>

<style>
  .bag > .disabled {
    @apply opacity-50;
    pointer-events: none;
  }

  .input-bag-number {
    @apply shadow-none ring-0 border-0 bg-transparent p-0;
  }

  .input-bag-number:hover,
  .input-bag-number:focus {
    @apply bg-primary-200;
  }
</style>
