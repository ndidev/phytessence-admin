<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { PageHeader } from "$lib/components";
</script>

<PageHeader
  title="Statistiques"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Statistiques", link: "/stats" },
  ]}
/>

<nav class="list-nav">
  <ul>
    <li>
      <a href="/stats/stocks">
        <span class="badge bg-primary-50 material-symbols-outlined"
          >arrow_forward</span
        >
        <span class="flex-auto">Stocks</span>
      </a>
    </li>
    <li>
      <a href="/stats/traceability">
        <span class="badge bg-primary-50 material-symbols-outlined"
          >arrow_forward</span
        >
        <span class="flex-auto">Traçabilité</span>
      </a>
    </li>
    <!-- <li>
      <a href="/stats/costs">
        <span class="badge bg-primary-50 material-symbols-outlined"
          >arrow_forward</span
        >
        <span class="flex-auto">Coûts</span>
      </a>
    </li> -->
  </ul>
</nav>
