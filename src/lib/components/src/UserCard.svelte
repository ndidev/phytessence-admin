<script lang="ts">
  import { getContext } from "svelte";
  import { popup, type PopupSettings } from "@skeletonlabs/skeleton";

  $: user = getContext<User>("user");

  const popupUserCard = {
    event: "click",
    target: "userCard",
    placement: "left",
  } satisfies PopupSettings;
</script>

{#if user}
  <button type="button" use:popup={popupUserCard}>
    <span class="material-symbols-outlined" style:font-size="36px">
      account_circle
    </span>
  </button>

  <div class="card p-4 w-72 shadow-xl" data-popup="userCard">
    <div class="space-y-4">
      <span class="material-symbols-outlined" style:font-size="60px">
        account_circle
      </span>

      <div>
        <p class="font-bold">{user.name}</p>
        <p class="opacity-50">{user.email}</p>
      </div>

      <div>
        <a
          href="/user"
          class="hover:underline"
          title="Modifier les paramètres du compte">Paramètres du compte</a
        >
      </div>

      <form action="/login?/logout" method="POST">
        <button class="btn variant-soft w-full" title="Se déconnecter">
          Se déconnecter
        </button>
      </form>
    </div>

    <div class="arrow bg-surface-100-800-token" />
  </div>
{/if}

<style></style>
