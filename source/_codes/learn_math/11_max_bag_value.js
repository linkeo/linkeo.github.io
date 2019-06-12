const inspect = Symbol.for('nodejs.util.inspect.custom');
const randInt = (from, to) => from + Math.floor(Math.random() * (to - from));

class Item {
  constructor(value, weight) {
    this.value = value;
    this.weight = weight;
  }
  [inspect](depth, options) {
    return `{${options.stylize(this.value, 'number')},${options.stylize(
      this.weight,
      'special'
    )}}`;
  }
}

/**
 * @param {{weight: number, value: number}[]} arr
 * @param {number} capacity
 */
function maxBagValue(arr, capacity) {
  const state = [];

  state[0] = [];
  for (let j = 0; j <= capacity; j += 1) {
    state[0][j] = 0;
  }

  for (let i = 1; i <= arr.length; i += 1) {
    state[i % 2] = [];
    const item = arr[i - 1];
    for (let j = 0; j <= capacity; j += 1) {
      if (item.weight > j) {
        state[i % 2][j] = state[(i - 1) % 2][j];
      } else {
        state[i % 2][j] = Math.max(
          state[(i - 1) % 2][j - item.weight] + item.value,
          state[(i - 1) % 2][j]
        );
      }
    }
    console.dir(state[i % 2], { breakLength: Infinity });
  }
  return state[arr.length % 2][capacity];
}

const items = [];
for (let i = 0; i < 10; i += 1) {
  items[i] = new Item(randInt(1, 11), randInt(1, 11));
}

console.dir(items, { breakLength: Infinity });
const result = maxBagValue(items, 20);
console.log(result);
