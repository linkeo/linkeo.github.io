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
 * @param {number[][]} dungeon
 * @return {number}
 */
let calculateMinimumHP = function(dungeon) {
  const w = dungeon.length;
  const h = dungeon[0].length;
  const dp = [];
  for (let i = 0; i < w; i++) {
    dp[i] = [];
  }
  for (let i = w - 1; i >= 0; i--) {
    for (let j = h - 1; j >= 0; j--) {
      if (i === w - 1 && j === h - 1) {
        dp[i][j] = Math.max(1, 1 - dungeon[i][j]);
      } else if (i === w - 1) {
        dp[i][j] = Math.max(1, dp[i][j + 1] - dungeon[i][j]);
      } else if (j === h - 1) {
        dp[i][j] = Math.max(1, dp[i + 1][j] - dungeon[i][j]);
      } else {
        dp[i][j] = Math.max(
          1,
          Math.min(dp[i][j + 1], dp[i + 1][j]) - dungeon[i][j]
        );
      }
    }
  }
  printMatrix('dp', dp);
  return dp[0][0];
};

{
  const input = [[-2, -3, 3], [-5, -10, 1], [10, 30, -5]];
  printMatrix('input', input);
  const output = calculateMinimumHP(input);
  console.log(output);
}

{
  const input = [[1, -3, 3], [0, -2, 0], [-3, -3, -3]];
  printMatrix('input', input);
  const output = calculateMinimumHP(input);
  console.log(output);
}
