function placeTiles_1x2(n, m) {
  if (n < m) {
    [n, m] = [m, n];
  }
  const cnt = [];

  const full = (1 << m) - 1;
  const toState = v => v.toString(2).padStart(m, '0');

  function place(row, state, pos, preCnt) {
    cnt[row] = cnt[row] || {};
    if (pos === m) {
      cnt[row][toState(state)] = (cnt[row][toState(state)] || 0n) + preCnt;
      return;
    }

    place(row, state, pos + 1, preCnt);

    // 横着放一个
    if (pos <= m - 2 && !(state & (1 << pos)) && !(state & (1 << (pos + 1)))) {
      place(row, state | (1 << pos) | (1 << (pos + 1)), pos + 2, preCnt);
    }
  }

  place(1, 0, 0, 1n);
  for (let i = 2; i <= n; i += 1) {
    console.log(i + '/' + n);
    for (let j = 0; j <= full; j += 1) {
      const preCnt = cnt[i - 1][toState(j)];
      if (preCnt) {
        place(i, ~j & full, 0, preCnt);
      }
    }
  }

  for (let i = 1; i <= n; i += 1) {
    for (const [state, count] of Object.entries(cnt[i])) {
      console.log(i, state, count);
    }
  }

  // 最后一列放满的可能性
  return cnt[n][toState(full)] || 0n;
}

const cnt = placeTiles_1x2(3, 3);
console.log(cnt);
