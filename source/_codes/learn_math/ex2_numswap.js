function swap(a, b) {
  a = a ^ b;
  b = a ^ b;
  a = a ^ b;
  return [a, b];
}

const MAX = 2 ** 31 - 1;

const a = Math.floor(MAX * Math.random());
const b = Math.floor(MAX * Math.random());

const [c, d] = swap(a, b);
const [e, f] = swap(c, d);

console.log(a, b);
console.log(c, d);
console.log(e, f);
