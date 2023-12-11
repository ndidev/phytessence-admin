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

<p>
  <a href="/stats/stocks">Stocks</a>
</p>

<p>
  <a href="/stats/traceability">Traçabilité</a>
</p>

<p>
  <a href="/stats/costs">Coûts</a>
</p>
