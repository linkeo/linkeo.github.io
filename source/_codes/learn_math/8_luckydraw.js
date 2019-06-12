/**
 * @param {string[]} members
 * @param {number[]} levels
 */
function draw(members, levels) {
  if (levels.length === 0) {
    return [];
  }
  const first = pick(members, levels[0]);
  const array = [];
  for (const fp of first) {
    const remaining = members.filter(m => !fp.includes(m));
    if (levels.length > 1) {
      const remainingCombs = draw(remaining, levels.slice(1));
      for (const combs of remainingCombs) {
        array.push([fp, ...combs]);
      }
    } else {
      array.push([fp]);
    }
  }
  return array;
}

/**
 * @param {string[]} members
 * @param {number} count
 * @return {string[][]}
 */
function pick(members, count) {
  if (count === 0) {
    return [];
  }
  if (count === 1) {
    return members.map(mem => [mem]);
  }
  const array = [];
  for (let i = 0; i < members.length; i += 1) {
    const subArray = pick(members.slice(i + 1), count - 1);
    subArray.forEach(sub => {
      array.push([members[i], ...sub]);
    });
  }
  return array;
}

const members = Array(10)
  .fill(0)
  .map((_, i) => Number(i + 1).toString(36));
console.log(members);
const result = draw(members, [1, 2, 3]);
console.log(result);
