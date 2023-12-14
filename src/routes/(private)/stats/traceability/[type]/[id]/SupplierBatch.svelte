<script lang="ts">
  type Data = {
    plants: {
      name: Plant["name"];
      unit: Plant["unit"];
      suppliers: {
        name: Supplier["name"];
        orders: {
          orderDate: SupplierOrder["orderDate"];
          batches: {
            number: Batch["batchNumberPhytessence"];
            customers: {
              name: Customer["name"];
              orders: {
                orderDate: CustomerOrder["orderDate"];
                bags: {
                  number: CustomerOrderBag["number"];
                  quantity: Quantity;
                }[];
              }[];
            }[];
          }[];
        }[];
      }[];
    }[];
  };

  /**
   * Plante[] (nom)
   *  Fournisseurs[] (nom)
   *    Commandes[] (date)
   *      Lot Phyt'Essence[] (n° de lot)
   *        Clients[] (nom)                       <---------------------
   *        Commandes clients[] (date)            <-- == Composant Batch
   *          Sachet[] (n° de sachet + quantité)  <---------------------
   *
   */

  export let data: Data;
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>
