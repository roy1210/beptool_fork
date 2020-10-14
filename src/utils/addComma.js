import { string } from 'is_js';
/**
 * return string with add comma
 * @param {Number} price
 * @param {Number} decimal
 * @returns {String}  string with add comma
 */

export const addComma = (price, decimal) => {
  if (999 > price) {
    return price.toFixed(decimal);
  }
  return price.toFixed(decimal).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
};
