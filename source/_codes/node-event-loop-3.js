let i = 0;
function foo() {
  i++;
  if (i > 5) {
    return;
  }
  console.log('foo', i);
  setTimeout(() => {
    console.log('setTimeout', i);
  }, 2);
  process.nextTick(foo);
}
setTimeout(foo, 2);
setTimeout(() => {
  console.log('Other setTimeout');
}, 2);
