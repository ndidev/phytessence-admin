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

  const supplierName =
    suppliers.find(({ id }) => id === order.supplierId)?.name ||
    "Fournisseur inconnu";

  const formattedOrderDate = new DateUtils(order.orderDate).format();
  const formattedDeliveryDate = order.deliveryDate
    ? new DateUtils(order.deliveryDate).format()
    : null;
</script>

<PageHeader
  title="Commande fournisseur"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Commandes", link: "/orders" },
    { label: "Commandes fournisseurs", link: "/orders/suppliers" },
    {
      label: supplierName + " (" + formattedOrderDate.short + ")",
      link: `/orders/suppliers/${$page.params.id || "new"}`,
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
  href="/orders/suppliers/new/edit?copy={$page.params.id}"
  title="Copier la commande"
  class="btn variant-outline-secondary">Copier la commande</a
>

<!-- Fournisseur -->
<div class="h3 mb-2 mt-4">
  {supplierName}
</div>

<!-- Date de commande -->
<div>
  Date de commande : <span>{formattedOrderDate.long}</span>
</div>

<!-- Date de livraison -->
<div>
  Date de livraison : <span>{formattedDeliveryDate?.long || "N/C"}</span>
</div>

<!-- Référence fournisseur -->
<div>
  Référence fournisseur : <span>{order.supplierReference || "(vide)"}</span>
</div>

<!-- Commentaires -->
<div class="h5 mt-2">Commentaires</div>
<div class="card p-2">
  {@html order.comments.replace(/(?:\r\n|\r|\n)/g, "<br>") ||
    "(aucun commentaire)"}
</div>

<!-- Contenu de la commande -->
<div>
  <div class="h5 my-2">Contenu de la commande</div>

  {#each order.contents as contents}
    <ContentsLine {contents} />
  {:else}
    <div class="card p-2 mt-2">La commande est vide</div>
  {/each}
</div>
