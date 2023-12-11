<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { PageHeader } from "$lib/components";

  const { expectedSuppliersOrders, lowStocks } = data;
</script>

<PageHeader title="Accueil" breadcrumbs={[{ label: "Accueil", link: "/" }]} />

<ul>
  <li>Commandes clients en cours</li>
</ul>

<div class="grid gap-4">
  <div class="card p-4">
    <h2 class="h2">Actions rapides</h2>
    <ul>
      <li>
        <a href="/orders/customers/new/edit"
          >Enregistrer une commande client
        </a>
      </li>
      <li>
        <a href="/orders/suppliers/new/edit"
          >Enregistrer une commande fournisseur
        </a>
      </li>
    </ul>
  </div>

  <div class="card p-4">
    <h2 class="h2">Commandes fournisseurs en cours</h2>
    <ul>
      {#each expectedSuppliersOrders as order}
        <div></div>
      {:else}
        <div>Aucune commande fournisseur en attente.</div>
      {/each}
    </ul>
  </div>

  <div class="card p-4">
    <h2 class="h2">Alertes de stock bas</h2>
    <ul>
      {#each lowStocks as stock}
        <div></div>
      {:else}
        <div>Aucun stock bas.</div>
      {/each}
    </ul>
  </div>
</div>
