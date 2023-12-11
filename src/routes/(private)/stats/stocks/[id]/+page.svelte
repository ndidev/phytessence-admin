<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  const { plant, details } = data;

  import { page } from "$app/stores";
  import { PageHeader } from "$lib/components";
  import { formatQuantity } from "$lib/utils";
</script>

<PageHeader
  title={"Stocks " + plant.name}
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Statistiques", link: "/stats" },
    { label: "Stocks", link: "/stats/stocks" },
    { label: plant.name, link: `/stats/stocks/${$page.params.id}` },
  ]}
/>

<div class="card my-2 p-4">
  <h3 class="h3">Total</h3>
  <div>
    Entrant : {formatQuantity(plant.inwards, plant.unit)}
    {#if plant.expected > 0}
      (+{formatQuantity(plant.expected, plant.unit)} en attente)
    {/if}
  </div>
  <div>Sortant : {formatQuantity(plant.outwards, plant.unit)}</div>
  <div>
    Restant : {formatQuantity(plant.inwards - plant.outwards, plant.unit)}
  </div>
</div>

<div class="card my-2 p-4">
  <h3 class="h3">Entrant</h3>
  <!-- En attente -->
  <div>En attente : {formatQuantity(plant.expected, plant.unit)}</div>

  <!-- Livré -->
  {#each details.inward as line}
    <div>
      {line.deliveryDate} :
      <a href="/stats/traceability/batch/{line.batchId}"
        >{line.batchNumberPhytessence}</a
      >
      {#if line.batchNumberSupplier}
        (<a
          href="/stats/traceability/sb/{encodeURIComponent(
            line.batchNumberSupplier
          )}">{line.batchNumberSupplier}</a
        >)
      {:else}
        (lot fournisseur non renseigné)
      {/if}
      - {formatQuantity(line.quantity, plant.unit)}
    </div>
  {:else}
    <div>Aucune entrée trouvée</div>
  {/each}
</div>

<div class="card my-2 p-4">
  <h3 class="h3">Sortant</h3>

  {#each details.outward as line}
    <div>
      {line.orderDate} :
      <a href="/stats/traceability/batch/{line.batchId}"
        >{line.batchNumberPhytessence}</a
      >
      (<a href="/stats/traceability/bag/{line.bagId}">{line.bagNumber}</a>) - {formatQuantity(
        line.quantity,
        plant.unit
      )}
    </div>
  {:else}
    <div>Aucune sortie trouvée</div>
  {/each}
</div>
