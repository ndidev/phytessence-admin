<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { setContext } from "svelte";

  import ContentsLine from "./ContentsLine.svelte";

  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { PageHeader } from "$lib/components";
  import { DateUtils } from "$lib/utils";

  if ($page.params.id === "new") {
    goto("./edit");
  }

  let { order, suppliers, plants } = data;

  setContext("plants", plants);

  const formattedOrderDate = order.orderDate
    ? new DateUtils(order.orderDate).toLongLocaleDateString()
    : "N/C";

  const formattedDeliveryDate = order.deliveryDate
    ? new DateUtils(order.deliveryDate).toLongLocaleDateString()
    : "N/C";
</script>

<PageHeader
  title="Commande fournisseur"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Commandes", link: "/orders" },
    { label: "Commandes fournisseurs", link: "/orders/suppliers" },
    {
      label: "Commande fournisseur",
      link: `/orders/suppliers/${$page.params.id || "new"}`,
    },
  ]}
/>

<!-- Bouton modifier -->
<a
  href="./edit"
  title="Modifier la commande"
  class="btn variant-outline-secondary">Modifier la commande</a
>

<!-- Fournisseur -->
<div class="h3 mb-2 mt-4">
  {suppliers.find(({ id }) => id === order.supplierId)?.name ||
    "Fournisseur inconnu"}
</div>

<!-- Date de commande -->
<div>
  Date de commande : <span>{formattedOrderDate}</span>
</div>

<!-- Date de livraison -->
<div>
  Date de livraison : <span>{formattedDeliveryDate}</span>
</div>

<!-- Référence fournisseur -->
<div>
  Référence fournisseur : <span>{order.supplierReference}</span>
</div>

<!-- Commentaires -->
<div>Commentaires</div>
<div>{order.comments || "(aucun commentaire)"}</div>

<!-- Contenu de la commande -->
<div>
  <div class="h5 my-2">Contenu de la commande</div>

  {#each order.contents as contents, i (i)}
    <ContentsLine {contents} />
  {:else}
    <div class="card p-2 mt-2">La commande est vide</div>
  {/each}
</div>
