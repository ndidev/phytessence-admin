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

<nav class="list-nav">
  <ul>
    <li>
      <a href="/products/plants">
        <span class="badge bg-primary-50 material-symbols-outlined"
          >arrow_forward</span
        >
        <span class="flex-auto">Plantes</span>
      </a>
    </li>
    <li>
      <a href="/products/recipes">
        <span class="badge bg-primary-50 material-symbols-outlined"
          >arrow_forward</span
        >
        <span class="flex-auto">Recettes</span>
      </a>
    </li>
  </ul>
</nav>
