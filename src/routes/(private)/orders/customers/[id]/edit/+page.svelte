<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { setContext } from "svelte";

  import Bag from "./Bag.svelte";

  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import {
    PageHeader,
    AutocompleteInput,
    DateInput,
    Textarea,
    ConfirmModal,
  } from "$lib/components";
  import {
    showToastActionResult,
    createNewId,
    isNewId,
    modalStore,
  } from "$lib/utils";

  let { order, customers, plants, batches, lastbagNumber } = data;

  setContext("plants", plants);
  setContext("batches", batches);

  const isNew = !order.id;
  let submitting = false;

  function addBag() {
    order.bags.push({
      id: createNewId(),
      orderId: order.id,
      number: "~" + String(++lastbagNumber), // "~" = numéro temporaire
      contents: [],
    });

    order = order;
  }

  function deleteBag(bagId: Bag["id"]) {
    if (isNewId(bagId)) {
      _actualDelete();
    }

    if (!isNewId(bagId)) {
      $modalStore.trigger({
        type: "component",
        component: {
          ref: ConfirmModal,
          props: {
            title: "Supprimer le sachet",
            onConfirm: () => {
              _actualDelete();
              $modalStore.clear();
            },
            onCancel: () => {
              $modalStore.close();
            },
          },
          slot: "<p>Confirmez-vous la suppression de ce sachet de la commande ?</p>",
        },
      });
    }

    function _actualDelete() {
      order.bags = order.bags.filter(({ id }) => id !== bagId);
    }
  }
</script>

<PageHeader
  title={isNew ? "Nouvelle commande" : "Commande client"}
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Commandes", link: "/orders" },
    { label: "Commandes clients", link: "/orders/customers" },
    {
      label: isNew ? "Nouvelle commande" : "Commande client",
      link: `/orders/customers/${$page.params.id || "new"}`,
    },
    {
      label: isNew ? "Création" : "Modification",
      link: `/orders/customers/${$page.params.id || "new"}/edit`,
    },
  ]}
/>

<form
  method="POST"
  action={isNew ? "?/create" : "?/update"}
  use:enhance={() => {
    submitting = true;

    return async ({ result }) => {
      submitting = false;

      let id = $page.params.id;

      if (result.type === "success") {
        id = isNew ? String(result.data?.orderId) : $page.params.id;
      }

      showToastActionResult(result, "/orders/customers/" + id);
    };
  }}
>
  <!-- Client -->
  <AutocompleteInput
    label="Client"
    name="customerId"
    data={customers}
    bind:value={order.customerId}
    required
  />

  <!-- Date de commande -->
  <DateInput
    label="Date de commande"
    name="orderDate"
    value={order.orderDate}
    required
  />

  <!-- Commentaires -->
  <Textarea label="Commentaires" name="comments" value={order.comments} />

  <!-- Sachets de la commande -->
  <div>
    <div class="h5 my-2">Sachets de la commande</div>

    {#each order.bags as bag, bi (bi)}
      <Bag {bag} {bi} on:click={() => deleteBag(bag.id)} />
    {:else}
      <div class="card p-2 mt-2">La commande est vide</div>
    {/each}

    <button
      type="button"
      class="btn variant-filled-primary mt-2"
      on:click={addBag}
      title="Ajouter un sachet">Ajouter un sachet</button
    >
  </div>

  <!-- Boutons -->
  <div class="mt-4 flex gap-4 flex-wrap">
    <button
      type="submit"
      class="btn variant-filled-success"
      disabled={submitting}
      >{isNew ? "Enregistrer la commande" : "Valider les modifications"}</button
    >
    {#if !isNew}
      <form
        method="POST"
        action="?/delete"
        use:enhance={() => {
          submitting = true;

          return async ({ result }) => {
            submitting = false;
            showToastActionResult(result, "/orders/customers/");
          };
        }}
      >
        <button
          class="btn variant-ghost-error"
          on:click={(e) => {
            confirm("Confirmer la suppression ?") || e.preventDefault();
          }}
          disabled={submitting}>Supprimer la commande</button
        >
      </form>
    {/if}
  </div>
</form>
