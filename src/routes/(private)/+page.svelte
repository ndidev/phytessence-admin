<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { PageHeader } from "$lib/components";
  import { formatQuantity } from "$lib/utils";

  const { expectedSuppliersOrders, lowStocks } = data;
</script>

<PageHeader title="Accueil" breadcrumbs={[{ label: "Accueil", link: "/" }]} />

<!-- <ul>
  <li>Commandes clients en cours</li>
</ul> -->

<div class="grid gap-4">
  <div class="card p-4">
    <h2 class="h2">Actions rapides</h2>
    <ul>
      <li
        class="card my-2 p-2 rounded-container-token bg-slate-50 hover:underline"
      >
        <a href="/orders/customers/new/edit"
          >Enregistrer une commande client
        </a>
      </li>
      <li
        class="card my-2 p-2 rounded-container-token bg-slate-50 hover:underline"
      >
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
        <li class="card p-2 my-2 rounded-container-token bg-slate-50">
          <a
            href="/orders/suppliers/{order.id}"
            class="underline"
            title="Consulter la commande fournisseur"
          >
            <span>{order.supplierName}</span>
            <span
              >(commande du {new Date(
                order.orderDate
              ).toLocaleDateString()})</span
            >
          </a>
          {#if order.contents.length > 0}
            <ul class="ml-2">
              {#each order.contents as contents}
                <li>
                  <span>{contents.plantName}</span> : {formatQuantity(
                    contents.quantity,
                    contents.unit
                  )}
                </li>
              {/each}
            </ul>
          {:else}
            Aucun contenu dans la commande
          {/if}
        </li>
      {:else}
        <div>Aucune commande fournisseur en attente.</div>
      {/each}
    </ul>
  </div>

  <div class="card p-4">
    <h2 class="h2">Alertes de stock bas</h2>
    <ul>
      {#each lowStocks as stock}
        <li
          class:stock--low={stock.low}
          class:stock--critical={stock.critical}
          class="stock p-2 mb-2"
        >
          <span class="stock__name">{stock.name}</span> :
          <span class="stock__currentStock"
            >{formatQuantity(stock.currentStock, stock.unit)}</span
          >
          {#if stock.expected > 0}
            <span class="stock__expected"
              >(réapprovisionnement en attente : {formatQuantity(
                stock.expected,
                stock.unit
              )})</span
            >
          {:else}
            (aucun réapprovisionnement en attente)
          {/if}
        </li>
      {:else}
        <div>Aucun stock bas.</div>
      {/each}
    </ul>
  </div>
</div>

<style>
  .stock--low {
    @apply bg-warning-400 text-on-warning-token;
  }

  .stock--critical {
    @apply bg-error-500 text-on-error-token;
  }
</style>
