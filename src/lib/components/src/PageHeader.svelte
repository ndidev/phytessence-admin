<script lang="ts">
  import { onMount } from "svelte";

  import { pageInfo } from "$lib/utils";

  export let title: PageInfo["title"];
  export let breadcrumbs: PageInfo["breadcrumbs"];

  onMount(() => {
    pageInfo.set({
      title,
      breadcrumbs,
    });
  });
</script>
