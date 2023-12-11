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

<p>
  <a href="/orders/suppliers">Commandes fournisseurs</a>
</p>

<p>
  <a href="/orders/customers">Commandes clients</a>
</p>
