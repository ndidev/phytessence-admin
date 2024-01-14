<script lang="ts">
  import { SlideToggle } from "@skeletonlabs/skeleton";

  export let label = "";
  export let name = "";
  export let checked = false;
  export let disabled: boolean | null | undefined = false;
</script>

<label class="label">
  <span>{label}</span>
  <SlideToggle {name} bind:checked size="sm" {disabled} />
</label>
