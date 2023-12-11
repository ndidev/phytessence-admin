<script lang="ts">
  import "../../app.postcss";

  import { AppShell } from "@skeletonlabs/skeleton";

  import { Header } from "$lib/components";
</script>

<AppShell>
  <svelte:fragment slot="header">
    <Header titleOnly />
  </svelte:fragment>

  <main class="p-4">
    <slot />
  </main>
</AppShell>
