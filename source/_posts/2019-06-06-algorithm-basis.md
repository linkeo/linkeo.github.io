---
title: 算法基础思想
toc: true
categories:
  - Algorithm
tags:
  - Algorithm
date: 2019-06-06 09:48:48
---

本篇介绍一些算法的基础思想。

包括：迭代、数学归纳法、递归、分治。（还讲了一下位运算和排列组合）

<!-- more -->

## 迭代

迭代法（Iterative Method），在计算数学中，迭代是通过从一个初始估计出发寻找一系列近似解来解决问题（一般是解方程或者方程组）的数学过程，为实现这一过程所使用的方法统称。

而在计算机中，迭代是程序中对一组指令（或一定步骤）的重复。它既可以被用作通用的术语（与 “重复” 同义，此时迭代的定义包括了递归），也可以用来描述一种特定形式的具有可变状态的重复（就是一般我们所说的迭代，与递归相对的概念）。迭代很容易通过循环语句来实现。

应用：

- 通过不断逼近来求某个数值或其近视值。典型方法包括二分法和牛顿法。
- 在一定范围内查找目标值。典型方法如二分查找。
- 机器学习算法中的迭代。比如 K-均值算法、PageRank 的马尔可夫链、梯度下降法等。

### **案例 1** 二分法求平方根近似值

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
    const diff = Math.abs(square / n - 1);
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

> **技巧 1** 使用 `min + (max - min) / 2` 而不是 `(min + max) / 2` 来防止计算溢出
>
> **技巧 2** 计算相对误差来使迭代次数相对稳定（`Math.abs(square / n - 1)`）

### **案例 2** 二分查找

二分查找的条件为：数组的元素是可比较的，且数组是有序的（或者说，需要先排序的）。

```js
/**
 * @param {number} value 待搜索的值
 * @param {number} array 搜索的数组
 * @param {number} isSorted 数组是否有序（是否需要排序）
 * @return {boolean}
 */
function bisectionSearch(value, array, isSorted = false) {
  if (!isSorted) {
    array = array.sort((a, b) => a - b);
  }
  let left = 0;
  let right = array.length - 1;
  while (left < right) {
    const middle = Math.floor(left + (right - left) / 2);
    const current = array[middle];
    if (current === value) {
      return true;
    } else if (current < value) {
      left = middle;
    } else {
      right = middle;
    }
  }
  return false;
}
```

## 数学归纳法

使用数学归纳法可以从理论上证明一些结论的成立而避免迭代计算。

数学归纳法（Mathematical Induction、MI、ID）是一种数学证明方法，通常被用于证明某个给定命题在整个（或者局部）自然数范围内成立。除了自然数以外，广义上的数学归纳法也可以用于证明一般良基结构，例如：集合论中的树。这种广义的数学归纳法应用于数学逻辑和计算机科学领域，称作结构归纳法。

使用数学归纳法证明通常需要以下两步：

1. 证明基本情况（$ n=1 $）时，结论成立；
2. 假设 $ n=k $ 时结论成立，证明 $ n=k+1 $ 时结论也成立（$ k $ 为任意大于 0 的自然数）。

> 以上两步的条件不是绝对的，基本情况的条件，以及第二步的递推条件都是可以修改的。当然，修改后结论成立的范围也需要重新审视。

### **案例 3** 棋盘麦粒

古印度一位宰相将受到国王赏赐麦粒，国王问他要多少麦粒，他拿出一个 8x8 的棋盘，说在第一个格子里放 1 粒、第二个格子里放 2 粒、之后每一个格子都放前一个个格子的 2 倍数量的麦粒，他需要放完这个棋盘所有格子的麦粒。

这一题（n 个格子的麦粒总数）最直接的方式就是通过迭代来解答：

```js
function countWheats(latticeCount) {
  let sum = 0;
  let current = 1;
  for (let i = 0; i < latticeCount; i += 1) {
    sum += current;
    current *= 2;
  }
  return sum;
}
```

不过我们可以发现，n 个格子的麦粒总数为 $ 1 + 2 + 2^2 + 2^3 + ... + 2^{n-1} = 2^n-1 $，我们可以用数学归纳法来证明这个结论。

我们用 $ f(n) $ 来表示前 n 个格子的麦粒总数。

1. $ n=1 $ 时，$ f(n) = 1 = 2^0 - 1 $，结论成立
2. 假设 $ f(n) = 2^n - 1 $，那么 $ f(n + 1) = f(n) + 2^n = 2^n + 2^n - 1 = 2^{n+1} - 1 $，结论成立

通过以上步骤，我们成功证明了结论在 n 为正整数的情况下均成立。

所以这个解答可以简化为：

```js
function countWheats(latticeCount) {
  return 2 ** latticeCount - 1;
}
```

但是这个案例，通过浮点数计算乘方可能会损失精度，如果需要精确的值，我们需要使用 `BigInt` 类型来表示数值，通过迭代得到精确值。

## 递归

递归（Recursion）在数学和计算机科学中，是指由一种（或多种）简单的基本情况定义的一类对象或方法，并规定其他所有情况都能被还原为其基本情况。

观察数学归纳法的证明过程，我们可以发现，只要在 $ f(n) $ 值已知的情况下可以求的 $ f(n+1) $ 的值，并且能够得到初始条件下的值，我们就可以求得任意大于初始条件的情况下的 $ f(n) $。

例如案例 3，我们也可以通过递归来得到答案：

```js
function countWheats(n) {
  if (n === 1) {
    return 1;
  }
  return countWheats(n - 1) + 2 ** (n - 1);
}
```

递归的条件在于，我们已知基本情况的结果，而对于复杂情况，我们能够一步步地简化，直到简化为基本情况。

### **案例 4** 列出 N 局猜拳获胜的所有情况

```js
const ROCK = '石头';
const SCISSORS = '剪刀';
const PAPER = '布';
const shapes = [ROCK, SCISSORS, PAPER];
const compare = (a, b) => {
  if (a === b) {
    return 0;
  }
  if (
    (a === ROCK && b === SCISSORS) ||
    (a === SCISSORS && b === PAPER) ||
    (a === PAPER && b === ROCK)
  ) {
    return 1;
  }
  return -1;
};

/**
 * @param {number} games 还有多少场比赛要比
 * @param {[string, string][]} stack 已经比过的比赛的出拳方式
 * @return {number} 获胜的情况数量
 */
function winCaces(games = 1, stack = []) {
  // 还有比赛要比
  if (games > 0) {
    let count = 0;
    for (const thisSide of shapes) {
      for (const thatSide of shapes) {
        count += winCaces(games - 1, [...stack, [thisSide, thatSide]]);
      }
    }
    return count;
  } else {
    const totalScore = stack
      .map(([thisSide, thatSide]) => compare(thisSide, thatSide))
      .reduce((sum, score) => sum + score, 0);
    if (totalScore > 0) {
      console.log(stack.map(pair => pair.join('vs')).join(', '));
      return 1;
    }
    return 0;
  }
}

const count = winCaces(3);
console.log('如上，一共' + count + '种获胜情况');
```

## 分治

在上一节递归中，我们知道了一种基于数学归纳的将复杂问题逐步简单化的方式，但是还有一些复杂问题可能无法通过逐步归纳的方式来简单化，比如二分查找、归并排序等等。这一节我们介绍另一种将复杂问题简单化的思想 ---- 分治。

在计算机科学中，分治法是建基于多项分支递归的一种很重要的算法范式。字面上的解释是“分而治之”，就是把一个复杂的问题分成两个或更多的相同或相似的子问题，直到最后子问题可以简单的直接求解，原问题的解即子问题的解的合并。

这个技巧是很多高效算法的基础，如排序算法（快速排序、归并排序）、傅立叶变换（快速傅立叶变换）。

### **案例 5** 归并排序

归并排序是一种典型的使用分治思想的算法。它的核心步骤 “归并” 就是将两个有序的数组合并成一个有序的数组。归并排序就是将原数组分解成若干个长度为 1 的小数组，最后再归并成一个大数组的方法。

由于归并过程的复杂度为 $ O(n) $，分解的次数为 $ O(\log_2{n}) $，归并排序的时间复杂度为 $ O(n\log_2{n}) $。由于归并过程总是产生相同长度的数组，归并排序的空间复杂度为 $ O(n) $。

```js
function mergeSort(array) {
  if (array.length < 2) {
    return array;
  }
  const middle = Math.floor(array.length / 2);
  const left = mergeSort(array.slice(0, middle));
  const right = mergeSort(array.slice(middle));
  return merge(left, right);
}

function merge(a, b) {
  const c = [];
  let ia = 0;
  let ib = 0;
  while (ia < a.length && ib < b.length) {
    c.push(a[ia] <= b[ib] ? a[ia++] : b[ib++]);
  }
  return c.concat(ia < a.length ? a.slice(ia) : b.slice(ib));
}

const sorted = mergeSort([1, 5, 4, 6, 7, 2, 4, 6, 7, 8, 1, 2, 4]);
console.log(sorted);
```

## 位运算

位运算包括：左移、右移、与、或、非、异或。

异或有以下性质：`x ^ x = 0`、`0 ^ x = x`。

位运算由于其性质，在解决一些问题时有奇效。

### **案例 6** 使用位运算判断奇偶

再一些语言中，位运算比取余运算要快得多，可以使用位运算来判断奇偶，来节省执行时间。

```js
const isOdd = number => (number & 1) === 1;
```

### **案例 7** 不使用额外空间来交换整型变量

利用异或的特性，我们可以不使用额外的变量就可以交换两个变量的值。

$$
\begin{align}
x &= x_0, y = y_0 \\\\
x &= x \oplus y = x_0 \oplus y_0 \\\\
y &= x \oplus y = x_0 \oplus y_0 \oplus y_0 = x_0 \\\\
x &= x \oplus y = x_0 \oplus y_0 \oplus x_0 = y_0 \\\\
\end{align}
$$

```js
function swap(arr, i, j) {
  arr[i] = arr[i] ^ arr[j];
  arr[j] = arr[i] ^ arr[j];
  arr[i] = arr[i] ^ arr[j];
}
```

### 位的集合操作

位数组可以用来描述一组相互独立的布尔状态，通常可以用整型来表示。

比如，带分类的碰撞检测。我们要让魔法飞弹不能与建筑物碰撞，只能与怪物碰撞。

我们让每一个类型包括两个位数组属性，一个表示自身的分类，一个表示可以碰撞的分类。

```js
class Collision {
  mask = 0;
  hitMask = 0;
  canHit(other) {
    return (this.hitMask & other.mask) !== 0;
  }
}
const Bit = {
  Monster: 1 << 0,
  Building: 1 << 1,
  MagicBullet: 1 << 2
};

// 怪物可以与其它怪物、建筑、魔法飞弹碰撞
class Monster extends Collision {
  mask = Bit.Monster;
  hitMask = Bit.Monster & Bit.Building & Bit.MagicBullet;
}

// 建筑可以与其它建筑、怪物碰撞
class Building extends Collision {
  mask = Bit.Building;
  hitMask = Bit.Monster & Bit.Building;
}

// 魔法飞弹只能与怪物碰撞
class MagicBullet extends Collision {
  mask = Bit.MagicBullet;
  hitMask = Bit.Monster;
}
```

## 排列与组合

排列与组合一般用于分析或者列出所有可能的情况，即穷举法。

排列（permutation），数学的重要概念之一。从 n 个不同元素中每次取出 m（1≤m≤n）个不同元素，排成一列，称为从 n 个元素中取出 m 个元素的无重复排列或直线排列，简称排列。从 n 个不同元素中取出 m 个不同元素的所有不同排列的个数称为排列种数或称排列数，记为 $ P_n^m $（或 $ A_n^m $）。

$$
P_n^m = n(n-1)(n-2)...(n-m+1) = \frac{n!}{(n-m)!}
$$

特别的，将 n 个元素全部取出来排列的排列数成为全排列，记为 $ P_n $。

$$
P_n = n!
$$

重复排列（permutation with repetiton）是一种特殊的排列，从 n 个元素中可重复地选取 m 个元素，按照一定的顺序排成一列，称作从 n 个元素中取 m 个元素的可重复排列。重复排列的排列数为 $ n^m $。

组合（combination），数学的重要概念之一。从 n 个不同元素中每次取出 m 个不同元素（0≤m≤n），不管其顺序合成一组，称为从 n 个元素中不重复地选取 m 个元素的一个组合。所有这样的组合的总数称为组合数，记为 $ C_n^m $。

$$
C_n^m = \frac{P_n^m}{P_m} = \frac{n!}{m!(n-m)!}
$$

基本性质：

$$
\begin{align}
&C_n^m = C_n^{n-m} \\\\
&C_{n+1}^m = C_n^m + C_n^{m-1} \\\\
&\sum_{k=0}^{n}{C_n^k} = 2^n \\\\
\end{align}
$$

重复组合（combination with repetiton）是一种特殊的组合。从 n 个不同元素中可重复地选取 m 个元素。不管其顺序合成一组，称为从 n 个元素中取 m 个元素的可重复组合。从 n 个不同元素中可重复地选出 m 个元素的不同组合种数记为 $ H_n^m $。

$$
H_n^m = \frac{(n+m-1)!}{m!(n-1)!}
$$
