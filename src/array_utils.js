'use strict';

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 * stolen from http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 */
function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
  return a;
}

/**
 * Selects an item from an array
 * @author @pentaphobe
 * @param  {Array} arr an array to select a single item from
 * @return {Any}     the item
 */
function select(arr) {
  const idx = ~~(Math.random() * arr.length);
  
  return arr.length > 0 ? arr[idx] : undefined;
}

/**
 * Selects N items from the passed array
 * @param  {Array} arr  array of items
 * @param  {Number} n   number of items to select
 * @return {Array}     a new array containing the items
 */
function selectN(arr, n) {
  return shuffle(arr.slice()).filter( (v, count) => count < n);
}


module.exports = {
  shuffle,
  select,
  selectN
};