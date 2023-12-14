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

<nav class="list-nav">
  <ul>
    <li>
      <a href="/contacts/suppliers">
        <span class="badge bg-primary-50 material-symbols-outlined"
          >arrow_forward</span
        >
        <span class="flex-auto">Annuaire fournisseurs</span>
      </a>
    </li>
    <li>
      <a href="/contacts/customers">
        <span class="badge bg-primary-50 material-symbols-outlined"
          >arrow_forward</span
        >
        <span class="flex-auto">Annuaire clients</span>
      </a>
    </li>
  </ul>
</nav>
