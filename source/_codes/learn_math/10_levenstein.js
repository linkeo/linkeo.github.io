/**
 * @param {string} a
 * @param {string} b
 */
function levenstein(a, b) {
  /** @type {number[][]} */
  const d = [];
  const ca = [...a];
  const cb = [...b];
  let w = 1;
  for (let i = 0; i <= ca.length; i += 1) {
    d[i] = [];
    d[i][0] = i;
    w = Math.max(w, String(d[i][0]).length);
  }
  for (let j = 0; j <= cb.length; j += 1) {
    d[0][j] = j;
    w = Math.max(w, String(d[0][j]).length);
  }
  for (let i = 1; i <= ca.length; i += 1) {
    for (let j = 1; j <= cb.length; j += 1) {
      const r = ca[i - 1] === cb[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j - 1] + r, d[i][j - 1] + 1, d[i - 1][j] + 1);
      w = Math.max(w, String(d[i][j]).length);
    }
  }
  console.log(
    d.map(dr => dr.map(dc => String(dc).padStart(w)).join(' ')).join('\n')
  );
  return d[ca.length][cb.length];
}

const distance = levenstein('linkeo@sohu.com', 'linkang@innobuddy.com');
console.log(distance);
