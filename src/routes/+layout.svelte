<script lang="ts">
  import "../app.postcss";

  import {
    Modal,
    getModalStore,
    Toast,
    getToastStore,
    storePopup,
    initializeStores,
  } from "@skeletonlabs/skeleton";

  import {
    computePosition,
    autoUpdate,
    offset,
    shift,
    flip,
    arrow,
  } from "@floating-ui/dom";

  import { dev } from "$app/environment";
  import { inject as vercelAnalytics } from "@vercel/analytics";

  import { pageInfo, modalStore, toastStore } from "$lib/utils";

  initializeStores();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
  modalStore.set(getModalStore());
  toastStore.set(getToastStore());

  vercelAnalytics({ mode: dev ? "development" : "production" });
</script>

<svelte:head>
  <title>{$pageInfo.title ?? "Phyt'essence Admin"}</title>
</svelte:head>

<Modal />
<Toast />

<slot />
