<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  $: item = data.item || { category: "", name: "", data: {} };

  import { page } from "$app/stores";
  import { PageHeader } from "$lib/components";

  import Bag from "./Bag.svelte";
  import Batch from "./Batch.svelte";
  import SupplierBatch from "./SupplierBatch.svelte";

  const components = [
    { type: "batch", component: Batch },
    { type: "bag", component: Bag },
    { type: "sb", component: SupplierBatch },
  ];

  $: component =
    components.find(({ type }) => $page.params.type === type)?.component ||
    null;
</script>

<PageHeader
  title={item.category + " " + item.name}
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Statistiques", link: "/stats" },
    { label: "Traçabilité", link: "/stats/traceability" },
    {
      label: item.category + " " + item.name,
      link: `/stats/traceability/${$page.params.type}/${$page.params.id}`,
    },
  ]}
/>

{#if component}
  <svelte:component this={component} data={item.data} />
{:else}
  <pre>{JSON.stringify(item.data, null, 2)}</pre>
{/if}
