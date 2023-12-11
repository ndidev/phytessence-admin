<script lang="ts">
  import BagContents from "./BagContents.svelte";

  export let bag: Bag;
</script>

<div class="card my-2 p-4">
  <div class="mt-2">
    <div class="h6 mt-2">Sachet n°{bag.number}</div>

    {#each bag.contents as contents, i (i)}
      <BagContents {contents} />
    {:else}
      <div class="card p-2 mt-2">Le sachet est vide</div>
    {/each}
  </div>
</div>
