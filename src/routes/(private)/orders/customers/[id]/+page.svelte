<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { setContext } from "svelte";

  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { PageHeader } from "$lib/components";
  import { DateUtils, formatQuantity } from "$lib/utils";

  import Bag from "./Bag.svelte";

  if ($page.params.id === "new") {
    goto("./edit");
  }

  let { order, customers, plants, batches, distributionChannels, bagTypes } =
    data;

  setContext("plants", plants);
  setContext("batches", batches);
  setContext("bagTypes", bagTypes);

  const customerName =
    customers.find(({ id }) => id === order.customerId)?.name ||
    "Client inconnu";

  const formattedOrderDate = new DateUtils(order.orderDate).format();

  const plantsCost: number = order.bags
    .map(({ contents }) =>
      contents.map((contents) => {
        const batch = batches.find(({ id }) => id === contents.batchId);
        const cost = batch?.cost || NaN;
        const vat = batch?.vat || NaN;

        return contents.quantity * (cost / 1000) * (1 + vat / 100);
      })
    )
    .flat(2)
    .reduce((prev, sum) => prev + sum, 0);
</script>

<PageHeader
  title="Commande client"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Commandes", link: "/orders" },
    { label: "Commandes clients", link: "/orders/customers" },
    {
      label: customerName + " (" + formattedOrderDate.short + ")",
      link: `/orders/customers/${$page.params.id || "new"}`,
    },
  ]}
/>

<!-- Bouton modifier -->
<a
  href="./edit"
  title="Modifier la commande"
  class="btn variant-outline-primary">Modifier la commande</a
>

<!-- Bouton copier -->
<a
  href="/orders/customers/new/edit?copy={$page.params.id}"
  title="Copier la commande"
  class="btn variant-outline-secondary">Copier la commande</a
>

<!-- Client -->
<div class="h3 mb-2 mt-4">
  {customerName}
</div>

<!-- Date de commande -->
<div>
  Date de commande : <span>{formattedOrderDate.long}</span>
</div>

<!-- Canal de distribution -->
<div>
  Canal de distribution : <span
    >{distributionChannels.find(({ id }) => id === order.distributionChannelId)
      ?.name || "Non renseigné"}</span
  >
</div>

<div class="my-2">
  <!-- Coût des plantes -->
  <div>
    Coût des plantes (TTC) : <span>{formatQuantity(plantsCost, "€")}</span>
  </div>

  <!-- Coût des fournitures -->
  <div>
    Coût des fournitures : <span>{formatQuantity(order.suppliesCost, "€")}</span
    >
  </div>

  <!-- Coût de la main d'oeuvre -->
  <div>
    Coût de la main d'oeuvre : <span
      >{formatQuantity(order.workforceCost, "€")}</span
    >
  </div>

  <!-- Prix de vente -->
  <div>
    Prix de vente (TTC) : <span>{formatQuantity(order.sellingPrice, "€")}</span>
  </div>

  <!-- Marge -->
  <div>
    Marge : <span
      >{formatQuantity(
        order.sellingPrice -
          plantsCost -
          order.workforceCost -
          order.suppliesCost,
        "€"
      )}</span
    >
  </div>
</div>

<!-- Commentaires -->
<div class="h5 mt-2">Commentaires</div>
<div class="card p-2">
  {@html order.comments.replace(/(?:\r\n|\r|\n)/g, "<br>") ||
    "(aucun commentaire)"}
</div>

<!-- Sachets de la commande -->
<div>
  <div class="h5 my-2">Sachets de la commande</div>

  {#each order.bags as bag}
    <Bag {bag} />
  {:else}
    <div class="card p-2 mt-2">La commande est vide</div>
  {/each}
</div>
