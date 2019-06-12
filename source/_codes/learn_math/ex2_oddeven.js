function checkIsOddByMod(x) {
  return x % 2 === 1;
}
function checkIsOddByBit(x) {
  return (x & 1) === 1;
}

function test(checkIsOdd) {
  const current = Date.now();
  console.time(current + '_' + checkIsOdd.name);
  let oddCnt = 0;
  let evenCnt = 0;
  for (let i = 0; i < 10000000; i += 1) {
    checkIsOdd(i) ? oddCnt++ : evenCnt++;
  }
  // console.log({ oddCnt, evenCnt });
  console.timeEnd(current + '_' + checkIsOdd.name);
}

test(checkIsOddByBit);
test(checkIsOddByMod);
test(checkIsOddByBit);
test(checkIsOddByMod);
test(checkIsOddByBit);
test(checkIsOddByMod);
test(checkIsOddByBit);
test(checkIsOddByMod);
