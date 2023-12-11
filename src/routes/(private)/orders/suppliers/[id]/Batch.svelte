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
    N° lot fournisseur : <span>{batch.batchNumberSupplier}</span>
  </div>

  <!-- Numéro de lot Phyt'Essence -->
  <div>
    N° lot Phyt'Essence : <span
      >{batch.phytBatchIsSupplierBatch
        ? "idem"
        : batch.batchNumberPhytessence}</span
    >
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
