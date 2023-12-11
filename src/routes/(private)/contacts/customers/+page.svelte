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

  $: customersArray = data.customers;

  $: tableSource = {
    head: ["Nom", "Commentaires"],
    body: customersArray
      .slice(
        paginationSettings.page * paginationSettings.limit,
        paginationSettings.page * paginationSettings.limit +
          paginationSettings.limit
      )
      .map(({ name, pro, comments }) => {
        return [
          name + (pro ? " <span class='pro'>pro</span>" : ""),
          comments || "-",
        ];
      }),
    meta: customersArray
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
    limit: parseInt(localStorage?.getItem("customersPaginatorAmount") || "10"),
    size: data.customers.length,
    amounts: [10, 20, 100, data.customers.length],
  } satisfies PaginationSettings;

  function goToCustomerPage(e: CustomEvent<string[]>) {
    goto(`/contacts/customers/${e.detail[0]}`);
  }

  /**
   * Sauvegarder la préférence d'affichage du tableau.
   *
   * @param e
   */
  function onAmountChange(e: CustomEvent<number>) {
    localStorage?.setItem("customersPaginatorAmount", String(e.detail));
  }

  /**
   * Rechercher un/des client(s) dans la liste.
   */
  function searchCustomer(searchTerm: string) {
    searchTerm = searchTerm.trim();

    if (searchTerm === "") {
      customersArray = data.customers;
    } else {
      customersArray = data.customers.filter(({ name, pro }) => {
        const haystack = normalize(name + (pro ? " pro" : ""));

        return normalize(searchTerm)
          .split(" ")
          .map((needle) => haystack.includes(needle))
          .some((needleFound) => needleFound === true);
      });
    }

    paginationSettings.page = 0;
    paginationSettings.size = customersArray.length;
    paginationSettings.amounts = [10, 20, 100, customersArray.length];
  }
</script>

<PageHeader
  title="Annuaire clients"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Contacts", link: "/contacts" },
    { label: "Clients", link: "/contacts/customers" },
  ]}
/>

<div class="mb-4">
  <a
    href="/contacts/customers/new"
    title="Ajouter un client"
    class="btn variant-filled-primary">Ajouter un client</a
  >
</div>

<SearchInput
  placeholder="Rechercher un client..."
  bind:value={searchInputValue}
  on:input={() => searchCustomer(searchInputValue)}
/>

<div class="">
  <Table
    source={tableSource}
    interactive={true}
    on:selected={goToCustomerPage}
  />
  <Paginator
    bind:settings={paginationSettings}
    showFirstLastButtons={true}
    showPreviousNextButtons={true}
    amountText="clients"
    separatorText="sur"
    on:amount={onAmountChange}
  />
</div>

<style>
  :global(.pro) {
    display: inline-block;
    padding-inline: 0.25rem;
    margin-left: 0.25rem;
    background-color: blueviolet;
    color: white;
    border-radius: 6px;
    text-transform: uppercase;
    font-size: 0.75rem;
  }
</style>
