const chars = ['a', 'b', 'c', 'd', 'e'];

function generatePassword(digits) {
  if (digits === 1) {
    return chars;
  }
  return chars
    .map(char => generatePassword(digits - 1).map(sub => char + sub))
    .reduce((set, subset) => set.concat(subset), []);
}

const passwords = generatePassword(4);
console.log(passwords);
