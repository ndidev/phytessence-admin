<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import {
    Table,
    type TableSource,
    Paginator,
    type PaginationSettings,
  } from "@skeletonlabs/skeleton";

  import { goto } from "$app/navigation";

  import { PageHeader, SearchInput } from "$lib/components";
  import { normalize } from "$lib/utils";

  import { browser } from "$app/environment";
  const localStorage = browser ? window.localStorage : undefined;

  let searchInputValue = "";

  $: recipesArray = data.recipes;

  $: tableSource = {
    head: ["Nom", "Description"],
    body: recipesArray
      .slice(
        paginationSettings.page * paginationSettings.limit,
        paginationSettings.page * paginationSettings.limit +
          paginationSettings.limit
      )
      .map(({ name, description }) => {
        return [name, description.replace(/(?:\r\n|\r|\n)/g, "<br>") || "-"];
      }),
    meta: recipesArray
      .slice(
        paginationSettings.page * paginationSettings.limit,
        paginationSettings.page * paginationSettings.limit +
          paginationSettings.limit
      )
      .map(({ id }) => {
        return [id];
      }),
  } satisfies TableSource;

  let paginationSettings = {
    page: 0,
    limit: parseInt(localStorage?.getItem("recipesPaginatorAmount") || "10"),
    size: data.recipes.length,
    amounts: [10, 20, 100, data.recipes.length],
  } satisfies PaginationSettings;

  function goToRecipePage(e: CustomEvent<string[]>) {
    goto(`/products/recipes/${e.detail[0]}`);
  }

  /**
   * Sauvegarder la préférence d'affichage du tableau.
   *
   * @param e
   */
  function onAmountChange(e: CustomEvent<number>) {
    localStorage?.setItem("recipesPaginatorAmount", String(e.detail));
  }

  /**
   * Rechercher une/des commande(s) dans la liste.
   */
  function searchRecipe(searchTerm: string) {
    searchTerm = searchTerm.trim();

    if (searchTerm === "") {
      recipesArray = data.recipes;
    } else {
      recipesArray = data.recipes.filter(({ name, description }) => {
        const haystack = normalize(`${name} ${description}`);

        return normalize(searchTerm)
          .split(" ")
          .map((needle) => haystack.includes(needle))
          .every((needleFound) => needleFound === true);
      });
    }

    paginationSettings.page = 0;
    paginationSettings.size = recipesArray.length;
    paginationSettings.amounts = [10, 20, 100, recipesArray.length];
  }
</script>

<PageHeader
  title="Recettes"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Produits", link: "/products" },
    { label: "Recettes", link: "/products/recipes" },
  ]}
/>

<div class="mb-4">
  <a
    href="/products/recipes/new/edit"
    title="Ajouter une recette"
    class="btn variant-filled-primary">Ajouter une recette</a
  >
</div>

<SearchInput
  placeholder="Rechercher une recette..."
  bind:value={searchInputValue}
  on:input={() => searchRecipe(searchInputValue)}
/>

<div class="">
  <Table source={tableSource} interactive={true} on:selected={goToRecipePage} />
  <Paginator
    bind:settings={paginationSettings}
    showFirstLastButtons={true}
    showPreviousNextButtons={true}
    amountText="recettes"
    separatorText="sur"
    on:amount={onAmountChange}
  />
</div>
