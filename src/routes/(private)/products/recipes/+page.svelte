<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { PageHeader, SearchInput } from "$lib/components";
</script>

<PageHeader
  title="Recettes"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Produits", link: "/products" },
    { label: "Recettes", link: "/products/recipes" },
  ]}
/>
