/**
 * Fonctions utilitaires pour les objets Map.
 *
 * Version simplifiée de https://stackoverflow.com/a/56150320
 */

/**
 * Sérialiser un objet Map en objet JSON.
 */
export function jsonify<T extends { id: string | null }>(
  map: Map<T["id"], T>
): string {
  return JSON.stringify(map, (key, value) => {
    if (value instanceof Map) {
      return Array.from(value.values());
    } else {
      return value;
    }
  });
}

/**
 * Dé-sérialiser objet JSON en objet Map.
 */
export function mapify<T extends { id: string | null }>(
  json: string | T[] | null
): Map<T["id"], T> {
  if (!json) {
    return new Map();
  }

  try {
    const obj: T[] = typeof json === "string" ? JSON.parse(json) : json;
    const objWithIds: Iterable<[T["id"], T]> = obj.map((item) => [
      item.id,
      item,
    ]);
    return new Map(objWithIds);
  } catch (error) {
    console.error(error);
    console.debug("error", typeof json, json);
    return new Map();
  }
}
