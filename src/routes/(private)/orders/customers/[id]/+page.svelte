<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { setContext } from "svelte";

  import Bag from "./Bag.svelte";

  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { PageHeader } from "$lib/components";
  import { DateUtils } from "$lib/utils";

  if ($page.params.id === "new") {
    goto("./edit");
  }

  let { order, customers, plants, batches } = data;

  setContext("plants", plants);
  setContext("batches", batches);

  const formattedOrderDate = order.orderDate
    ? new DateUtils(order.orderDate).toLongLocaleDateString()
    : "N/C";
</script>

<PageHeader
  title={"Commande client"}
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Commandes", link: "/orders" },
    { label: "Commandes clients", link: "/orders/customers" },
    {
      label: "Commande client",
      link: `/orders/customers/${$page.params.id || "new"}`,
    },
  ]}
/>

<!-- Bouton modifier -->
<a
  href="./edit"
  title="Modifier la commande"
  class="btn variant-outline-secondary">Modifier la commande</a
>

<!-- Client -->
<div class="h3 mb-2 mt-4">
  {customers.find(({ id }) => id === order.customerId)?.name ||
    "Client inconnu"}
</div>

<!-- Date de commande -->
<div>
  Date de commande : <span>{formattedOrderDate}</span>
</div>

<!-- Commentaires -->
<div>Commentaires</div>
<div>{order.comments || "(aucun commentaire)"}</div>

<!-- Sachets de la commande -->
<div>
  <div class="h5 my-2">Sachets de la commande</div>

  {#each order.bags as bag, i (i)}
    <Bag {bag} />
  {:else}
    <div class="card p-2 mt-2">La commande est vide</div>
  {/each}
</div>
