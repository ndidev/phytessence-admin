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
    head: ["Date", "Client", "Commentaires"],
    body: ordersArray
      .slice(
        paginationSettings.page * paginationSettings.limit,
        paginationSettings.page * paginationSettings.limit +
          paginationSettings.limit
      )
      .map(({ orderDate, customerName, comments }) => {
        return [
          new Date(orderDate).toLocaleDateString(),
          customerName || "Client inconnu",
          comments?.replace(/(?:\r\n|\r|\n)/g, "<br>") || "-",
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
      localStorage?.getItem("customersOrdersPaginatorAmount") || "10"
    ),
    size: data.orders.length,
    amounts: [10, 20, 100, data.orders.length],
  } satisfies PaginationSettings;

  function goToOrderPage(e: CustomEvent<string[]>) {
    goto(`/orders/customers/${e.detail[0]}`);
  }

  /**
   * Sauvegarder la préférence d'affichage du tableau.
   *
   * @param e
   */
  function onAmountChange(e: CustomEvent<number>) {
    localStorage?.setItem("customersOrdersPaginatorAmount", String(e.detail));
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
        ({ orderDate, customerName, comments }) => {
          const haystack = normalize(
            `${new Date(
              orderDate
            ).toLocaleDateString()} ${customerName} ${comments}`
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
  title="Commandes clients"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Commandes", link: "/orders" },
    { label: "Commandes clients", link: "/orders/customers" },
  ]}
/>

<div class="mb-4">
  <a
    href="/orders/customers/new/edit"
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
