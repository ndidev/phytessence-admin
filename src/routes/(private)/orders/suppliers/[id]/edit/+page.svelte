<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;

  import { setContext } from "svelte";

  import ContentsLine from "./ContentsLine.svelte";

  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import {
    PageHeader,
    AutocompleteInput,
    DateInput,
    TextInput,
    Textarea,
  } from "$lib/components";
  import { showToastActionResult, createNewId, DateUtils } from "$lib/utils";

  let { order, suppliers, plants } = data;

  setContext("plants", plants);

  // Local
  const isNew = !order.id;
  let submitting = false;

  const supplierName =
    suppliers.find(({ id }) => id === order.supplierId)?.name ||
    "Fournisseur inconnu";

  const formattedOrderDate = new DateUtils(order.orderDate).format();

  function addPlant() {
    order.contents.push({
      id: createNewId(),
      orderId: order.id,
      plantId: "",
      quantity: 0,
      cost: 0,
      vat: 0,
      batches: [],
    });

    order = order;
  }
</script>

<PageHeader
  title={isNew
    ? "Nouvelle commande"
    : supplierName + " (" + formattedOrderDate.short + ")"}
  breadcrumbs={[
    { label: "Accueil", link: "/" },
    { label: "Commandes", link: "/orders" },
    { label: "Commandes fournisseurs", link: "/orders/suppliers" },
    {
      label: isNew
        ? "Nouvelle commande"
        : supplierName + " (" + formattedOrderDate.short + ")",
      link: `/orders/suppliers/${$page.params.id || "new"}`,
    },
    {
      label: isNew ? "Création" : "Modification",
      link: `/orders/suppliers/${$page.params.id || "new"}/edit`,
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

      showToastActionResult(result, "/orders/suppliers/" + id);
    };
  }}
  class="grid gap-2 md:gap-4"
>
  <!-- Fournisseur -->
  <AutocompleteInput
    label="Fournisseur"
    name="supplierId"
    data={suppliers}
    bind:value={order.supplierId}
    required
  />

  <fieldset class="grid md:grid-cols-2 gap-2 md:gap-4">
    <!-- Date de commande -->
    <DateInput
      label="Date de commande"
      name="orderDate"
      value={order.orderDate}
      required
    />

    <!-- Date de livraison -->
    <DateInput
      label="Date de livraison"
      name="deliveryDate"
      value={order.deliveryDate}
    />
  </fieldset>

  <!-- Référence fournisseur -->
  <TextInput
    label="Référence fournisseur"
    name="supplierReference"
    value={order.supplierReference}
  />

  <!-- Commentaires -->
  <Textarea label="Commentaires" name="comments" value={order.comments} />

  <!-- Contenu de la commande -->
  <div>
    <div class="h5 my-2">Contenu de la commande</div>

    {#each order.contents as contents, ci (contents.id)}
      <ContentsLine
        {order}
        {contents}
        {ci}
        on:contentsDeleted={() => (order.contents = order.contents)}
      />
    {:else}
      <div class="card p-2 mt-2">La commande est vide</div>
    {/each}

    <button
      type="button"
      class="btn variant-filled-primary mt-2"
      on:click={addPlant}
      title="Ajouter une plante">Ajouter une plante</button
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
            showToastActionResult(result, "/orders/suppliers/");
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
