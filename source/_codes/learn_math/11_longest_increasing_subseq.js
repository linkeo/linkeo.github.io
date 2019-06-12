const util = require('util');

const inspect = value =>
  util.inspect(value, {
    showHidden: false,
    depth: null,
    colors: true,
    breakLength: Infinity
  });

/**
 * @param {number[]} a
 */
function findLongestIncreasingSubsequence(a) {
  /** @type {number[]} */
  const len = [];
  /** @type {number[][]} */
  const seq = [];
  let max = 0;
  for (let i = 0; i < a.length; i += 1) {
    len[i] = 1;
    seq[i] = [a[i]];
    for (let j = 0; j < i; j += 1) {
      if (a[i] > a[j] && len[i] < len[j] + 1) {
        len[i] = len[j] + 1;
        seq[i] = seq[j].concat(a[i]);
      }
    }
    if (len[i] > len[max]) {
      max = i;
    }
  }
  return {
    len: len[max],
    seq: seq[max]
  };
}

/**
 * @param {number[]} a
 */
function findLongestIncreasingSubsequenceByBisectionSearch(a) {
  /** @type {number[]} */
  const tail = [-Infinity, a[0]]; // 长度i的lis的最小末尾元素
  /** @type {number[][]} */
  const seq = [[], [a[0]]]; // 长度i的lis的序列

  for (let i = 0; i < a.length; i += 1) {
    // bisection search
    let left = 1;
    let right = tail.length; // unreachable
    while (left < right - 1) {
      const middle = left + Math.floor((right - left) / 2);
      const middleValue = tail[middle];
      if (middleValue > a[i]) {
        right = middle;
      } else {
        left = middle;
      }
    }

    if (tail[left] > a[i] && tail[left - 1] < a[i]) {
      tail[left] = a[i];
      seq[left] = seq[left - 1].concat(a[i]);
    } else if (tail[left] < a[i]) {
      tail[left + 1] = a[i];
      seq[left + 1] = seq[left].concat(a[i]);
    }
  }
  return {
    len: tail.length - 1,
    seq: seq[tail.length - 1]
  };
}

const sampleCountList = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];

for (const sampleCount of sampleCountList) {
  const sample = [];
  const variantCount = sampleCount;
  for (let i = 0; i < sampleCount; i += 1) {
    sample[i] = Math.floor(Math.random() * variantCount);
  }
  console.log();
  console.log();
  console.log('Sample Count -', inspect(sample.length));
  if (sampleCount <= 100) {
    console.log('Sample -', inspect(sample));
  }

  console.time('findLongestIncreasingSubsequenceByBisectionSearch');
  const resb = findLongestIncreasingSubsequenceByBisectionSearch(sample);
  console.timeEnd('findLongestIncreasingSubsequenceByBisectionSearch');
  console.log('Len:', inspect(resb.len));
  if (sampleCount <= 100) {
    console.log(inspect(resb.seq));
  }

  console.time('findLongestIncreasingSubsequence');
  const res = findLongestIncreasingSubsequence(sample);
  console.timeEnd('findLongestIncreasingSubsequence');
  console.log('Len:', inspect(res.len));
  if (sampleCount <= 100) {
    console.log(inspect(res.seq));
  }
}
