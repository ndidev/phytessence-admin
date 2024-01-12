<script lang="ts">
  import { getContext } from "svelte";

  import { getModalStore } from "@skeletonlabs/skeleton";

  import BagContents from "./BagContents.svelte";

  import {
    ConfirmModal,
    QuantityInput,
    AutocompleteInput,
  } from "$lib/components";

  import { createNewId, isNewId } from "$lib/utils";

  // Props
  export let bag: RecipeBag;
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
      quantity: 0,
    });

    bag = bag;
  }

  function deleteBagContents(contentsId: RecipeBag["contents"][number]["id"]) {
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
</script>

<div class="card my-2 p-4">
  <div class="mt-2">
    <input type="hidden" name="bags.{bi}.id" value={bag.id} readonly />

    <div class="h6 mt-2">
      Sachet n°{bag.number}
    </div>

    <div class="my-2">
      <AutocompleteInput
        placeholder="Type de sachet"
        name="bags.{bi}.bagTypeId"
        data={bagTypes}
        bind:value={bag.bagTypeId}
      />
    </div>

    <QuantityInput
      name="bags.{bi}.quantity"
      bind:value={bag.quantity}
      step={1}
      required
    />

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
