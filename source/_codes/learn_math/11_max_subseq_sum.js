function maxConseqSum(arr) {
  let maxSumSoFar = [arr[0]];
  let maxSumEndingHere = [arr[0]];
  for (let i = 1; i < arr.length; i += 1) {
    maxSumEndingHere[i] = Math.max(maxSumEndingHere[i - 1] + arr[i], arr[i]);
    maxSumSoFar[i] = Math.max(maxSumSoFar[i - 1], maxSumEndingHere[i]);
  }

  console.dir(arr, { breakLength: Infinity });
  console.dir(maxSumEndingHere, { breakLength: Infinity });
  console.dir(maxSumSoFar, { breakLength: Infinity });
  return maxSumSoFar[arr.length - 1];
}

function maxConseqSumWithNoMoreArray(arr) {
  let maxSumSoFar = -Infinity;
  let maxSumEndingHere = -Infinity;
  for (let i = 1; i < arr.length; i += 1) {
    maxSumEndingHere = Math.max(maxSumEndingHere + arr[i], arr[i]);
    maxSumSoFar = Math.max(maxSumSoFar, maxSumEndingHere);
  }

  return maxSumSoFar;
}

const sample = [];
for (let i = 0; i < 10; i += 1) {
  sample[i] = Math.floor(Math.random() * 100) - 50;
}
console.log(maxConseqSum(sample));
console.log(maxConseqSumWithNoMoreArray(sample));
