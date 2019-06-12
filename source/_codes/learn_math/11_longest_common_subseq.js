/**
 * @param {string} a
 * @param {string} b
 */
function findLongestCommonSubsequence(a, b) {
  /** @type {number[][]} */
  const len = [];
  const seq = [];
  a = [...a];
  b = [...b];

  for (let i = 0; i <= a.length; i += 1) {
    len[i] = [];
    seq[i] = [];
    len[i][0] = 0;
    seq[i][0] = [];
  }
  for (let j = 0; j <= b.length; j += 1) {
    len[0][j] = 0;
    seq[0][j] = [];
  }
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        len[i][j] = len[i - 1][j - 1] + 1;
        seq[i][j] = [...seq[i - 1][j - 1], a[i - 1]];
      } else if (len[i][j - 1] > len[i - 1][j]) {
        len[i][j] = len[i][j - 1];
        seq[i][j] = seq[i][j - 1];
      } else {
        len[i][j] = len[i - 1][j];
        seq[i][j] = seq[i - 1][j];
      }
    }
  }
  return {
    len: len[a.length][b.length],
    seq: seq[a.length][b.length]
  };
}

const res = findLongestCommonSubsequence(
  'linkeo@sohu.com',
  'linkang@innobuddy.com'
);
console.log(res, res.seq.join(''));
