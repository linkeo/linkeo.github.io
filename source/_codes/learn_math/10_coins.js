/**
 * @param {number} sum
 * @param {number} types
 */
function giveMinCoins(sum, types) {
  const min = Math.min(...types);
  const c = [];
  const d = [];
  for (const type of types) {
    c[type] = 1;
    d[type] = [type];
  }
  for (let i = 1; i <= sum; i += 1) {
    const cases = [];
    let min = 0;
    let mind = null;
    for (const type of types) {
      const prev = i - type;
      if (c[prev]) {
        let count = c[prev] + 1;
        if (!min || min > count) {
          min = count;
          mind = d[prev].concat(type);
        }
      }
    }
    if (min && (!c[i] || c[i] > min)) {
      c[i] = min;
      d[i] = mind;
    }
  }
  return {
    count: c[sum],
    coins: countCoins(d[sum])
  };
}

function countCoins(coins) {
  const obj = {};
  const array = [];
  for (const coin of coins) {
    if (!obj[coin]) {
      obj[coin] = [coin, 1];
      array.push(obj[coin]);
    } else {
      obj[coin][1] += 1;
    }
  }
  return array;
}

console.log(giveMinCoins(1982, [1, 5, 10, 20, 50, 100]));
