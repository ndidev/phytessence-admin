<script lang="ts">
  import "../../app.postcss";

  import type { LayoutData } from "./$types";

  export let data: LayoutData;

  import { setContext } from "svelte";

  import { AppShell } from "@skeletonlabs/skeleton";

  import {
    Header,
    Breadcrumbs,
    SidebarMenu,
    FooterMenu,
  } from "$lib/components";

  import { pageInfo } from "$lib/utils";

  setContext("user", data.user);
</script>

<AppShell>
  <svelte:fragment slot="header">
    <Header />
  </svelte:fragment>

  <svelte:fragment slot="sidebarLeft">
    <!-- Caché sur mobile -->
    <SidebarMenu />
  </svelte:fragment>

  <svelte:fragment slot="footer">
    <!-- Caché sur éran large -->
    <FooterMenu />
  </svelte:fragment>

  <svelte:fragment slot="pageHeader">
    <Breadcrumbs />

    <h1 class="h1 p-4">{$pageInfo.title ?? ""}</h1>
  </svelte:fragment>

  <main class="p-4">
    <slot />
  </main>
</AppShell>

<style>
</style>
