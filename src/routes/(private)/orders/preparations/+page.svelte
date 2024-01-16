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

  $: bagsArray = data.bags;

  $: tableSource = {
    head: ["Numéro de sachet"],
    body: bagsArray
      .slice(
        paginationSettings.page * paginationSettings.limit,
        paginationSettings.page * paginationSettings.limit +
          paginationSettings.limit
      )
      .map(({ number }) => {
        return [number];
      }),
    meta: bagsArray
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
    limit: parseInt(
      localStorage?.getItem("preparedBagsPaginatorAmount") || "10"
    ),
    size: data.bags.length,
    amounts: [10, 20, 100, data.bags.length],
  } satisfies PaginationSettings;

  function goToBagPage(e: CustomEvent<string[]>) {
    goto(`/orders/preparations/${e.detail[0]}`);
  }

  /**
   * Sauvegarder la préférence d'affichage du tableau.
   *
   * @param e
   */
  function onAmountChange(e: CustomEvent<number>) {
    localStorage?.setItem("preparedBagsPaginatorAmount", String(e.detail));
  }

  /**
   * Rechercher une/des commande(s) dans la liste.
   */
  function searchOrder(searchTerm: string) {
    searchTerm = searchTerm.trim();

    if (searchTerm === "") {
      bagsArray = data.bags;
    } else {
      bagsArray = data.bags.filter(({ number }) => {
        const haystack = normalize(number);

        return normalize(searchTerm)
          .split(" ")
          .map((needle) => haystack.includes(needle))
          .every((needleFound) => needleFound === true);
      });
    }

    paginationSettings.page = 0;
    paginationSettings.size = bagsArray.length;
    paginationSettings.amounts = [10, 20, 100, bagsArray.length];
  }
</script>

<PageHeader
  title="Sachets préparés"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Commandes", link: "/orders" },
    { label: "Sachets préparés", link: "/orders/preparations" },
  ]}
/>

<div class="mb-4">
  <a
    href="/orders/preparations/new/edit"
    title="Ajouter un sachet"
    class="btn variant-filled-primary">Ajouter un sachet</a
  >
</div>

<SearchInput
  placeholder="Rechercher un sachet..."
  bind:value={searchInputValue}
  on:input={() => searchOrder(searchInputValue)}
/>

<div class="">
  <Table source={tableSource} interactive={true} on:selected={goToBagPage} />
  <Paginator
    bind:settings={paginationSettings}
    showFirstLastButtons={true}
    showPreviousNextButtons={true}
    amountText="sachets"
    separatorText="sur"
    on:amount={onAmountChange}
  />
</div>
