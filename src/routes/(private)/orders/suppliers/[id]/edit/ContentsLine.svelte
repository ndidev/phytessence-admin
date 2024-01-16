<script lang="ts">
  import { getContext, createEventDispatcher } from "svelte";

  import { getModalStore } from "@skeletonlabs/skeleton";

  import {
    AutocompleteInput,
    QuantityInput,
    ConfirmModal,
  } from "$lib/components";

  import { createNewId, isNewId } from "$lib/utils";

  import Batch from "./Batch.svelte";

  // Props
  export let contents: SupplierOrder["contents"][0];
  export let order: SupplierOrder;
  /** Contents index - Index de la ligne de contenu */
  export let ci: number;

  // Local
  const modalStore = getModalStore();
  const dispatch = createEventDispatcher();
  const plants = getContext<PlantAutocomplete[]>("plants");
  $: plant =
    plants.find(({ id }) => contents.plantId === id) ||
    ({ id: "", name: "", unit: "g" } as PlantAutocomplete);

  function addBatch() {
    contents.batches.push({
      id: createNewId(),
      suppliersContentsId: contents.id,
      batchNumberSupplier: "",
      batchNumberPhytessence: "",
      phytBatchIsSupplierBatch: false,
      quantity: 0,
      expiryDate: "",
    });

    contents = contents;
  }

  function deleteContentsLine() {
    if (isNewId(contents.id)) {
      _actualDelete();
    }

    if (!isNewId(contents.id)) {
      modalStore.trigger({
        type: "component",
        component: {
          ref: ConfirmModal,
          props: {
            title: "Supprimer la plante",
            onConfirm: () => {
              _actualDelete();
              modalStore.clear();
            },
            onCancel: () => {
              modalStore.close();
            },
          },
          slot: "<p>Confirmez-vous la suppression de cette plante de la commande ?</p>",
        },
      });
    }

    function _actualDelete() {
      order.contents = order.contents.filter(({ id }) => id !== contents.id);
      dispatch("contentsDeleted");
    }
  }
</script>

<div class="card my-2 p-4">
  <fieldset class="grid md:grid-cols-2 xl:grid-cols-4 gap-2 md:gap-4">
    <input type="hidden" name="contents.{ci}.id" value={contents.id} readonly />

    <!-- Plante -->
    <AutocompleteInput
      label="Plante"
      name="contents.{ci}.plantId"
      data={plants}
      bind:value={contents.plantId}
      required
    />

    <!-- Quantité -->
    <QuantityInput
      name="contents.{ci}.quantity"
      bind:value={contents.quantity}
      unit={plant.unit}
      required
    />

    <!-- Coût HT -->
    <QuantityInput
      label="Coût HT"
      name="contents.{ci}.cost"
      bind:value={contents.cost}
      unit={"€/" + (plant.unit === "g" ? "kg" : plant.unit)}
    />

    <!-- Taux de TVA -->
    <QuantityInput
      label="Taux de TVA"
      name="contents.{ci}.vat"
      bind:value={contents.vat}
      unit="%"
      datalistId="vat-rates-{contents.id}"
    />
    <datalist id="vat-rates-{contents.id}">
      <option value="0" />
      <option value="5.50" />
      <option value="10" />
      <option value="20" />
    </datalist>
  </fieldset>

  <div class="mt-2">
    <div class="h6 mt-2">Lots</div>

    {#each contents.batches as batch, bi (batch.id)}
      <Batch
        {contents}
        {batch}
        {ci}
        {bi}
        {plant}
        on:batchDeleted={() => (contents.batches = contents.batches)}
      />
    {:else}
      <div class="card p-2 mt-2">Aucun lot renseigné</div>
    {/each}
  </div>

  <button
    type="button"
    class="btn variant-filled-surface mt-2"
    on:click={addBatch}>Ajouter un lot</button
  >

  <button
    type="button"
    class="btn variant-soft-error mt-2"
    on:click={deleteContentsLine}>Supprimer cette plante de la commande</button
  >
</div>
