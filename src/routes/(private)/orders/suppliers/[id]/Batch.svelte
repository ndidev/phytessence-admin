<script lang="ts">
  import { DateUtils, formatQuantity } from "$lib/utils";

  export let batch: Batch;
  export let plant: PlantAutocomplete;

  const formattedExpiryDate = batch.expiryDate
    ? new DateUtils(batch.expiryDate).toLongLocaleDateString()
    : "N/C";
</script>

<div class="card mt-2 p-2">
  <!-- Numéro de lot fournisseur -->
  <div>
    N° lot fournisseur : <a
      href="/stats/traceability/sb/{encodeURIComponent(
        batch.batchNumberSupplier
      )}"
      class="underline">{batch.batchNumberSupplier}</a
    >
  </div>

  <!-- Numéro de lot Phyt'Essence -->
  <div>
    N° lot Phyt'Essence :
    {#if batch.phytBatchIsSupplierBatch}
      <a
        href="/stats/traceability/sb/{encodeURIComponent(
          batch.batchNumberSupplier
        )}"
        class="underline">idem</a
      >
    {:else}
      <a href="/stats/traceability/batch/{batch.id}" class="underline"
        >{batch.batchNumberPhytessence}</a
      >
    {/if}
  </div>

  <!-- Quantité -->
  <div>
    Quantité : <span>{formatQuantity(batch.quantity, plant.unit)}</span>
  </div>

  <!-- Date d'expiration -->
  <div>
    Date d'expiration : <span>{formattedExpiryDate}</span>
  </div>
</div>
