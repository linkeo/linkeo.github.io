---
title: 用矩阵求第 N 个斐波那契数
toc: true
categories:
  - Algorithm
tags:
  - Algorithm
  - Fibonnaci
  - Matrix
date: 2019-06-11 22:22:09
---

编程求解第 N 个斐波那契数是一个经典问题，除了常规解法，本文将介绍几个较为特别的解法。

<!-- more -->

斐波那契数列的定义如下：

$$
\begin{align}
Fib_0 &= 0 \\\\
Fib_1 &= 1 \\\\
\vdots \\\\
Fib_n &= Fib_{n-1} + Fib_{n-2} \quad (n \in \mathbb Z^+, n \geq 2) \\\\
\end{align}
$$

## 常规解法

### 递归法

最直观的方法是直接将斐波那契数列的定义写成对应的递归函数：

```js
function fib(n) {
  if (n === 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }
  return fib(n - 1) + fib(n - 2);
}
```

根据 $ Fib_n = Fib_{n-1} + Fib_{n-2} $ 进行递归，最左侧的递归数高度为 $ n $，最右侧的递归数高度为 $ \frac{n}{2} $，那么我们可以得出递归数的节点数量约为 $ \frac{2^n}{2} = 2^{n-1} $，而递归树的高度为 $ n $。

所以递归法的时间复杂度为 $ O(2^n) $，空间复杂度为 $ O(n) $。

直接递归需要进行大量的重复计算，我们可以加入函数缓存来降低计算次数。

带函数缓存的递归解法如下：

```js
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
```

加入函数缓存后，对每一个重复位置的计算将只进行一次，因此时间复杂度降为 $ O(n) $，但是将多出 $ n $ 个数字的空间用于缓存结果，空间复杂度为 $ O(n) + O(n) = O(n) $。

### 迭代法 / 动态规划

不难发现，这个问题可以被分解为一些包含最优子结构的子问题，即它的最优解可以从其子问题的最优解来有效地构建，我们可以使用动态规划来解决这一问题。

当然，因为斐波那契数列的公式比较简单，我们也可以简单地将递归的步骤直接转化为循环迭代，其逻辑与动态规划的方法一致。

动态规划的解法如下：

```js
function fib(n) {
  const dp = [0, 1];
  for (let i = 2; i <= n; i += 1) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}
```

该解法的时间复杂度与空间复杂度均为 $ O(n) $。

我们发现，每个状态的只与前两个状态相关，我们可以将储存状态的变量减少到 2 个来优化空间使用。

优化空间的动态规划解法如下：

```js
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
```

优化后，动态规划解法的时间复杂度为 $ O(n) $，空间复杂度为 $ O(1) $。

## 非常规解法

除了以上较为简单就可以想到的解法，如下方法虽然较难想到，但也是计算更加高效的算法。

### 斐波那契公式

先由数学的方法求出斐波那契数列的通项。

我们设 $ Fib_n = a^n $，那么根据递推公式，我们可以得到 $ a^n = a^{n-1} + a^{n-2} $，约分一下可以得到 $ a^2 = a + 1 $ 即二次方程 $ a^2 - a - 1 = 0 $

对二次方程求解可以得到：

$$
a = \frac{1 \pm \sqrt 5}{2 \sqrt 5}
$$

那么我们再设 $ Fib_n = A \left\( \frac{1 + \sqrt 5}{2 \sqrt 5} * C \right\)^n + B \left\( \frac{1 - \sqrt 5}{2 \sqrt 5} * C \right\)^n $

代入数列前三项可以得到：

$$
\begin{align}
Fib_0 &= A + B = 0 \\\\
Fib_1 &= \frac{1 + \sqrt 5}{2 \sqrt 5} AC + \frac{1 - \sqrt 5}{2 \sqrt 5} BC = 1 \\\\
Fib_2 &= \frac{3 + \sqrt 5}{10} AC^2 + \frac{3 - \sqrt 5}{10} BC^2 = 1 \\\\
\end{align}
$$

求解以上关于 $ A, B, C $ 的方程组可以得到：

$$
\begin{align}
A &= \frac{1}{\sqrt 5} \\\\
B &= - \frac{1}{\sqrt 5} \\\\
C &= \sqrt 5 \\\\
\end{align}
$$

代入 $ Fib_n = A \left\( \frac{1 + \sqrt 5}{2 \sqrt 5} * C \right\)^n + B \left\( \frac{1 - \sqrt 5}{2 \sqrt 5} * C \right\)^n $ 就可以得到斐波那契公式。

斐波那契公式：

$$
F_n = \frac{1}{\sqrt 5} * \left\[ \left\(\frac{1 + \sqrt 5}{2}\right\)^n - \left\(\frac{1 - \sqrt 5}{2}\right\)^n \right\]
$$

那么根据斐波那契公式，我们就可以编码求解了：

```js
function fib(n) {
  const sqrt5 = Math.sqrt(5);
  const value =
    (Math.pow((1 + sqrt5) / 2, n) - Math.pow((1 - sqrt5) / 2, n)) / sqrt5;
  return Math.round(value);
}
```

该方法的需要进行 1 次平方根与 2 次求幂操作，[用二分法求平方根](#用二分法求平方根)的复杂度为 $ O(log_2{n}) $，用[快速幂方法](#用快速幂方法求幂)求幂的复杂度为 $ O(log_2{n}) $，所以总体时间复杂度为 $ O(log_2{n}) $。同理，空间复杂度为 $ O(1) $。

但是由于涉及到浮点数计算，该方法可能会得到近似值而不是准确值。

### Q-Matrix 方法

Q-Matrix 方法是一种利用矩阵相乘特性来巧妙求解斐波那契数列的方式。公式如下：

$$
\begin{bmatrix}
F_{n+1} & F_n \\\\
F_n & F_{n-1} \\\\
\end{bmatrix}
=
\begin{bmatrix} 1 & 1 \\\\ 1 & 0 \\\\ \end{bmatrix}^n
\quad (n \in \mathbb Z^+)
$$

我们令 $ Q = \begin{bmatrix} 1 & 1 \\\\ 1 & 0 \\\\ \end{bmatrix} $，则：

$$
Q^n = \begin{bmatrix}
F_{n+1} & F_n \\\\
F_n & F_{n-1} \\\\
\end{bmatrix}
\quad (n \in \mathbb Z^+)
$$

我们可以用数学归纳法来证明上述公式成立，首先检验第一项满足条件：

$$
Q^1 = \begin{bmatrix} 1 & 1 \\\\ 1 & 0 \\\\ \end{bmatrix} = \begin{bmatrix} Fib_2 & Fib_1 \\\\ Fib_1 & Fib_0 \\\\ \end{bmatrix}
$$

假设第 n-1 项满足条件，证明第 n 项也满足：

$$
\begin{align}
Q^n &= Q^{n-1} Q \\\\
    &= \begin{bmatrix}
F_n & F_{n-1} \\\\
F_{n-1} & F_{n-2} \\\\
\end{bmatrix} \begin{bmatrix} 1 & 1 \\\\ 1 & 0 \\\\ \end{bmatrix} \\\\
    &= \begin{bmatrix}
F_n + F_{n-1} & F_{n-1} + F_{n-2} \\\\
F_{n-1} + F{n-2} & F_{n-1} \\\\
\end{bmatrix} \\\\
    &= \begin{bmatrix}
F_{n+1} & F_n \\\\
F_n & F_{n-1} \\\\
\end{bmatrix}
\end{align}
$$

由上述步骤即可证明对于 $ n \in \mathbb Z^+ $ 结论成立，反过来可得对于 $ n \in \mathbb Z^+, n \geq 2 $，$ Fib_n = Q^{n-1}[0,0] $。

那么转换成代码即：

```js
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
```

其中 `pow2x2(mat, exp)` 用于求 2x2 矩阵的正整数次幂。我们可以将[快速幂方法](#用快速幂方法求幂)延伸到矩阵求幂：

```js
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
```

这样 `pow2x2(mat, exp)` 的时间复杂度为 $ O(log_2{n}) $，空间复杂度为 $ O(1) $。

用 Q-Matrix 方法求斐波那契数只涉及一次矩阵求幂，那么它的的时间复杂度也为 $ O(log_2{n}) $，空间复杂度也为 $ O(1) $。

## 总结

以上所述计算斐波那契数的方法复杂度比较：

| 方法         | 时间复杂度                   | 空间复杂度                 |
| ------------ | ---------------------------- | -------------------------- |
| 递归         | $ O(2^n) $ or $ O(n)^{[1]} $ | $ O(n) $                   |
| 动态规划     | $ O(n) $                     | $ O(n) $ or $ O(1)^{[2]} $ |
| 斐波那契公式 | $ O(log_2{n}) $              | $ O(1) $                   |
| Q-Matrix     | $ O(log_2{n}) $              | $ O(1) $                   |

- 注 \[1\]：使用函数缓存优化递归执行时间
- 注 \[2\]：优化状态存储来减少空间占用

## 附录

### 用二分法求平方根

上一篇文章中有提及到用二分法求平方根，这里直接贴出代码：

```js
/**
 * @param {number} n 待求平方根的数
 * @param {number} e 相对误差要求
 * @param {number} limit 迭代次数限制
 * @return {number}
 */
function getSquareRootOf(n, e = 0.00000001, limit = 100000) {
  if (n < 0) {
    return NaN;
  }
  if (n === 0 || n === 1) {
    return n;
  }
  let min = n > 1 ? 1 : n;
  let max = n > 1 ? n : 1;
  for (let times = 0; times < limit; times += 1) {
    const middle = min + (max - min) / 2;
    const square = middle * middle;
    const diff = Math.abs(square / n - 1); // 相对精度
    if (diff < e) {
      return middle;
    } else if (square > n) {
      max = middle;
    } else {
      min = middle;
    }
  }
  return min + (max - min) / 2;
}
```

分析可知其时间复杂度为 $ O(log_2{n}) $，空间复杂度为 $ O(1) $。

### 用快速幂方法求幂

根据正整数的二进制数表示法，我们可以得到下列规律：

$$
13 = 1101_2 = 2^3 + 2^2 + 2^0
$$

那么对于乘方我们可以得到如下规律：

$$
a^{13} = a^{1101_2} = a^{(2^3 + 2^2 + 2^0)} = a^{2^3} * a^{2^2} * a^{2^0}
$$

利用这个规律，我们可以用 $ O(log_2{n}) $ 次相乘就可以得到 $ a^n \ (n \in \mathbb Z^+) $。

```js
function pow(num, exp) {
  let ret = 1;
  let tmp = num; // num ^ 1
  while (exp > 0) {
    if ((exp & 1) === 1) {
      ret *= tmp; // ret *= num ^ (2 ^ (i - 1))
    }
    tmp *= tmp; // num ^ (2 ^ i), i 为循环次数
    exp >>= 1;
  }
  return ret;
}
```

分析可知其时间复杂度为 $ O(log_2{n}) $，空间复杂度为 $ O(1) $。
