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

  $: ordersArray = data.orders;

  $: tableSource = {
    head: ["Date", "Fournisseur", "Commentaires"],
    body: ordersArray
      .slice(
        paginationSettings.page * paginationSettings.limit,
        paginationSettings.page * paginationSettings.limit +
          paginationSettings.limit
      )
      .map(({ orderDate, attente, supplierName, comments }) => {
        return [
          new Date(orderDate).toLocaleDateString() +
            (attente ? " (en attente)" : ""),
          supplierName || "Fournisseur inconnu",
          comments.replace(/(?:\r\n|\r|\n)/g, "<br>") || "-",
        ];
      }),
    meta: ordersArray
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
      localStorage?.getItem("suppliersOrdersPaginatorAmount") || "10"
    ),
    size: data.orders.length,
    amounts: [10, 20, 100, data.orders.length],
  } satisfies PaginationSettings;

  function goToOrderPage(e: CustomEvent<string[]>) {
    goto(`/orders/suppliers/${e.detail[0]}`);
  }

  /**
   * Sauvegarder la préférence d'affichage du tableau.
   *
   * @param e
   */
  function onAmountChange(e: CustomEvent<number>) {
    localStorage?.setItem("suppliersOrdersPaginatorAmount", String(e.detail));
  }

  /**
   * Rechercher une/des commande(s) dans la liste.
   */
  function searchOrder(searchTerm: string) {
    searchTerm = searchTerm.trim();

    if (searchTerm === "") {
      ordersArray = data.orders;
    } else {
      ordersArray = data.orders.filter(
        ({ orderDate, supplierName, supplierReference, comments }) => {
          const haystack = normalize(
            `${new Date(
              orderDate
            ).toLocaleDateString()} ${supplierName} ${supplierReference} ${comments}`
          );

          return normalize(searchTerm)
            .split(" ")
            .map((needle) => haystack.includes(needle))
            .every((needleFound) => needleFound === true);
        }
      );
    }

    paginationSettings.page = 0;
    paginationSettings.size = ordersArray.length;
    paginationSettings.amounts = [10, 20, 100, ordersArray.length];
  }
</script>

<PageHeader
  title="Commandes fournisseurs"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Commandes", link: "/orders" },
    { label: "Commandes fournisseurs", link: "/orders/suppliers" },
  ]}
/>

<div class="mb-4">
  <a
    href="/orders/suppliers/new/edit"
    title="Ajouter une commande"
    class="btn variant-filled-primary">Ajouter une commande</a
  >
</div>

<SearchInput
  placeholder="Rechercher une commande..."
  bind:value={searchInputValue}
  on:input={() => searchOrder(searchInputValue)}
/>

<div class="">
  <Table source={tableSource} interactive={true} on:selected={goToOrderPage} />
  <Paginator
    bind:settings={paginationSettings}
    showFirstLastButtons={true}
    showPreviousNextButtons={true}
    amountText="commandes"
    separatorText="sur"
    on:amount={onAmountChange}
  />
</div>
