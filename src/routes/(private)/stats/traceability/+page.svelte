<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { RadioGroup, RadioItem } from "@skeletonlabs/skeleton";

  import { PageHeader, SearchInput } from "$lib/components";

  const { searchTable } = data;

  // Local
  let searchTerm = "";
  let searchType: (typeof searchTable)[0]["type"] = "bag";
  let searchPlaceholder = "";
  let searchResults: typeof searchTable = [];

  $: switch (searchType) {
    case "bag":
      searchPlaceholder = "Rechercher un numéro de sachet...";
      break;

    case "batch":
      searchPlaceholder = "Rechercher un lot Phyt'Essence";
      break;

    case "sb":
      searchPlaceholder = "Rechercher un lot fournisseur";
      break;

    default:
      searchPlaceholder = "Rechercher";
      break;
  }

  $: searchType, search();

  function search() {
    if (searchTerm === "") {
      searchResults = [];
      return;
    }

    searchResults = searchTable.filter((line) => {
      return line.type === searchType && line.searchTerm.includes(searchTerm);
    });
  }
</script>

<PageHeader
  title="Traçabilité"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Statistiques", link: "/stats" },
    { label: "Traçabilité", link: "/stats/traceability" },
  ]}
/>

<RadioGroup class="mb-4">
  <RadioItem bind:group={searchType} name="" value="bag">N° de sachet</RadioItem
  >
  <RadioItem bind:group={searchType} name="" value="batch"
    >Lot Phyt'Essence</RadioItem
  >
  <RadioItem bind:group={searchType} name="" value="sb"
    >Lot fournisseur</RadioItem
  >
</RadioGroup>

<SearchInput
  bind:value={searchTerm}
  placeholder={searchPlaceholder}
  on:input={search}
/>

{#if searchTerm}
  <nav class="list-nav card p-2">
    <ul>
      {#each searchResults as result}
        <li>
          <a href="/stats/traceability/{result.type}/{result.id}"
            >{result.searchTerm}</a
          >
        </li>
      {:else}
        <li>Aucun résultat trouvé.</li>
      {/each}
    </ul>
  </nav>
{:else}
  <div class="card p-2">
    Recherchez une référence pour afficher la liste des résultats.
  </div>
{/if}
