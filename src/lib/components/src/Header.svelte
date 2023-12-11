<script lang="ts">
  import { AppBar } from "@skeletonlabs/skeleton";

  import { UserCard } from "$lib/components";

  export let titleOnly = false;
</script>

<AppBar
  gridColumns="grid-cols-[auto_1fr_auto]"
  slotDefault="place-self-center"
  slotTrail="place-self-end"
  class="shadow-xl"
>
  <svelte:fragment slot="lead">
    {#if !titleOnly}
      <button
        class="material-symbols-outlined"
        title="Revenir en arrière"
        on:click={() => {
          window.history.back();
        }}>arrow_back</button
      >
    {/if}
  </svelte:fragment>

  <span class="text-3xl">Phyt'Essence Admin</span>

  <svelte:fragment slot="trail">
    {#if !titleOnly}
      <a href="/settings"
        ><span class="material-symbols-outlined text-3xl" title="Paramètres"
          >settings</span
        ></a
      >

      <UserCard />
    {/if}
  </svelte:fragment>
</AppBar>
