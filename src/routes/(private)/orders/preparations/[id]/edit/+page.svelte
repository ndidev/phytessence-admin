<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { setContext } from "svelte";

  import BagContents from "./BagContents.svelte";

  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import { PageHeader, AutocompleteInput } from "$lib/components";
  import { showToastActionResult, createNewId } from "$lib/utils";

  let { bag, plants, batches, bagTypes } = data;

  setContext("plants", plants);
  setContext("batches", batches);
  setContext("bagTypes", bagTypes);

  // Local
  const isNew = !bag.id;
  let submitting = false;
  let tempBagNumber = bag.number.startsWith("~");
  let bagNumber = bag.number.replace("~", "");

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
</script>

<PageHeader
  title={isNew ? "Nouveau sachet" : "Sachet " + bag.number}
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Commandes", link: "/orders" },
    { label: "Sachets préparés", link: "/orders/preparations" },
    {
      label: isNew ? "Nouveau sachet" : bag.number,
      link: `/orders/preparations/${$page.params.id || "new"}`,
    },
    {
      label: isNew ? "Création" : "Modification",
      link: `/orders/preparations/${$page.params.id || "new"}/edit`,
    },
  ]}
/>

<form
  method="POST"
  action={isNew ? "?/create" : "?/update"}
  use:enhance={() => {
    submitting = true;

    return async ({ result }) => {
      submitting = false;

      let id = $page.params.id;

      if (result.type === "success") {
        id = isNew ? String(result.data?.bagId) : $page.params.id;
      }

      showToastActionResult(result, "/orders/preparations/" + id);
    };
  }}
>
  <div class="card my-2 p-4">
    <div class="mt-2">
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
          name="number"
          value={tempBagNumber ? "" : bagNumber}
          readonly
        />
      </div>

      <div class="my-2">
        <AutocompleteInput
          placeholder="Type de sachet"
          name="bagTypeId"
          data={bagTypes}
          bind:value={bag.bagTypeId}
        />
      </div>

      {#each bag.contents as contents, ci (contents.id)}
        <BagContents
          {bag}
          {contents}
          {ci}
          on:contentsDeleted={() => (bag.contents = bag.contents)}
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
  </div>

  <!-- Boutons -->
  <div class="mt-4 flex gap-4 flex-wrap">
    <button
      type="submit"
      class="btn variant-filled-success"
      disabled={submitting}
      >{isNew ? "Enregistrer le sachet" : "Valider les modifications"}</button
    >
    {#if !isNew}
      <form
        method="POST"
        action="?/delete"
        use:enhance={() => {
          submitting = true;

          return async ({ result }) => {
            submitting = false;
            showToastActionResult(result, "/orders/preparations/");
          };
        }}
      >
        <button
          class="btn variant-ghost-error"
          on:click={(e) => {
            confirm("Confirmer la suppression ?") || e.preventDefault();
          }}
          disabled={submitting}>Supprimer le sachet</button
        >
      </form>
    {/if}
  </div>
</form>

<style>
  .input-bag-number {
    @apply shadow-none ring-0 border-0 bg-transparent p-0;
  }

  .input-bag-number:hover,
  .input-bag-number:focus {
    @apply bg-primary-200;
  }
</style>
