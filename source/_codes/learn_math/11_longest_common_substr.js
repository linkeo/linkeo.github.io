/**
 * @param {string} a
 * @param {string} b
 */
function findLongestCommonSubstring(a, b) {
  /** @type {number[][]} */
  const len = [];
  const seq = [];
  const con = [];
  a = [...a];
  b = [...b];

  for (let i = 0; i <= a.length; i += 1) {
    len[i] = [];
    seq[i] = [];
    con[i] = [];
    len[i][0] = 0;
    seq[i][0] = [];
    con[i][0] = false;
  }
  for (let j = 0; j <= b.length; j += 1) {
    len[0][j] = 0;
    seq[0][j] = [];
    con[0][j] = false;
  }
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        if (con[i - 1][j - 1]) {
          con[i][j] = true;
          len[i][j] = len[i - 1][j - 1] + 1;
          seq[i][j] = [...seq[i - 1][j - 1], a[i - 1]];
        } else {
          con[i][j] = true;
          len[i][j] = 1;
          seq[i][j] = [a[i - 1]];
        }
        // Cannot be logger
        if (
          (a[i] === undefined || a[i] !== b[j]) &&
          (len[i][j] + 1 <= len[i][j - 1] || len[i][j] + 1 <= len[i - 1][j])
        ) {
          if (len[i][j - 1] > len[i - 1][j]) {
            con[i][j] = false;
            len[i][j] = len[i][j - 1];
            seq[i][j] = seq[i][j - 1];
          } else {
            con[i][j] = false;
            len[i][j] = len[i - 1][j];
            seq[i][j] = seq[i - 1][j];
          }
        }
      } else if (len[i][j - 1] > len[i - 1][j]) {
        con[i][j] = false;
        len[i][j] = len[i][j - 1];
        seq[i][j] = seq[i][j - 1];
      } else {
        con[i][j] = false;
        len[i][j] = len[i - 1][j];
        seq[i][j] = seq[i - 1][j];
      }
    }
  }
  console.log(len);
  return {
    len: len[a.length][b.length],
    seq: seq[a.length][b.length]
  };
}

const res = findLongestCommonSubstring(
  'linkeo@sohu.com',
  'linkang@innobuddy.com'
);
console.log(res, res.seq.join(''));
