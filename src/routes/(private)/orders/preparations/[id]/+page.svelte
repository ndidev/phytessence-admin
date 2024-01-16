<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { setContext } from "svelte";

  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { PageHeader } from "$lib/components";

  import BagContents from "./BagContents.svelte";

  if ($page.params.id === "new") {
    goto("./edit");
  }

  let { bag, plants, batches, bagTypes } = data;

  setContext("plants", plants);
  setContext("batches", batches);
  setContext("bagTypes", bagTypes);
</script>

<PageHeader
  title="Sachet {bag.number}"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Commandes", link: "/orders" },
    { label: "Sachets préparés", link: "/orders/preparations" },
    {
      label: bag.number,
      link: `/orders/preparations/${$page.params.id || "new"}`,
    },
  ]}
/>

<!-- Bouton modifier -->
<a href="./edit" title="Modifier le sachet" class="btn variant-outline-primary"
  >Modifier le sachet</a
>

<!-- Bouton copier -->
<a
  href="/orders/preparations/new/edit?copy={$page.params.id}"
  title="Copier le sachet"
  class="btn variant-outline-secondary">Copier le sachet</a
>

<!-- Type de sachet -->
<div class="my-4">
  Type de sachet : <span
    >{bagTypes.find(({ id }) => id === bag.bagTypeId)?.name ||
      "Non renseigné"}</span
  >
</div>

<div class="mt-2">
  {#each bag.contents as contents}
    <BagContents {contents} />
  {:else}
    <div class="card p-2 mt-2">Le sachet est vide</div>
  {/each}
</div>
