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
  import { normalize, formatQuantity } from "$lib/utils";

  import { browser } from "$app/environment";
  const localStorage = browser ? window.localStorage : undefined;

  let searchInputValue = "";

  $: plantsArray = data.stats.plants;

  $: tableSource = {
    head: ["Nom", "Entrant", "Sortant", "Restant"],
    body: plantsArray
      .slice(
        paginationSettings.page * paginationSettings.limit,
        paginationSettings.page * paginationSettings.limit +
          paginationSettings.limit
      )
      .map(({ name, unit, inwards, expected, outwards, currentStock }) => {
        return [
          name,
          formatQuantity(inwards, unit) +
            (expected ? ` (+${formatQuantity(expected, unit)})` : ""),
          formatQuantity(outwards, unit),
          formatQuantity(currentStock, unit),
        ];
      }),
    meta: plantsArray
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
    limit: parseInt(localStorage?.getItem("stocksPaginatorAmount") || "10"),
    size: data.stats.plants.length,
    amounts: [10, 20, 100, data.stats.plants.length],
  } satisfies PaginationSettings;

  function goToPlantStatsPage(e: CustomEvent<string[]>) {
    goto(`/stats/stocks/${e.detail[0]}`);
  }

  /**
   * Sauvegarder la préférence d'affichage du tableau.
   *
   * @param e
   */
  function onAmountChange(e: CustomEvent<number>) {
    localStorage?.setItem("stocksPaginatorAmount", String(e.detail));
  }

  /**
   * Rechercher une/des plante(s) dans la liste.
   */
  function searchPlant(searchTerm: string) {
    searchTerm = searchTerm.trim();

    if (searchTerm === "") {
      plantsArray = data.stats.plants;
    } else {
      plantsArray = data.stats.plants.filter(({ name }) => {
        const haystack = normalize(name);

        return normalize(searchTerm)
          .split(" ")
          .map((needle) => haystack.includes(needle))
          .every((needleFound) => needleFound === true);
      });
    }

    paginationSettings.page = 0;
    paginationSettings.size = plantsArray.length;
    paginationSettings.amounts = [10, 20, 100, plantsArray.length];
  }
</script>

<PageHeader
  title="Stocks"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Statistiques", link: "/stats" },
    { label: "Stocks", link: "/stats/stocks" },
  ]}
/>

<SearchInput
  bind:value={searchInputValue}
  placeholder="Rechercher une plante..."
  on:input={() => searchPlant(searchInputValue)}
/>

<div class="stocks">
  <Table
    source={tableSource}
    interactive={true}
    on:selected={goToPlantStatsPage}
  />
  <Paginator
    bind:settings={paginationSettings}
    showFirstLastButtons={true}
    showPreviousNextButtons={true}
    amountText="plantes"
    separatorText="sur"
    on:amount={onAmountChange}
  />
</div>

<style>
  @media (max-width: 600px) {
    :global(.stocks table.table :is(td, th):is(:nth-child(2), :nth-child(3))) {
      display: none;
    }
  }
</style>
