<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  const { plant, details } = data;

  import { page } from "$app/stores";
  import { PageHeader } from "$lib/components";
  import { formatQuantity, DateUtils } from "$lib/utils";
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
      {line.deliveryDate} : lot
      <a
        href="/stats/traceability/batch/{line.batchId}"
        class="underline"
        title="Voir les détails du lot Phyt'Essence"
        >{line.batchNumberPhytessence}</a
      >
      {#if line.batchNumberSupplier}
        (<a
          href="/stats/traceability/sb/{encodeURIComponent(
            line.batchNumberSupplier
          )}"
          class="underline"
          title="Voir les détails du lot fournisseur"
          >{line.batchNumberSupplier}</a
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

  <h4 class="h4 ml-2">Sachets préparés</h4>
  <ul class="ml-6">
    {#each details.outward.preparedBags as bag}
      <li>
        lot <a
          href="/stats/traceability/batch/{bag.batchId}"
          class="underline"
          title="Voir les détails du lot Phyt'Essence"
          >{bag.batchNumberPhytessence}</a
        >
        (<a
          href="/stats/traceability/bag/{bag.bagId}"
          class="underline"
          title="Voir les détails du sachet">{bag.bagNumber}</a
        >) - {formatQuantity(bag.quantity, plant.unit)}
      </li>
    {:else}
      <li>Aucun sachet préparé ne contient cette plante</li>
    {/each}
  </ul>

  <ul class="ml-2">
    {#each details.outward?.customers || [] as customer}
      <li class="mt-4">
        <h4 class="h4">{customer?.name || "Client inconnu"}</h4>
        <ul class="ml-2">
          {#each customer?.orders || [] as order}
            <li class="mt-2">Commande du {order?.orderDate}</li>
            <ul class="ml-2">
              {#each order?.bags || [] as bag}
                <li>
                  lot
                  <a
                    href="/stats/traceability/batch/{bag.batchId}"
                    class="underline"
                    title="Voir les détails du lot Phyt'Essence"
                    >{bag.batchNumberPhytessence}</a
                  >
                  (<a
                    href="/stats/traceability/bag/{bag.id}"
                    class="underline"
                    title="Voir les détails du sachet">{bag.number}</a
                  >) - {formatQuantity(bag.quantity, plant.unit)}
                </li>
              {/each}
            </ul>
          {/each}
        </ul>
      </li>
    {:else}
      <li>Aucune sortie trouvée</li>
    {/each}
  </ul>
</div>
