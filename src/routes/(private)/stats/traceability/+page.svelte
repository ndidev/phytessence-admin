<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { PageHeader } from "$lib/components";
</script>

<PageHeader
  title="Traçabilité"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Statistiques", link: "/stats" },
    { label: "Traçabilité", link: "/stats/traceability" },
  ]}
/>
