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

  $: plantArray = data.plants;

  $: tableSource = {
    head: ["Nom"],
    body: plantArray
      .slice(
        paginationSettings.page * paginationSettings.limit,
        paginationSettings.page * paginationSettings.limit +
          paginationSettings.limit
      )
      .map(({ name }) => {
        return [name];
      }),
    meta: plantArray
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
    limit: parseInt(localStorage?.getItem("plantsPaginatorAmount") || "10"),
    size: data.plants.length,
    amounts: [10, 20, 100, data.plants.length],
  } satisfies PaginationSettings;

  function goToPlantPage(e: CustomEvent<string[]>) {
    goto(`/products/plants/${e.detail[0]}`);
  }

  /**
   * Sauvegarder la préférence d'affichage du tableau.
   *
   * @param e
   */
  function onAmountChange(e: CustomEvent<number>) {
    localStorage?.setItem("plantsPaginatorAmount", String(e.detail));
  }

  /**
   * Rechercher une/des plante(s) dans la liste.
   */
  function searchPlant(searchTerm: string) {
    searchTerm = searchTerm.trim();

    if (searchTerm === "") {
      plantArray = data.plants;
    } else {
      plantArray = data.plants.filter(({ name }) => {
        const haystack = normalize(name);

        return normalize(searchTerm)
          .split(" ")
          .map((needle) => haystack.includes(needle))
          .some((needleFound) => needleFound === true);
      });
    }

    paginationSettings.page = 0;
    paginationSettings.size = plantArray.length;
    paginationSettings.amounts = [10, 20, 100, plantArray.length];
  }
</script>

<PageHeader
  title="Plantes"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Produits", link: "/products" },
    { label: "Plantes", link: "/products/plants" },
  ]}
/>

<div class="mb-4">
  <a
    href="/products/plants/new"
    title="Ajouter une plante"
    class="btn variant-filled-primary">Ajouter une plante</a
  >
</div>

<SearchInput
  bind:value={searchInputValue}
  placeholder="Rechercher une plante..."
  on:input={() => searchPlant(searchInputValue)}
/>

<div class="">
  <Table source={tableSource} interactive={true} on:selected={goToPlantPage} />
  <Paginator
    bind:settings={paginationSettings}
    showFirstLastButtons={true}
    showPreviousNextButtons={true}
    amountText="plantes"
    separatorText="sur"
    on:amount={onAmountChange}
  />
</div>
