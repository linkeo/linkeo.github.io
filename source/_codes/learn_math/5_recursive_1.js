function findMultipliers(n, found = []) {
  if (n === 1) {
    if (!found.includes(1)) {
      findMultipliers(n, found.concat(1));
    }
    if (found.length > 1) {
      console.log(found.join('x'));
    }
  } else {
    const start = found.includes(1) ? 2 : 1;
    for (let i = start; i <= n; i += 1) {
      if (Number.isInteger(n / i)) {
        findMultipliers(n / i, found.concat(i));
      }
    }
  }
}

findMultipliers(8);
