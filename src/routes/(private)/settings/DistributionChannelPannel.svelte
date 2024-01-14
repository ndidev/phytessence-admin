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

  let distributionChannels: DistributionChannel[];
  let loading = true;

  let newDistributionChannel = {
    id: 0,
    name: "",
    active: true,
  } satisfies DistributionChannel;

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

  async function getDistributionChannels() {
    loading = true;

    try {
      const response = await fetch("/api/distributionChannels");

      if (!response.ok) {
        throwError("Erreur lors de la récupération des canaux de distribution");
      }

      return (await response.json()) as DistributionChannel[];
    } finally {
      loading = false;
    }
  }

  async function addDistributionChannel() {
    if (!newDistributionChannel.name) {
      throwError("La désignation ne peut pas être vide");
    }

    const response = await fetch("/api/distributionChannels", {
      method: "POST",
      body: JSON.stringify(newDistributionChannel),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throwError("Erreur lors de l'ajout");
    }

    const addedDistributionChannel =
      (await response.json()) as DistributionChannel;

    distributionChannels = [...distributionChannels, addedDistributionChannel];

    newDistributionChannel = { id: 0, name: "", active: true };
  }

  async function updateDistributionChannel(
    distributionChannel: DistributionChannel
  ) {
    const response = await fetch("/api/distributionChannels", {
      method: "PUT",
      body: JSON.stringify(distributionChannel),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throwError("Erreur lors de la mise à jour");
    }

    showToast(`Mise à jour réussie`, "success");
  }

  async function deleteDistributionChannel(
    distributionChannel: DistributionChannel
  ) {
    if (!distributionChannel.id) {
      throwError("L'identifiant est obligatoire");
    }

    modalStore.trigger({
      type: "confirm",
      title: `Suppression du canal de distribution "${distributionChannel.name}"`,
      body:
        `Confirmez-vous la suppression du canal de distribution "${distributionChannel.name}" ?` +
        "<br/>" +
        `Les commandes concernées afficheront "Canal de distribution non renseigné".`,
      response: (confirmed: boolean) => {
        if (confirmed) {
          _actualDelete();
        }
      },
      buttonTextConfirm: "Supprimer",
      buttonTextCancel: "Annuler",
    });

    async function _actualDelete() {
      const response = await fetch("/api/distributionChannels", {
        method: "DELETE",
        body: JSON.stringify({
          id: distributionChannel.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throwError("Erreur lors de la suppression");
      }

      showToast(
        `Le canal de distribution "${distributionChannel.name}" a été supprimé`,
        "success"
      );

      distributionChannels = distributionChannels.filter(
        ({ id }) => distributionChannel.id !== id
      );
    }
  }

  onMount(async () => {
    distributionChannels = await getDistributionChannels();
  });
</script>

<div class="card p-4 mb-4">
  <div class="text-lg mb-2">Ajout d'un canal de distribution</div>
  <TextInput
    placeholder="Désignation"
    bind:value={newDistributionChannel.name}
  />
  <div class="my-2">
    <span>Actif : </span><SlideToggle
      name=""
      size="sm"
      bind:checked={newDistributionChannel.active}
    />
  </div>
  <button
    type="button"
    class="btn variant-filled-success"
    on:click={addDistributionChannel}>Ajouter</button
  >
</div>

{#if loading}
  <div>Chargement...</div>
{:else if distributionChannels}
  <ul>
    {#each distributionChannels as distributionChannel}
      <GenericLine
        item={distributionChannel}
        updateItem={updateDistributionChannel}
        deleteItem={deleteDistributionChannel}
      />
    {:else}
      <li>Aucun canal de distribution enregistré</li>
    {/each}
  </ul>
{:else}
  <div>Erreur lors de la récupération des canaux de distribution.</div>
{/if}
