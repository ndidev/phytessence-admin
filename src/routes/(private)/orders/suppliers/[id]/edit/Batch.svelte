<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { getModalStore } from "@skeletonlabs/skeleton";

  import {
    QuantityInput,
    DateInput,
    TextInput,
    ConfirmModal,
  } from "$lib/components";
  import { isNewId } from "$lib/utils";

  export let batch: SupplierOrderContents["batches"][number];
  export let plant: PlantAutocomplete;

  /** Contents index - Index de la ligne de contenu */
  export let contents: SupplierOrderContents;
  export let ci: number;
  /** Batch index - Index de la ligne de lot */
  export let bi: number;

  // Local
  const modalStore = getModalStore();
  const dispatch = createEventDispatcher();

  function deleteBatch() {
    if (isNewId(batch.id)) {
      _actualDelete();
    }

    if (!isNewId(batch.id)) {
      modalStore.trigger({
        type: "component",
        component: {
          ref: ConfirmModal,
          props: {
            title: "Supprimer le lot",
            onConfirm: () => {
              _actualDelete();
              modalStore.clear();
            },
            onCancel: () => {
              modalStore.close();
            },
          },
          slot: "<p>Confirmez-vous la suppression de ce lot de la commande ?</p>",
        },
      });
    }

    function _actualDelete() {
      contents.batches = contents.batches.filter(({ id }) => id !== batch.id);
      dispatch("batchDeleted");
    }
  }
</script>

<div class="card mt-2 p-2">
  <fieldset
    class="grid align-end md:grid-cols-2 xl:grid-cols-[repeat(4,_1fr)_auto] gap-2 md:gap-4"
  >
    <input
      type="hidden"
      name="contents.{ci}.batches.{bi}.id"
      value={batch.id}
      readonly
    />

    <!-- Numéro de lot fournisseur -->
    <TextInput
      label="Numéro de lot fournisseur"
      name="contents.{ci}.batches.{bi}.batchNumberSupplier"
      bind:value={batch.batchNumberSupplier}
    />

    <!-- Numéro de lot Phyt'Essence -->
    <label class="label">
      <span>Numéro de lot Phyt'Essence</span>
      <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
        <div
          class="input-group-shim {batch.phytBatchIsSupplierBatch
            ? 'bg-surface-400/80'
            : ''}"
        >
          <button
            type="button"
            class="button input-button"
            title="Reprendre le numéro de lot fournisseur"
            on:click={() =>
              (batch.phytBatchIsSupplierBatch =
                !batch.phytBatchIsSupplierBatch)}>=</button
          >
          <input
            type="checkbox"
            name="contents.{ci}.batches.{bi}.phytBatchIsSupplierBatch"
            class="hidden"
            bind:checked={batch.phytBatchIsSupplierBatch}
          />
        </div>
        <input
          type="text"
          name="contents.{ci}.batches.{bi}.batchNumberPhytessence"
          value={batch.phytBatchIsSupplierBatch
            ? batch.batchNumberSupplier
            : batch.batchNumberPhytessence}
          placeholder="(automatique)"
          autocomplete="off"
          readonly={batch.phytBatchIsSupplierBatch}
        />
      </div>
    </label>

    <!-- Quantité -->
    <QuantityInput
      name="contents.{ci}.batches.{bi}.quantity"
      bind:value={batch.quantity}
      unit={plant.unit}
      required
    />

    <!-- Date d'expiration -->
    <DateInput
      label="Date d'expiration"
      name="contents.{ci}.batches.{bi}.expiryDate"
      value={batch.expiryDate}
    />

    <div class="mt-2">
      <button
        type="button"
        class="btn variant-soft-error"
        title="Supprimer le lot"
        on:click={deleteBatch}
        ><span class="material-symbols-outlined">delete</span></button
      >
    </div>
  </fieldset>
</div>

<style>
  .input-button {
    padding-left: 0;
    padding-right: 0;
  }

  .hidden {
    display: none;
  }
</style>
