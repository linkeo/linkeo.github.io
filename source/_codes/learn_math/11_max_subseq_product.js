function maxConseqProduct(arr) {
  let maxProductSoFar = [arr[0]];
  let minProductEndingHere = [arr[0]];
  let maxProductEndingHere = [arr[0]];
  for (let i = 1; i < arr.length; i += 1) {
    const p1 = minProductEndingHere[i - 1] * arr[i];
    const p2 = maxProductEndingHere[i - 1] * arr[i];
    minProductEndingHere[i] = Math.min(p1, p2, arr[i]);
    maxProductEndingHere[i] = Math.max(p1, p2, arr[i]);
    maxProductSoFar[i] = Math.max(
      maxProductSoFar[i - 1],
      maxProductEndingHere[i]
    );
  }

  console.dir(arr, { breakLength: Infinity });
  console.dir(minProductEndingHere, { breakLength: Infinity });
  console.dir(maxProductEndingHere, { breakLength: Infinity });
  console.dir(maxProductSoFar, { breakLength: Infinity });
  return maxProductSoFar[arr.length - 1];
}

function maxConseqProductWithNoMoreArray(arr) {
  let maxProductSoFar = arr[0];
  let minProductEndingHere = arr[0];
  let maxProductEndingHere = arr[0];
  for (let i = 1; i < arr.length; i += 1) {
    const p1 = minProductEndingHere * arr[i];
    const p2 = maxProductEndingHere * arr[i];
    minProductEndingHere = Math.min(p1, p2, arr[i]);
    maxProductEndingHere = Math.max(p1, p2, arr[i]);
    maxProductSoFar = Math.max(maxProductSoFar, maxProductEndingHere);
  }

  return maxProductSoFar;
}

const sample = [];
for (let i = 0; i < 10; i += 1) {
  sample[i] = (Math.floor(Math.random() * 100) - 50) / 10;
}
console.log(maxConseqProduct(sample));
console.log(maxConseqProductWithNoMoreArray(sample));
