<script lang="ts">
  import { afterUpdate } from "svelte";

  import { pageInfo } from "$lib/utils";

  export let title: PageInfo["title"];
  export let breadcrumbs: PageInfo["breadcrumbs"];

  afterUpdate(() => {
    pageInfo.set({
      title,
      breadcrumbs,
    });
  });
</script>
