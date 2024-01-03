<script lang="ts">
  import { getModalStore } from "@skeletonlabs/skeleton";

  export let parent: any;

  export let title = "";
  export let onCancel = () => parent.onClose();
  export let onConfirm: (e: MouseEvent | TouchEvent) => void = () =>
    getModalStore().close();
</script>

<div class="card p-4 w-modal shadow-xl space-y-4">
  {#if title}
    <header class="modal-header text-2xl font-bold">{title}</header>
  {/if}

  <slot />

  <footer class="modal-footer flex justify-end space-x-2">
    <button class="btn variant-soft-surface" on:click={onCancel}>Annuler</button
    >
    <button class="btn variant-filled-error" on:click={onConfirm}
      >Confirmer</button
    >
  </footer>
</div>
