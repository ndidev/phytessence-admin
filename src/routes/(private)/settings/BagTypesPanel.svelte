<script lang="ts">
  import { onMount } from "svelte";
  import {
    getToastStore,
    SlideToggle,
    getModalStore,
  } from "@skeletonlabs/skeleton";

  import GenericLine from "./GenericLine.svelte";

  import { TextInput } from "$lib/components";

  const toastStore = getToastStore();
  const modalStore = getModalStore();

  let bagTypes: BagType[];
  let loading = true;

  let newBagType = {
    id: 0,
    name: "",
    active: true,
  } satisfies BagType;

  function showToast(message: string, type: "success" | "error") {
    toastStore.trigger({
      message,
      timeout: 3 * 1000,
      background:
        type === "success" ? "variant-filled-success" : "variant-filled-error",
    });
  }

  function throwError(message: string) {
    showToast(message, "error");

    throw new Error(message);
  }

  async function getBagTypes() {
    loading = true;

    try {
      const response = await fetch("/api/bagTypes");

      if (!response.ok) {
        throwError("Erreur lors de la récupération des types de sachet");
      }

      return (await response.json()) as BagType[];
    } finally {
      loading = false;
    }
  }

  async function addBagType() {
    if (!newBagType.name) {
      throwError("La désignation ne peut pas être vide");
    }

    const response = await fetch("/api/bagTypes", {
      method: "POST",
      body: JSON.stringify(newBagType),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throwError("Erreur lors de l'ajout");
    }

    const addedBagType = (await response.json()) as BagType;

    bagTypes = [...bagTypes, addedBagType];

    newBagType = { id: 0, name: "", active: true };
  }

  async function updateBagType(bagType: BagType) {
    const response = await fetch("/api/bagTypes", {
      method: "PUT",
      body: JSON.stringify(bagType),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throwError("Erreur lors de la mise à jour");
    }

    showToast(`Mise à jour réussie`, "success");
  }

  async function deleteBagType(bagType: BagType) {
    if (!bagType.id) {
      throwError("L'identifiant est obligatoire");
    }

    modalStore.trigger({
      type: "confirm",
      title: `Suppression du type de sachet "${bagType.name}"`,
      body:
        `Confirmez-vous la suppression du type de sachet "${bagType.name}" ?` +
        "<br/>" +
        `Les sachets concernés apparaîtront comme "Type de sachet non renseigné".`,
      response: (confirmed: boolean) => {
        if (confirmed) {
          _actualDelete();
        }
      },
      buttonTextConfirm: "Supprimer",
      buttonTextCancel: "Annuler",
    });

    async function _actualDelete() {
      const response = await fetch("/api/bagTypes", {
        method: "DELETE",
        body: JSON.stringify({
          id: bagType.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throwError("Erreur lors de la suppression");
      }

      showToast(
        `Le type de sachet "${bagType.name}" a été supprimé`,
        "success"
      );

      bagTypes = bagTypes.filter(({ id }) => bagType.id !== id);
    }
  }

  onMount(async () => {
    bagTypes = await getBagTypes();
  });
</script>

<div class="card p-4 mb-4">
  <div class="text-lg mb-2">Ajout d'un type de sachet</div>
  <TextInput placeholder="Désignation" bind:value={newBagType.name} />
  <div class="my-2">
    <span>Actif : </span><SlideToggle
      name=""
      size="sm"
      bind:checked={newBagType.active}
    />
  </div>
  <button type="button" class="btn variant-filled-success" on:click={addBagType}
    >Ajouter</button
  >
</div>

{#if loading}
  <div>Chargement...</div>
{:else if bagTypes}
  <ul>
    {#each bagTypes as bagType}
      <GenericLine
        item={bagType}
        updateItem={updateBagType}
        deleteItem={deleteBagType}
      />
    {:else}
      <li>Aucun type de sachet enregistré</li>
    {/each}
  </ul>
{:else}
  <div>Erreur lors de la récupération des types de sachet.</div>
{/if}
