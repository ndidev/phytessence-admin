<script lang="ts" generics="Item extends SettingsGenericLine">
  export let item: Item;

  export let updateItem: (item: Item) => Promise<void>;

  export let deleteItem: (item: Item) => Promise<void>;

  import { SlideToggle } from "@skeletonlabs/skeleton";

  let editing = false;
  let originalItem = structuredClone(item);
</script>

<li class="card flex items-center p-4 my-2 h-12 border-none">
  <span class:opacity-50={!originalItem.active} hidden={editing}>
    {originalItem.name}
  </span>

  <input
    type="text"
    class="max-w-md py-1 px-2"
    class:input={editing}
    hidden={!editing}
    bind:value={item.name}
  />

  <button
    class="material-symbols-outlined text-lg"
    title="Modifier"
    class:btn={!editing}
    hidden={editing}
    on:click={() => (editing = !editing)}>edit</button
  >

  <div class="items-center gap-4" class:flex={editing} hidden={!editing}>
    <button
      class="btn material-symbols-outlined text-lg px-3"
      title="Valider"
      on:click={async () => {
        try {
          await updateItem(item);
          originalItem = structuredClone(item);
        } finally {
          editing = false;
        }
      }}>done</button
    >
    <button
      class="btn material-symbols-outlined text-lg px-0"
      title="Annuler"
      on:click={() => (editing = false)}>close</button
    >

    <SlideToggle name="" size="sm" bind:checked={item.active} />
    <button
      type="button"
      class="btn btn-sm material-symbols-outlined variant-ghost-error"
      on:click={() => deleteItem(item)}>delete</button
    >
  </div>
</li>
