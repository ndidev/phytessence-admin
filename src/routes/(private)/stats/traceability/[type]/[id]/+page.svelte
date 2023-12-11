<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  const { item } = data;

  import { page } from "$app/stores";
  import { PageHeader } from "$lib/components";
</script>

<PageHeader
  title={item.category + " " + item.name}
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Statistiques", link: "/stats" },
    { label: "Traçabilité", link: "/stats/traceability" },
    {
      label: item.category + " " + item.name,
      link: `/stats/traceability/${$page.params.id}`,
    },
  ]}
/>

<pre>{JSON.stringify(item.data, null, 2)}</pre>
