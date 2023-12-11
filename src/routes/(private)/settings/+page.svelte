<script lang="ts">
  import { PageHeader } from "$lib/components";
  import { enhance } from "$app/forms";
  import { getToastStore } from "@skeletonlabs/skeleton";
  import type { ActionResult } from "@sveltejs/kit";

  const toastStore = getToastStore();

  function showToast(result: ActionResult) {
    if (result.type === "success") {
      toastStore.trigger({
        message: String(result.data?.message),
        timeout: 3 * 1000,
        background: "variant-filled-success",
      });
    }

    if (result.type === "failure") {
      toastStore.trigger({
        message: String(result.data?.message || "Erreur"),
        timeout: 3 * 1000,
        background: "variant-filled-error",
      });
    }
  }

  let suppliersOrdersFileInput: HTMLInputElement;
  let customersFileInput: HTMLInputElement;

  let deleteDataSubmitting = false;
  let importSuppliersOrdersSubmitting = false;
  let importCustomersSubmitting = false;
</script>

<PageHeader
  title="Paramètres"
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Paramètres", link: "/seetings" },
  ]}
/>

<div class="grid gap-4">
  <!-- Importer les clients -->
  <div class="card">
    <header class="card-header">Importer des clients</header>
    <div class="flex p-4">
      <form
        method="POST"
        action="?/importCustomers"
        enctype="multipart/form-data"
        class="flex ml-2 gap-2"
        use:enhance={() => {
          importCustomersSubmitting = true;
          return ({ result }) => {
            showToast(result);
            importCustomersSubmitting = false;
            customersFileInput.value = "";
          };
        }}
      >
        <input
          bind:this={customersFileInput}
          type="file"
          name="csvFile"
          accept="text/csv"
          class="input"
          required
        />
        <button
          type="submit"
          class="btn variant-ghost-primary"
          disabled={importCustomersSubmitting}>Importer</button
        >
      </form>
    </div>
  </div>

  <!-- Importer les commandes fournisseurs -->
  <div class="card">
    <header class="card-header">Importer des commandes founisseurs</header>
    <div class="flex p-4">
      <form
        method="POST"
        action="?/importSuppliersOrders"
        enctype="multipart/form-data"
        class="flex ml-2 gap-2"
        use:enhance={() => {
          importSuppliersOrdersSubmitting = true;
          return ({ result }) => {
            showToast(result);
            importSuppliersOrdersSubmitting = false;
            suppliersOrdersFileInput.value = "";
          };
        }}
      >
        <input
          bind:this={suppliersOrdersFileInput}
          type="file"
          name="csvFile"
          accept="text/csv"
          class="input"
          required
        />
        <button
          type="submit"
          class="btn variant-ghost-primary"
          disabled={importSuppliersOrdersSubmitting}>Importer</button
        >
      </form>
    </div>
  </div>

  <!-- Supprimer touts les données -->
  <div class="card">
    <header class="card-header">Supprimer toutes les données</header>
    <div class="flex p-4">
      <form
        method="POST"
        action="?/deleteAllData"
        class="flex ml-2 gap-2"
        use:enhance={() => {
          deleteDataSubmitting = true;
          return ({ result }) => {
            showToast(result);
            deleteDataSubmitting = false;
          };
        }}
      >
        <button
          type="submit"
          class="btn variant-ghost-error"
          disabled={deleteDataSubmitting}>Supprimer les données</button
        >
      </form>
    </div>
  </div>
</div>
