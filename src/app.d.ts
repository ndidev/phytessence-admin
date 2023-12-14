// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: User | null;
    }
    // interface PageData {}
    // interface Platform {}
  }

  type PageInfo = {
    title: string;
    breadcrumbs: {
      label: string;
      link: string;
    }[];
  };

  type MySQLError = {
    code: string;
    errno: number;
    sql: string;
    sqlState: string;
    sqlMessage: string;
  };

  type User = {
    /**
     * Identifiant unique de l'utilisateur.
     */
    id: string;

    /**
     * Login de l'utilisateur.
     */
    login: string;

    /**
     * Adresse e-mail de l'utilisateur.
     */
    email: string;

    /**
     * Hash du mot de passe de l'utilisateur.
     */
    password?: string;

    /**
     * Nom de l'utilisateur.
     */
    name: string;

    /**
     * Super administrateur.
     */
    super: boolean;
  };

  type ID = string;
  type Quantity = number;
  type DateString = string;

  /** Plante */
  type Plant = {
    /** Identifiant unique de la plante. */
    id: ID;

    /** Nom de la plante. */
    name: string;

    /** Unité de mesure. */
    unit: "g" | "L" | "unit";

    /** Quantité seuil pour afficher une alerte de niveau bas. */
    warningLow: number;

    /** Quantité seuil pour afficher une alerte de niveau critique. */
    warningCritical: number;

    /** Afficher ou non la plante dans les listes de choix. */
    active: boolean;
  };

  /**
   * Recette de plantes.
   *
   * Destiné à compléter plus rapidement des commandes clients.
   */
  type Recipe = {
    /** Identifiant de la recette. */
    id: ID;

    /** Nom de la recette. */
    name: string;

    /** Description de la recette. */
    description: string;

    /** Sachets de la recette. */
    bags: {
      /** Identifiant du sachet. */
      id: ID;
      /** Identifiant de la recete. */
      recipeId: Recipe["id"];
      /** Ordre (position) du sachet. */
      number: number;
      /** Nombre de sachets dans la recette. */
      quantity: Quantity;
      /** Contenu du sachet. */
      contents: {
        /** Identifiant de la ligne de contenu. */
        id: ID;
        /** Identifiant du sachet. */
        bagId: RecipeBag["id"];
        /** Identifiant de la plante. */
        plantId: Required<Plant>["id"];
        /** Quantité. */
        quantity: Quantity;
      }[];
    }[];

    /** Afficher ou non la recette dans les listes de choix. */
    active: boolean;
  };

  type RecipeBag = Recipe["bags"][number];

  /**
   * Client.
   */
  type Customer = {
    /** Identifiant du client. */
    id: ID;

    /** Nom du client. */
    name: string;

    /** `true` si le client est une entreprise. */
    pro: boolean;

    /** Commentaires sur le client. */
    comments: string;

    /** Afficher le client dans les listes de choix. */
    active: boolean;
  };

  /**
   * Fournisseur.
   */
  type Supplier = {
    /** Identifiant du fournisseur. */
    id: ID;

    /** Nom du fournisseur. */
    name: string;

    /** Commentaires sur le fournisseur. */
    comments: string;

    /** Afficher le fournisseur dans les listes de choix. */
    active: boolean;
  };

  /**
   * Commande client.
   */
  type CustomerOrder = {
    /** Identifiant de la commande. */
    id: ID;

    /** Identifiant du client. */
    customerId: Required<Customer>["id"];

    /** Date de la commande. */
    orderDate: DateString;

    /** Sachets de la commande. */
    bags: {
      /** Identifiant du sachet. */
      id: ID;
      /** Identifiant de la commande. */
      orderId: Required<CustomerOrder>["id"];
      /** Numéro du sachet. */
      number: string;
      /** Contenu du sachet. */
      contents: {
        /** Identifiant de la ligne de contenu. */
        id: ID;
        /** Identifiant du sachet. */
        bagId: CustomerOrderBag["id"];
        /** identifiant de la plante. */
        plantId: Required<Plant>["id"];
        /** Quantité. */
        quantity: Quantity;
        /** Numéro de lot Phyt'Essence. */
        batchId: Batch["id"];
      }[];
    }[];

    /** Commentaires. */
    comments: string;
  };

  /**
   * Sachet d'une commande client.
   */
  type CustomerOrderBag = CustomerOrder["bags"][number];

  /**
   * Commande fournisseur.
   */
  type SupplierOrder = {
    /** Identifiant de la commande. */
    id: ID;

    /** Identifiant du fournisseur. */
    supplierId: Required<Supplier>["id"];

    /** Date de la commande. */
    orderDate: DateString;

    /** Date de livraison. */
    deliveryDate: DateString | null;

    /** Référence fournisseur de la commande */
    supplierReference: string | null;

    /** Contenu de la commande. */
    contents: {
      /** Identifiant de la ligne. */
      id: ID;
      /** Identifiant de la commande. */
      orderId: Required<SupplierOrder>["id"];
      /** Identifiant de la plante. */
      plantId: Required<Plant>["id"];
      /** Quantité. */
      quantity: Quantity;
      /** Coût HT. */
      cost: number;
      /** Taux de TVA. */
      vat: number;
      /** Lots (1 lot = 1 n° de lot Phyt'Essence). */
      batches: {
        /** Identifiant de la ligne. */
        id: ID;
        /** Identifiant de la ligne de contenu. */
        suppliersContentsId: SupplierOrder["contents"][number]["id"];
        /** Numéro de lot fournisseur. */
        batchNumberSupplier: string;
        /** Numéro de lot Phyt'Essence. */
        batchNumberPhytessence: string;
        /** Le numéro de lot fournisseur est conservé. */
        phytBatchIsSupplierBatch: boolean;
        /** Date d'expiration. */
        expiryDate: DateString | null;
        /** Quantité de produit pour le numéro de lot. */
        quantity: Quantity;
      }[];
    }[];

    /** Commentaires. */
    comments: string;
  };

  type SupplierOrderContents = SupplierOrder["contents"][number];
  type Batch = SupplierOrderContents["batches"][number];

  type PlantAutocomplete = Required<Pick<Plant, "id" | "name" | "unit">>;
  type SupplierAutocomplete = Required<Pick<Supplier, "id" | "name">>;
  type CustomerAutocomplete = Required<Pick<Customer, "id" | "name">>;

  type PlantBatch = {
    id: Batch["id"];
    batchNumberPhytessence: Batch["batchNumberPhytessence"];
    plantId: Plant["id"];
    name: Plant["name"];
  };
}

export {};
