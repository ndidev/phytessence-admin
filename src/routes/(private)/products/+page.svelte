<script lang="ts">
  import { PageHeader } from "$lib/components";
</script>

<PageHeader
  title="Produits"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Produits", link: "/products" },
  ]}
/>

<p>
  <a href="/products/plants">Plantes</a>
</p>

<p>
  <a href="/products/recipes">Recettes</a>
</p>
