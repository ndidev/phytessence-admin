<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { setContext } from "svelte";
  import { getModalStore, SlideToggle } from "@skeletonlabs/skeleton";

  import Bag from "./Bag.svelte";

  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import {
    PageHeader,
    TextInput,
    Textarea,
    ConfirmModal,
  } from "$lib/components";
  import { showToastActionResult, createNewId, isNewId } from "$lib/utils";

  let { recipe, plants } = data;

  let recipeName = recipe.name;

  setContext("plants", plants);

  // Local
  const modalStore = getModalStore();
  const isNew = !recipe.id;
  let submitting = false;

  function addBag() {
    recipe.bags.push({
      id: createNewId(),
      recipeId: recipe.id,
      number: recipe.bags.length + 1, // Mettre en dernière position
      quantity: 1,
      contents: [],
    });

    recipe = recipe;
  }

  function deleteBag(bagId: RecipeBag["id"]) {
    if (isNewId(bagId)) {
      _actualDelete();
    }

    if (!isNewId(bagId)) {
      modalStore.trigger({
        type: "component",
        component: {
          ref: ConfirmModal,
          props: {
            title: "Supprimer le sachet",
            onConfirm: () => {
              _actualDelete();
              modalStore.clear();
            },
            onCancel: () => {
              modalStore.close();
            },
          },
          slot: "<p>Confirmez-vous la suppression de ce sachet de la recette ?</p>",
        },
      });
    }

    function _actualDelete() {
      recipe.bags = recipe.bags.filter(({ id }) => id !== bagId);
    }
  }
</script>

<PageHeader
  title={isNew ? "Nouvelle recette" : recipe.name}
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Produits", link: "/products" },
    { label: "Recettes", link: "/products/recipes" },
    {
      label: isNew ? "Nouvelle recette" : recipe.name,
      link: `/products/recipes/${$page.params.id || "new"}`,
    },
    {
      label: isNew ? "Création" : "Modification",
      link: `/products/recipes/${$page.params.id || "new"}/edit`,
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
        id = isNew ? String(result.data?.recipeId) : $page.params.id;
      }

      showToastActionResult(result, "/products/recipes/" + id);
    };
  }}
>
  <!-- Nom -->
  <TextInput
    label="Nom"
    name="name"
    value={recipeName}
    placeholder="Nom de la recette"
    required
  />

  <!-- Description -->
  <Textarea label="Description" name="description" value={recipe.description} />

  <!-- Active -->
  <label class="label">
    <span>Active</span>
    <SlideToggle name="active" bind:checked={recipe.active} size="sm" />
  </label>

  <!-- Sachets de la recette -->
  <div>
    <div class="h5 my-2">Sachets de la recette</div>

    {#each recipe.bags as bag, bi (bag.id)}
      <Bag {bag} {bi} on:click={() => deleteBag(bag.id)} />
    {:else}
      <div class="card p-2 mt-2">La recette est vide</div>
    {/each}

    <button
      type="button"
      class="btn variant-filled-primary mt-2"
      on:click={addBag}
      title="Ajouter un sachet">Ajouter un sachet</button
    >
  </div>

  <!-- Boutons -->
  <div class="mt-4 flex gap-4 flex-wrap">
    <button
      type="submit"
      class="btn variant-filled-success"
      disabled={submitting}
      >{isNew ? "Enregistrer la recette" : "Valider les modifications"}</button
    >
    {#if !isNew}
      <form
        method="POST"
        action="?/delete"
        use:enhance={() => {
          submitting = true;

          return async ({ result }) => {
            submitting = false;
            showToastActionResult(result, "/products/recipes/");
          };
        }}
      >
        <button
          class="btn variant-ghost-error"
          on:click={(e) => {
            confirm("Confirmer la suppression ?") || e.preventDefault();
          }}
          disabled={submitting}>Supprimer la recette</button
        >
      </form>
    {/if}
  </div>
</form>
