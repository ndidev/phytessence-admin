<script lang="ts">
  import { PageHeader } from "$lib/components";
</script>

<PageHeader
  title="Commandes"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Commandes", link: "/orders" },
  ]}
/>

<nav class="list-nav">
  <ul>
    <li>
      <a href="/orders/suppliers">
        <span class="badge bg-primary-50 material-symbols-outlined"
          >arrow_forward</span
        >
        <span class="flex-auto">Commandes fournisseurs</span>
      </a>
    </li>
    <li>
      <a href="/orders/customers">
        <span class="badge bg-primary-50 material-symbols-outlined"
          >arrow_forward</span
        >
        <span class="flex-auto">Commandes clients</span>
      </a>
    </li>
  </ul>
</nav>
