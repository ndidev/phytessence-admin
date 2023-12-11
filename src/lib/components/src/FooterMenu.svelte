<script lang="ts">
  import { TabGroup, TabAnchor } from "@skeletonlabs/skeleton";
</script>

<div id="footer" class="block lg:hidden">
  <TabGroup
    justify="justify-center"
    active="variant-primary-filled"
    hover="hover:variant-soft-primary"
    flex="flex-1 lg:flex-none"
    rounded=""
    border=""
    class="bg-surface-100-800-token w-full"
  >
    <TabAnchor href="/orders">
      <svelte:fragment slot="lead"
        ><span class="material-symbols-outlined">edit_note</span
        ></svelte:fragment
      >
      <span>Commandes</span>
    </TabAnchor>

    <TabAnchor href="/stats">
      <svelte:fragment slot="lead"
        ><span class="material-symbols-outlined">monitoring</span
        ></svelte:fragment
      >
      <span>Statistiques</span>
    </TabAnchor>

    <TabAnchor href="/products">
      <svelte:fragment slot="lead"
        ><span class="material-symbols-outlined">psychiatry</span
        ></svelte:fragment
      >
      <span>Plantes</span>
    </TabAnchor>

    <TabAnchor href="/contacts">
      <svelte:fragment slot="lead"
        ><span class="material-symbols-outlined">import_contacts</span
        ></svelte:fragment
      >
      <span>Contacts</span>
    </TabAnchor>
  </TabGroup>
</div>
