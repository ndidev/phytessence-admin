<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { setContext } from "svelte";

  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { PageHeader } from "$lib/components";

  import Bag from "./Bag.svelte";

  if ($page.params.id === "new") {
    goto("./edit");
  }

  let { recipe, plants, bagTypes } = data;

  setContext("plants", plants);
  setContext("bagTypes", bagTypes);
</script>

<PageHeader
  title={recipe.name || "Nouvelle recette"}
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Produits", link: "/products" },
    { label: "Recettes", link: "/products/recipes" },
    {
      label: recipe.name || "Nouvelle recette",
      link: `/products/recipes/${$page.params.id || "new"}`,
    },
  ]}
/>

<!-- Bouton modifier -->
<a href="./edit" title="Modifier la recette" class="btn variant-outline-primary"
  >Modifier la recette</a
>

<!-- Bouton copier -->
<a
  href="/products/recipes/new/edit?copy={$page.params.id}"
  title="Copier la recette"
  class="btn variant-outline-secondary">Copier la recette</a
>

<!-- Nom -->
<div class="h3 mb-2 mt-4">
  {recipe.name}
</div>

<!-- Commentaires -->
<div>Description</div>
<div>
  {@html recipe.description.replace(/(?:\r\n|\r|\n)/g, "<br>") ||
    "(description vide)"}
</div>

<!-- Contenu de la recette -->
<div>
  <div class="h5 my-2">Contenu de la recette</div>

  {#each recipe.bags as bag}
    <div>
      <Bag {bag} />
    </div>
  {:else}
    <div class="card p-2 mt-2">La recette est vide</div>
  {/each}
</div>
