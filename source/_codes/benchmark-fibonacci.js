const algorithms = {
  recursiveCached() {
    function fib(n) {
      if (n === 0) {
        return 0;
      }
      if (n === 1) {
        return 1;
      }
      if (!fib.cache[n]) {
        fib.cache[n] = fib(n - 1) + fib(n - 2);
      }
      return fib.cache[n];
    }
    fib.cache = [];
    return fib;
  },
  dynamicProgramming() {
    function fib(n) {
      const dp = [0, 1];
      for (let i = 2; i <= n; i += 1) {
        dp[i] = dp[i - 1] + dp[i - 2];
      }
      return dp[n];
    }
    return fib;
  },
  dynamicProgrammingOptimized() {
    function fib(n) {
      if (n === 0) {
        return 0;
      }
      let prev = 0; // 保存前一个值
      let curr = 1; // 保存当前值，初始化为 fib(1)
      // 迭代 n-1 次
      while (--n > 0) {
        [prev, curr] = [curr, prev + curr];
      }
      return curr;
    }
    return fib;
  },
  formula() {
    function fib(n) {
      const sqrt5 = Math.sqrt(5);
      const value =
        (Math.pow((1 + sqrt5) / 2, n) - Math.pow((1 - sqrt5) / 2, n)) / sqrt5;
      return Math.round(value);
    }
    return fib;
  },
  matrix() {
    function fib(n) {
      if (n === 0) {
        return 0;
      }
      if (n === 1) {
        return 1;
      }
      const Q = [[1, 1], [1, 0]];
      const powQ = pow2x2(Q, n - 1);
      return powQ[0][0];
    }
    function pow2x2(mat, exp) {
      let ret = [[1, 0], [0, 1]];
      let tmp = mat;
      while (exp > 0) {
        if ((exp & 1) === 1) {
          ret = mul2x2(ret, tmp);
        }
        tmp = mul2x2(tmp, tmp);
        exp >>= 1;
      }
      return ret;
    }
    function mul2x2(A, B) {
      const C = [[0, 0], [0, 0]];
      C[0][0] = A[0][0] * B[0][0] + A[0][1] * B[1][0];
      C[0][1] = A[0][0] * B[0][1] + A[0][1] * B[1][1];
      C[1][0] = A[1][0] * B[0][0] + A[1][1] * B[1][0];
      C[1][1] = A[1][0] * B[0][1] + A[1][1] * B[1][1];
      return C;
    }
    return fib;
  }
};

const maxN = 1000;
const times = 100000;

const names = Object.keys(algorithms);
for (let i = 0; i <= maxN; i++) {
  console.log('====================');
  const expected = algorithms.recursiveCached()(i);
  const oversize = expected > Number.MAX_SAFE_INTEGER;
  if (oversize) {
    break;
  }
  for (let name of names) {
    let correct = true;
    let actual;
    const start = Date.now();
    for (let k = 0; k < times; k++) {
      actual = algorithms[name]()(i);
      if (expected !== actual) {
        correct = false;
      }
    }
    const cost = (Date.now() - start) / times;
    console.log(
      `fib(${i}) - ${correct ? 'Y' : 'N'} ${cost * 1000000}ns - ${name}`
    );
    if (!oversize && !correct) {
      console.log({ expected, actual });
    }
  }
}
