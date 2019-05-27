---
title: 重新介绍 JavaScript（一）
date: 2019-05-24 16:08:19
categories:
  - JavaScript
tags:
  - JavaScript
toc: true
---

为什么会有这一篇 “重新介绍” 呢？因为 JavaScript 堪称世界上被人误解最深的编程语言。虽然常被嘲为“玩具语言”，但在它看似简洁的外衣下，还隐藏着强大的语言特性。 JavaScript 目前广泛应用于众多知名应用中，对于网页和移动开发者来说，深入理解 JavaScript 就尤为必要。

本篇涉及类型、变量、运算符、对象以及数组。

<!-- more -->

与大多数编程语言不同，JavaScript 没有输入或输出的概念。它是一个在主机环境（host environment）下运行的脚本语言，任何与外界沟通的机制都是由主机环境提供的。浏览器是最常见的主机环境，但在非常多的其他程序中也包含 JavaScript 解释器，如 Adobe Acrobat、Photoshop、SVG 图像、Yahoo! 的 Widget 引擎，以及 Node.js 之类的服务器端环境。JavaScript 的实际应用远不止这些，除此之外还有 NoSQL 数据库（如开源的 Apache CouchDB）、嵌入式计算机，以及包括 GNOME （注：GNU/Linux 上最流行的 GUI 之一）在内的桌面环境等等。

---- [JavaScript Reference](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/A_re-introduction_to_JavaScript)

## 概览

JavaScript 是一种面向对象的动态语言，包含了类型、运算符、内置对象和方法。语法源于 Java 和 C 语言。和 Java 的主要区别在于 JavaScript 不支持类，类的概念在 JavaScript 中通过对象原型与继承的方式来实现。JavaScript 支持函数式编程，因为 JavaScript 中函数也是一种对象，可以保存在变量中并当作参数传递。

## 类型

JavaScript 的类型包括：

- `Number`（数字）
- `String`（字符串）
- `Boolean`（布尔值）
- `Symbol`（符号，ES6 新增的类型）
- `Object`（对象）
  - `Function`（函数）
  - `Array`（数组）
  - `Date`（日期）
  - `RegExp`（正则表达式）
- `null`（空值）
- `undefined`（未定义）

### 数字

JavaScript 采用 IEEE 754 双精度 64 位数字表示法，并且不区分整数和浮点数类型，所有数字均为浮点数值（但是在具体实现时，整数通常被视为 32 位整型变量），所以在进行计算时需要特别注意，比如：

```js
0.1 + 0.2 = 0.30000000000000004
```

JavaScript 的算数运算符包括加（`+`）、减（`-`）、乘（`*`）、除（`/`）、取余（`%`）以及乘方（`**`，ES7 新增的操作符）。

JavaScript 内置的 Math 对象用于处理更多的数学函数和常数。

可以使用内置函数 parseInt() 将字符串转换为整型。该函数的第二个参数表示字符串所表示数字的基（进制）：

```js
parseInt('123', 10); // 123
parseInt('010', 10); // 10
```

如果调用时没有提供第二个参数（字符串所表示数字的基），则会根据字符串来确定进制，但是 2013 年以前的 JavaScript 实现会返回一个意外的结果：

```js
parseInt('010'); // 8
parseInt('0x10'); // 16
```

因为旧版本的 JavaScript 会认为 `'0'` 开头的数字字符串是八进制，而新版本只会认为 `'0o'`开头的数字字符串是八进制。

还有其它方法可以将字符串转换成数字：一元加号 `+`、以及 `Number` 函数，它们两个的效果是一样的。

> `parseInt` 和 `parseFloat` 方法会尝试逐个解析字符串中的字符，直到遇上一个无法被解析成数字的字符，然后返回该字符前所有数字字符组成的数字。而一元加号 `+` 和 `Number` 函数则是如果字符串中包含无法解析成数字的字符，结果都将会是 `NaN`。

### 字符串

JavaScript 中的字符串是一串 Unicode 字符的序列。更准确地说，是 UTF-16 编码单元的序列，而每个 Unicode 字符由 1 或 2 个编码单元来表示。

字符串的方法无法区分 Unicode 字符，只能按照 UTF-16 编码单元来拆分字符串：

```js
const t = '😄😂';
t.split('') === ['�', '�', '�', '�'];
```

而把字符串当作迭代器来使用的话，就可以根据 Unicode 字符来迭代字符串了：

```js
const t = '😄😂';
[...t] === ['😄', '😂'];
```

### 其它类型

JavaScript 中的 `null` 和 `undefined` 是不同的，前者代表空值（non-value），必须使用 `null` 关键字访问，后者是 “未定义” 类型的对象，表示未初始化的值，也就是尚未分配的值。

所有值都可以转换为布尔值，可能在判断中隐式转换或者使用 `Boolean` 函数显式转换，布尔值的转换规则为：

- `false`、`0`、空字符串 `''`、`NaN`、`null` 和 `undefined` 被转换为 `false`
- 其它值都被转换为 `true`

## 变量

在 JavaScript 中，可以通过 `let`、`const` 或 `var` 关键字来声明新变量。

`let` 语句可以声明一个块级作用域的变量，并可以使用一个值来初始化该变量。

```js
let a;
{
  let name = 'Simon';
}
a = name; // 抛出异常，因为这里不可访问 name 变量
```

`const` 语句用于定义一个不可变的常量（对于对象类型的值，对象的成员仍然可能是可修改的）。`const` 语句必须指定一个值来初始化变量。

`var` 是最常见的声明变量的关键字。它没有其他两个关键字的种种限制。这是因为它是传统上在 JavaScript 声明变量的唯一方法。使用 `var` 声明的变量在它所声明的整个函数都是可见的。

JavaScript 与其他语言的（如 Java）的重要区别是在 JavaScript 中语句块（blocks）是没有作用域的，只有函数有作用域。因此如果在一个复合语句中（如 if 控制结构中）使用 var 声明一个变量，那么它的作用域是整个函数（复合语句在函数中）。 但是从 ES6 开始将有所不同的， `let` 和 `const` 关键字允许你创建块作用域的变量。

## 运算符

二元加号 `+` 可以用来连接字符串，如果你用一个字符串加上一个数字（或其他值），那么操作数都会被首先转换为字符串。通过与空字符串相加，可以将某个变量快速转换成字符串类型。

## 对象

JavaScript 的对象可以简单理解成键值对，与其它语言的一些概念类似：

- Python 中的字典
- Perl 和 Ruby 的 Hash
- C/C++ 中的哈希表
- Java 中的 HashMap
- PHP 中的关联数组

JavaScript 中，几乎一切都是对象，所以 JavaScript 程序必然与大量的散列表查找操作有着千丝万缕的联系，而散列表擅长的正是高速查找。

## 数组

JavaScript 中的数组是一种特殊的对象。它的工作原理与普通对象类似（以数字为属性名，但只能通过 `[]` 来访问），但数组还有一个特殊的属性 —— `length`（长度）属性。这个属性的值通常比数组最大索引大 1。

注意，`Array.length` 并不总是等于数组中元素的个数，如下所示：

```js
var a = ['dog', 'cat', 'hen'];
a[100] = 'fox';
a.length; // 101
```

记住：数组的长度是比数组最大索引值多一的数。

数组的 `push`、`pop`、`shift`、`unshift` 方法可以数组头尾添加或删除元素（取出元素）。

数组的 `splice(index, deleteCount, ...insertItems)` 方法可以在数组指定位置删除或添加多个元素。

数组的 `sort([cmpfn])` 方法可以依据 cmpfn 返回的结果进行排序，如果未指定比较函数则按字符顺序比较（即使元素是数字）。
