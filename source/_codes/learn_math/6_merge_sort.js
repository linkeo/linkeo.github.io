function mergeSort(array) {
  if (array.length < 2) {
    return array;
  }
  const middle = Math.floor(array.length / 2);
  const left = mergeSort(array.slice(0, middle));
  const right = mergeSort(array.slice(middle));
  return merge(left, right);
}

function merge(a, b) {
  const c = [];
  let ia = 0;
  let ib = 0;
  while (ia < a.length && ib < b.length) {
    c.push(a[ia] <= b[ib] ? a[ia++] : b[ib++]);
  }
  return c.concat(ia < a.length ? a.slice(ia) : b.slice(ib));
}

const sorted = mergeSort([1, 5, 4, 6, 7, 2, 4, 6, 7, 8, 1, 2, 4]);
console.log(sorted);
