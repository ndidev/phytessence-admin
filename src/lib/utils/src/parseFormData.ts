/**
 * Transforme des données de formulaire en format exploitable.
 *
 *
 * @param formData Données brutes du formulaire
 * @param format   Format de sortie des données
 */
export function parseFormData<T>(formData: FormData, format?: "json"): T;
export function parseFormData<T>(
  formData: FormData,
  format: "json" = "json"
): T {
  switch (format) {
    case "json":
      return _parseToJson<T>(formData);

    default:
      return _parseToJson<T>(formData);
  }
}

/**
 * Transforme des données brutes de formulaire en format JSON.
 *
 * @see https://github.com/pablo-abc/felte/blob/main/packages/common/src/utils/update.ts
 */
function _parseToJson<T>(formData: FormData): T {
  const data = {} as Record<any, any>;

  for (const [field, value] of formData.entries()) {
    _update(data, field, value);
  }

  return data;

  function _update(
    obj: typeof data,
    path: string | string[],
    value: any,
    clone = false
  ) {
    if (clone && obj) {
      obj = structuredClone(obj);
    }

    const splitPath = !Array.isArray(path)
      ? path.match(/[^.[\]]+/g) || []
      : path;
    const lastSection = splitPath[splitPath.length - 1];
    if (!lastSection) return obj;

    let property: any = obj;
    for (let i = 0; i < splitPath.length - 1; i++) {
      const section = splitPath[i];
      if (
        !property[section] ||
        (!_isPlainObject(property[section]) &&
          !Array.isArray(property[section]))
      ) {
        const nextSection = splitPath[i + 1];
        if (isNaN(Number(nextSection))) {
          property[section] = {};
        } else {
          property[section] = [];
        }
      }
      property = property[section];
    }

    property[lastSection] = value;

    return obj;
  }
}

function _isPlainObject(value: any) {
  return Object.prototype.toString.call(value) === "[object Object]";
}
