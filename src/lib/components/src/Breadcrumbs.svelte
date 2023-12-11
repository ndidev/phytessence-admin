<script lang="ts">
  import { pageInfo } from "$lib/utils";
</script>

<ol class="breadcrumb bg-surface-100-800-token p-3">
  {#each $pageInfo.breadcrumbs as crumb, i}
    <!-- If crumb index is less than the breadcrumb length minus 1 -->
    {#if i < $pageInfo.breadcrumbs.length - 1}
      <li class="crumb">
        <a class="anchor" href={crumb.link}>{crumb.label}</a>
      </li>
      <li class="crumb-separator" aria-hidden>&rsaquo;</li>
    {:else}
      <li class="crumb">{crumb.label}</li>
    {/if}
  {/each}
</ol>
