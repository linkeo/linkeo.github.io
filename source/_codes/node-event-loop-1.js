let i = 0;
const start = new Date();
function foo() {
  i++;
  if (i < 1000) {
    setImmediate(foo);
  } else {
    const end = new Date();
    console.log('Execution time: ', end - start);
  }
}
foo();
