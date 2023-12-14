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

  $: suppliersArray = data.suppliers;

  $: tableSource = {
    head: ["Nom", "Commentaires"],
    body: suppliersArray
      .slice(
        paginationSettings.page * paginationSettings.limit,
        paginationSettings.page * paginationSettings.limit +
          paginationSettings.limit
      )
      .map(({ name, comments }) => {
        return [name, comments || "-"];
      }),
    meta: suppliersArray
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
    limit: parseInt(localStorage?.getItem("suppliersPaginatorAmount") || "10"),
    size: data.suppliers.length,
    amounts: [10, 20, 100, data.suppliers.length],
  } satisfies PaginationSettings;

  function goToSupplierPage(e: CustomEvent<string[]>) {
    goto(`/contacts/suppliers/${e.detail[0]}`);
  }

  /**
   * Sauvegarder la préférence d'affichage du tableau.
   *
   * @param e
   */
  function onAmountChange(e: CustomEvent<number>) {
    localStorage?.setItem("suppliersPaginatorAmount", String(e.detail));
  }

  /**
   * Rechercher un/des fournisseur(s) dans la liste.
   */
  function searchSupplier(searchTerm: string) {
    searchTerm = searchTerm.trim();

    if (searchTerm === "") {
      suppliersArray = data.suppliers;
    } else {
      suppliersArray = data.suppliers.filter(({ name }) => {
        const haystack = normalize(name);

        return normalize(searchTerm)
          .split(" ")
          .map((needle) => haystack.includes(needle))
          .every((needleFound) => needleFound === true);
      });
    }

    paginationSettings.page = 0;
    paginationSettings.size = suppliersArray.length;
    paginationSettings.amounts = [10, 20, 100, suppliersArray.length];
  }
</script>

<PageHeader
  title="Annuaire fournisseurs"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Contacts", link: "/contacts" },
    { label: "Fournisseurs", link: "/contacts/suppliers" },
  ]}
/>

<div class="mb-4">
  <a
    href="/contacts/suppliers/new"
    title="Ajouter un fournisseur"
    class="btn variant-filled-primary">Ajouter un fournisseur</a
  >
</div>

<SearchInput
  placeholder="Rechercher un fournisseur..."
  bind:value={searchInputValue}
  on:input={() => searchSupplier(searchInputValue)}
/>

<div class="">
  <Table
    source={tableSource}
    interactive={true}
    on:selected={goToSupplierPage}
  />
  <Paginator
    bind:settings={paginationSettings}
    showFirstLastButtons={true}
    showPreviousNextButtons={true}
    amountText="fournisseurs"
    separatorText="sur"
    on:amount={onAmountChange}
  />
</div>
