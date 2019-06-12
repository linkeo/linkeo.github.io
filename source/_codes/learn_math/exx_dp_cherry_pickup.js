let printMatrix = (name, matrix) => {
  const w = matrix.length;
  const h = matrix[0].length;
  console.log(`${name}:`);
  let wch = 1;
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      wch = Math.max(wch, String(matrix[i][j]).length);
    }
  }
  for (let i = 0; i < w; i++) {
    console.log(matrix[i].map(x => String(x).padStart(wch)).join(' '));
  }
};

/**
 * @param {number[][]} grid
 * @return {number}
 */
var cherryPickup = function(grid) {
  printMatrix('input', grid);
  const n = grid.length;
  const nk = 2 * n - 1;
  const dp = [];
  for (let i = 0; i < n; i++) {
    dp[i] = Array(n).fill(-1);
  }
  dp[0][0] = grid[0][0];

  let min, max, vi, vj;
  printMatrix('dp_0', dp);
  for (let k = 1; k < nk; k++) {
    min = Math.max(0, k - (n - 1));
    max = Math.min(n - 1, k);
    for (let i = max; i >= min; i--) {
      vi = grid[i][k - i];
      for (let j = max; j >= min; j--) {
        vj = grid[j][k - j];
        if (vi === -1 || vj === -1) {
          dp[i][j] = -1;
        } else {
          if (i > 0 && j > 0) {
            dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - 1]);
          }
          if (i > 0 && k - j > 0) {
            dp[i][j] = Math.max(dp[i][j], dp[i - 1][j]);
          }
          if (k - i > 0 && j > 0) {
            dp[i][j] = Math.max(dp[i][j], dp[i][j - 1]);
          }
          if (dp[i][j] !== -1) {
            if (i === j) {
              dp[i][j] += vi || vj;
            } else {
              dp[i][j] += vi + vj;
            }
          }
        }
      }
    }
    printMatrix('dp_' + k, dp);
  }

  const res = dp[n - 1][n - 1];
  if (res === -1) {
    return 0;
  }
  return res;
};

{
  const input = [[0, 1, -1], [1, 0, -1], [1, 1, 1]];
  const output = cherryPickup(input);
  console.log(output);
}

{
  const input = [[1, 1, -1], [1, -1, 1], [-1, 1, 1]];
  const output = cherryPickup(input);
  console.log(output);
}

{
  const input = [
    [1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1]
  ];
  const output = cherryPickup(input);
  console.log(output);
}
