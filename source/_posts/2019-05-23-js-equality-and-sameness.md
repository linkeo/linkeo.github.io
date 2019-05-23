---
title: JavaScript 中的相等性判断
date: 2019-05-23 15:07:58
category:
  - JavaScript
tags:
  - JavaScript
toc: true
---

JavaScript 中提供了三种不同的值比较操作：

- 严格相等（"Strict Equality Comparison", or "Identity"）：`===`
- 宽松相等（"Abstract Equality Comparision", or "Loose Equality"）：`==`
- 同值判断（"SameValue"）：`Object.is`（ECMAScript 2015 新特性）

<!-- more -->

而 ECMAScript 2015 中的相等算法则分为四种：

- 非严格相等比较（`==`）
- 严格相等比较（`===`），用于 `Array.prototype.indexOf`，`Array.prototype.lastIndexOf` 以及 `switch...case`
- 同值（`Object.is`）
- 同值零（"SameValueZero"），用于 `%TypedArray%` 和 `ArrayBuffer` 的构造函数，`Map` 和 `Set` 操作，以及 ECMAScript 2016 中的 `String.prototype.includes` 中

简而言之，

- `==` 将进行类型转换并比较
- `===` 不会进行类型转换，比较两个值是否相同（如果类型不同，则总是返回 `false`）
- `Object.is` 的行为与 `===` 相同，但是对于 `NaN`，`-0` 和 `+0` 进行了特殊处理，`Object.is(+0, -0)` 为 `false`，而 `Object.is(NaN, NaN)` 为 `true`（根据 IEEE 754, 使用 `==` 或 `===` 比较两个 `NaN` 结果将为 `false`）
- "SameValueZero" 与 `Object.is` 类似，但认为 `-0` 和 `+0` 是相等的

而以上这些比较，虽然结果有所区别，但均属于判断两个值是否相同。对于两个不同的非原始对象，以上判断的结果都是 `false`。

## 严格相等 `===`

全等操作符（`===`）比较两个值是否相等，被比较的值不会进行隐式类型转换，判断逻辑如下：

- 如果两个值具有不同的类型，则不全等
- 如果两个值具有相同的类型和值，且不为 number 类型，则全等
- 如果两个值都是 number 类型，且不为 `NaN`，且数值相等，则全等
- 如果两个值都是 `NaN`，则不全等
- 如果两个值分别为 `+0` 和 `-0`，则全等

在日常使用中 `===` 几乎总是正确的。

对于数字之外的类型，全等操作符有明确的定义：一个值只与自身相等。

对于数字类型，定义稍加修改：

1. 浮点数 0 是不分正负的，因为除了特定的数学问题，大部分情况都不关心 0 值的正负
2. 浮点数包含 NaN 值，来表示定义不明确的数学问题的解（比如：正负无穷相加），`===` 认为 `NaN` 和任何值都不相等，包括它自己

> - `x !== x` 成立的唯一条件就是 `x` 为 `NaN`，因此可以用来做 `NaN` 值判断
> - ECMA 规范中的定义：[Section 11.9.6, The Strict Equality Algorithm](http://ecma-international.org/ecma-262/5.1/#sec-11.9.6)

## 非严格相等 `==`

相等操作符（`==`）比较两个值是否相等，比较前将被比较的值转换为相同类型（等式的一边或两边都可能进行转换），然后进行 `===` 比较。相等操作符满足交换律。判断逻辑如下：

具有不同类型时：

- 如果两个值为 `null` 或 `undefined`，则相等
- 如果一个值为 `null` 或 `undefined`，另一个值为 `number` 或 `string` 或 `boolean`，则不相等
- 如果一个值为 `null` 或 `undefined`，另一个值为 `object`，则对 `object` 进行 "IsFalsy" 判断
- 如果一个值为 `object`，另一个值为 `number` 或 `string`，则对 `object` 进行 "ToPrimitive" 转换并判断是否全等
- 如果一个值为 `object`，另一个值为 `boolean`，则将 `boolean` 转换为 `number` 并对 `object` 进行 "ToPrimitive" 转换并判断是否全等
- 如果一个值为 `number`，另一个值为 `string` 或 `boolean`，则将另一个值转换为 `number` 并判断是否全等
- 如果一个值为 `string`，另一个值为 `boolean`，则都转换为 `number` 来判断

注：

- "ToPrimitive" 通过尝试调用 `toString()` 和 `valueOf()` 来将对象转换为原始值
- 转换为 `number` 的逻辑与一元 `+` 运算符相同
- "IsFalsy" 判断：大部分浏览器允许非常窄的一类对象在某种情况下充当 `undefined`，仅当这种情况下，"IsFalsy" 判断为 `true`

> - 有些开发者认为，最好永远都不要使用 `==`，因为 `==` 的结果难以预测，且会进行隐式类型转换，`===` 更加容易预测并更加快速。
> - ECMA 规范中的定义：[Section 11.9.3, The Abstract Equality Algorithm](http://ecma-international.org/ecma-262/5.1/#sec-11.9.3)

## 同值相等（"SameValue"）

同值相等（"SameValue"）用于判断**两个对象是否在任何情况下功能上是相同的**，判断逻辑如下：

- 如果两个值具有不同的类型，则不同值相等
- 如果两个值具有相同的类型和值，且不为 number 类型，则同值相等
- 如果两个值都是 number 类型，且不为 `NaN`，且数值相等，则同值相等
- 如果两个值都是 `NaN`，则同值相等（与 `===` 相反）
- 如果两个值分别为 `+0` 和 `-0`，则不同值相等（与 `===` 相反）

比如 `Object.defineProperty` 在试图修改不可变属性的时候，如果值发生变化就会抛出异常，而值没有变化的话则什么都不做。这时就是用同值相等来判断值是否发生了变化。

```js
Object.defineProperty(Number, 'NEGATIVE_ZERO', {
  value: -0,
  writable: false,
  configurable: false,
  enumerable: false
});
function attemptMutation(v) {
  Object.defineProperty(Number, 'NEGATIVE_ZERO', { value: v });
}
attemptMutation(-0); // 不发生任何事情
attemptMutation(+0); // 将抛出异常
```

> - 这个算法在 ES5 中仅用于 JS 引擎的内部，ES6 中通过 `Object.is` 暴露了这个算法。
> - ECMA 规范中的定义：[Section 9.12, The SameValue Algorithm](http://ecma-international.org/ecma-262/5.1/#sec-9.12)

## 同值零相等（"SameValueZero"）

同值零相等（"SameValueZero"）与同值相等类似，只是它认为 `+0` 和 `-0` 是相等的。

## 什么时候使用 `Object.is`？

总的来说，除了对待 `NaN` 的方式不同，`Object.is` 与 `===` 的唯一区别就是对待 `-0` 和 `+0` 的不同。

下面这些方法和操作符会区别对待 `-0` 和 `+0`：

- 一元负号（Unary `-`）

一元负号在表达式的使用可能会无意识产生 `-0`，比如：`obj.mass * - obj.velocity`，如果 `obj.mass` 为 0，则会得到一个 `-0`

- `Math.atan2`
- `Math.ceil`
- `Math.pow`
- `Math.round`

这些函数即使参数中没有 `-0`，都有可能产生 `-0` 的结果

- `Math.floor`
- `Math.max`
- `Math.min`
- `Math.sin`
- `Math.sqrt`
- `Math.tan`

这些函数当参数中有 `-0` 时，有可能产生 `-0` 的结果

- `~`
- `<<`
- `>>`

这些操作符内部都使用了 ToInt32 算法。因为内部的 Int32 类型不区分 0 的正负，-0 在进行了这些操作后，不会保留负号。

因此在未考虑到 0 的符号的情况下使用 `Object.is` 可能得不到预期的效果。
