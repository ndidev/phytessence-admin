<script lang="ts">
  import { getContext } from "svelte";
  import { AppBar } from "@skeletonlabs/skeleton";

  import { UserCard } from "$lib/components";

  export let titleOnly = false;

  $: user = getContext<User>("user");
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
        class="material-symbols-outlined text-2xl md:text-3xl"
        title="Revenir en arrière"
        on:click={() => {
          window.history.back();
        }}>arrow_back</button
      >
    {/if}
  </svelte:fragment>

  <span class="text-2xl md:text-3xl"
    ><a href="/" title="Revenir à l'accueil">Phyt'Essence Admin</a></span
  >

  <svelte:fragment slot="trail">
    {#if !titleOnly}
      {#if user.super}
        <a href="/settings"
          ><span
            class="material-symbols-outlined text-2xl md:text-3xl"
            title="Paramètres">settings</span
          ></a
        >
      {/if}

      <UserCard />
    {/if}
  </svelte:fragment>
</AppBar>
