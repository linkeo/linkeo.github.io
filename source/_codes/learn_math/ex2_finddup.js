function findDuplicatedNumber(array) {
  let expected = 0;
  let current = 0;
  for (let i = 0; i < array.length; i++) {
    expected ^= i;
    current ^= array[i];
  }
  return expected ^ current;
}

const arr = [1, 2, 3, 4, 5, 6, 6, 7, 8, 9];
const dup = findDuplicatedNumber(arr);
console.log(arr, dup);

// const MAX = 2 ** 31 - 1;

// flag = a^b^c^m;

// array= [a,b,c,m,m];

// flag = a^b^c^m^m = a^b^c;

// m^m=0;

// 0^m=m;
