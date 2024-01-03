<script lang="ts">
  import "../app.postcss";

  import {
    Modal,
    Toast,
    storePopup,
    initializeStores,
    getToastStore,
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
  import { injectSpeedInsights as vercelSpeedInsight } from "@vercel/speed-insights/sveltekit";

  import { pageInfo, toastStore } from "$lib/utils";

  initializeStores();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
  toastStore.set(getToastStore());

  if (!dev) {
    vercelAnalytics({ mode: dev ? "development" : "production" });
    vercelSpeedInsight();
  }
</script>

<svelte:head>
  <title>{$pageInfo.title ?? "Phyt'essence Admin"}</title>
</svelte:head>

<Modal />
<Toast />

<slot />
