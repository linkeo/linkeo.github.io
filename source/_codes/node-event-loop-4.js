setImmediate(function a() {
  console.log('setImmediate1'); // 1
  setTimeout(function b() {
    console.log('setTimeout1'); // 4
  }, 0);
});
setTimeout(function c() {
  console.log('setTimeout2'); // 2
  process.nextTick(function d() {
    console.log('nextTick1'); // 3
  });
  setImmediate(function e() {
    console.log('setImmediate2'); // 5
  });
}, 0);

// console.log('script end.');

// setImmediate1;
// setTimeout2;
// nextTick1;
// setTimeout1;
// setImmediate2;

// function setImmediate(callback) {
//   checkQueue.push(callback);
// }
