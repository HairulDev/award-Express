/**
 * Convert pascalCase to under_score
 *
 * @param {Object} obj
 * @returns
 */
const toUnderScore = (obj) => {
  const entries = Object.entries(obj);

  return Object.fromEntries(
    entries.map(([key, value]) => {
      key = key
        .replace(/\.?([A-Z]+)/g, "_$1")
        .toLowerCase()
        .replace(/^_/, "");
      return [key.toLowerCase(), value];
    })
  );
};

/**
 * Convert case to under_score
 *
 * @param {Object} obj
 * @returns
 */
const toLowerKeys = (obj) => {
  const entries = Object.entries(obj);

  return Object.fromEntries(
    entries.map(([key, value]) => {
      return [key.toLowerCase(), value];
    })
  );
};

module.exports = { toLowerKeys, toUnderScore };
