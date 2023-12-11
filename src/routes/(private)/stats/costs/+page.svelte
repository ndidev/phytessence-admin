<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { PageHeader } from "$lib/components";
</script>

<PageHeader
  title="Coûts"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Statistiques", link: "/stats" },
    { label: "Coûts", link: "/stats/costs" },
  ]}
/>

<p>Bientôt disponible</p>
