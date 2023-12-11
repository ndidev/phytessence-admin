/**
 * Formatter une quantité avec une unité pour affichage.
 */
export function formatQuantity(
  quantity: number,
  unit: string,
  displayUnit = true
) {
  let options: Intl.NumberFormatOptions = {
    style: displayUnit ? "unit" : "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  };

  switch (unit) {
    case "g":
      options.unit = "gram";
      break;

    case "unit":
      options.style = "decimal";
      options.maximumFractionDigits = 0;
      break;

    case "€":
      options.style = "currency";
      options.currency = "EUR";
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
      break;

    case "%":
      quantity /= 100;
      options.style = "percent";
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
      break;

    default:
      break;
  }

  const formatted = new Intl.NumberFormat("fr-FR", options).format(quantity);

  return formatted;
}
