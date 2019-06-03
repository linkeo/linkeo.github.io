const { Future, resolved, rejected, deferred } = require('./promise');
const assert = require('assert');
const util = require('util');

const promise = new Future((resolve, reject) => {
  process.nextTick(() => {
    resolve(promise);
  });
});

promise.then(
  () => {
    console.log('ok');
  },
  err => {
    console.error(err.stack);
  }
);

console.log(Promise.resolve('value'));
console.log(Promise.reject(new Error('Something wrong.')));
console.log(new Promise(() => {}));
