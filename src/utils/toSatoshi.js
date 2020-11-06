/**
 * return satoshi unit amount
 * @param {String} amount
 * @returns {Number}
 */

export const toSatoshi = (value) => {
  return Math.round(Number(value) * 100000000);
};
