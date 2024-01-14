<script lang="ts">
  import { getContext } from "svelte";
  import { TabGroup, Tab } from "@skeletonlabs/skeleton";

  import { PageHeader } from "$lib/components";

  import ImportPanel from "./ImportPanel.svelte";
  import BagTypesPanel from "./BagTypesPanel.svelte";
  import DistributionChannelPannel from "./DistributionChannelPannel.svelte";

  let panel = BagTypesPanel;

  $: user = getContext<User>("user");
</script>

<PageHeader
  title="Paramètres"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Paramètres", link: "/seetings" },
  ]}
/>

<TabGroup>
  <Tab bind:group={panel} name="bagTypes" value={BagTypesPanel}>
    <span class="material-symbols-outlined">shopping_bag</span>
    <span>Types de sachet</span>
  </Tab>
  <Tab
    bind:group={panel}
    name="distributionChannels"
    value={DistributionChannelPannel}
  >
    <span class="material-symbols-outlined">store</span>
    <span>Canaux de distribution</span>
  </Tab>
  {#if user.super}
    <Tab bind:group={panel} name="import" value={ImportPanel}>
      <span class="material-symbols-outlined">upload</span>
      <span>Importer les données</span>
    </Tab>
  {/if}

  <!-- Panels -->
  <svelte:component this={panel} slot="panel" />
</TabGroup>
