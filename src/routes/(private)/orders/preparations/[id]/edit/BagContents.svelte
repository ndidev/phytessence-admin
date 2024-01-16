<script lang="ts">
  import { getContext, createEventDispatcher } from "svelte";
  import { getModalStore } from "@skeletonlabs/skeleton";

  import {
    AutocompleteInput,
    QuantityInput,
    ConfirmModal,
  } from "$lib/components";
  import { isNewId } from "$lib/utils";

  // Props
  export let contents: CustomerOrderBag["contents"][0];
  export let bag: PreparedBag;
  /** Contents index - Index de la ligne de contenu */
  export let ci: number;

  // Local
  const modalStore = getModalStore();
  const dispatch = createEventDispatcher();
  const plants = getContext<PlantAutocomplete[]>("plants");
  const batches = getContext<BatchAutocomplete[]>("batches");
  let plant =
    plants.find(({ id }) => contents.plantId === id) ||
    ({ id: "", name: "", unit: "g" } as PlantAutocomplete);
  let filteredBatches = batches.filter(({ plantId }) => plantId === plant.id);
  let batchNumberAutocomplete: AutocompleteInput<Plant["id"]>;

  function filterBatches(plantId: Plant["id"]) {
    filteredBatches = batches.filter(
      ({ plantId: plantId_ }) => plantId === plantId_
    );
  }

  function deleteBagContents() {
    if (isNewId(contents.id)) {
      _actualDelete();
    } else {
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
      bag.contents = bag.contents.filter(({ id }) => id !== contents.id);
      dispatch("contentsDeleted");
    }
  }
</script>

<div class="card mt-2 p-2">
  <fieldset
    class="grid align-end gap-2 md:grid-cols-2 md:gap-4 xl:grid-cols-[repeat(3,_1fr)_auto]"
  >
    <input type="hidden" name="contents.{ci}.id" value={contents.id} readonly />

    <!-- Plante -->
    <AutocompleteInput
      label="Plante"
      name="contents.{ci}.plantId"
      data={plants}
      bind:value={contents.plantId}
      onInput={() => batchNumberAutocomplete.reset()}
      afterSelection={filterBatches}
      required
    />

    <!-- Lot Phyt'Essence -->
    <AutocompleteInput
      bind:this={batchNumberAutocomplete}
      label="Numéro de lot"
      name="contents.{ci}.batchId"
      data={filteredBatches}
      bind:value={contents.batchId}
      disabled={!contents.plantId}
      required
    />

    <!-- Quantité -->
    <QuantityInput
      name="contents.{ci}.quantity"
      bind:value={contents.quantity}
      unit={plant.unit}
      required
    />

    <div class="mt-2">
      <button
        type="button"
        class="btn variant-soft-error"
        title="Supprimer cette plante du sachet"
        on:click={deleteBagContents}
        ><span class="material-symbols-outlined">delete</span></button
      >
    </div>
  </fieldset>
</div>
