<script lang="ts">
  import { PageHeader } from "$lib/components";
</script>

<PageHeader
  title="Contacts"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Contacts", link: "/contacts" },
  ]}
/>

<p>
  <a href="/contacts/suppliers">Annuaire fournisseurs</a>
</p>

<p>
  <a href="/contacts/customers">Annuaire clients</a>
</p>
