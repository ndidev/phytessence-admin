<script lang="ts">
  import { getContext } from "svelte";

  import BagContents from "./BagContents.svelte";

  export let bag: RecipeBag;

  const bagTypes = getContext<BagTypeAutocomplete[]>("bagTypes");
</script>

<div class="card my-2 p-4">
  <div class="mt-2">
    <div class="h6 mt-2">
      Sachet n°{bag.number} ({bagTypes.find(({ id }) => id === bag.bagTypeId)
        ?.name || "Type de sachet non renseigné"}) (quantité : {bag.quantity})
    </div>

    {#each bag.contents as contents}
      <BagContents {contents} />
    {:else}
      <div class="card p-2 mt-2">Le sachet est vide</div>
    {/each}
  </div>
</div>
