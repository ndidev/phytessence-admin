/**
 * Rend une chaîne de caractère normalisée
 * et en minuscules de façon à pouvoir la trier/comparer.
 */
export function normalize(string: string) {
  return string
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Compare deux chaînes de caractères
 * en les normalisant pour la comparaison.
 *
 * @see {@link normalize}
 */
export function compareNormalized(a: string, b: string) {
  return normalize(a) === normalize(b);
}
