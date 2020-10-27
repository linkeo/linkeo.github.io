---
title: Rust学习笔记1
toc: true
categories:
  - Rust
tags:
  - Rust
date: 2020-10-09 11:46:04
---

本文是 Rust 学习笔记系列第一篇，参考 Rust 指南的第 2 到 3 章，涉及变量、数据类型、函数、注释、控制流。

<!-- more -->

## 变量

Rust 中用 `let` 关键字定义变量，变量默认都是不可变的，用 `let mut` 定义可变的变量。（可变变量必须显式使用 `mut` 声明，这是 Rust 从安全方面的考虑）

不可变的变量一旦初始化就不能再被改变。

```rust
fn main() {
  let foo = 5; // 不可变
  let mut bar = 5; // 可变

  let x;
  x = 5;
}
```

### 常量

和不可变变量类似，常量也是将一个不可变的值绑定到标识符。

常量用 `const` 关键字定义，无法用 `mut` 将常量定义为可变，且常量的类型必须显式指定。

```rust
const MAX_POINTS: u32 = 100_000;
```

> Rust 的命名习惯是将常量定义为大写字母加下划线的风格

常量在程序执行过程中一直存在，在其定义的作用域中有效。

### 变量覆盖（Shadowing）

Rust 可以在同一个作用于中定义相同名称的变量，然后先定义的变量将无法在被访问到。

```rust
fn main() {
  let x = 5;
  let x = x + 1;
  let x = x * 2;
}
```

变量覆盖与可变变量不同，当无意中在未使用 `let` 关键字的情况下为变量赋值时将产生编译错误。并且使用变量覆盖时可以换一个新的类型。

## 数据类型

Rust 中所有的值都有类型，类型分为标量类型和复合类型。

Rust 是一种静态类型语言，也就是说 Rust 必须在编译期知道所有变量的类型。通常编译器可以从值或者其用法推断出类型，但是当有多种可能的类型时，就需要显式声明变量的类型了。

```rust
let guess: u32 = "42".parse().expect("Not a number!");
```

### 标量类型（Scalar Type）

标量类型代表一个单独的值。Rust 有 4 种基础标量类型：整数、浮点数、布尔值、字符。

#### 整数

整数类型可以用于表示不含小数部分的数字。根据是否有符号以及存储空间大小区别，分为以下 12 种变种：

| 长度                                    | 有符号  | 无符号  |
| --------------------------------------- | ------- | ------- |
| 8 位                                    | `i8`    | `u8`    |
| 16 位                                   | `i16`   | `u16`   |
| 32 位                                   | `i32`   | `u32`   |
| 64 位                                   | `i64`   | `u64`   |
| 128 位                                  | `i128`  | `u128`  |
| 与当前运行环境的架构一致(32 位或 64 位) | `isize` | `usize` |

所有的变种都具备有符号或无符号的约束，且有一个固定的存储空间大小。有符号的整数使用二进制补码的方式存储，有效值范围为 $-(2^{n-1})$ 到 $2^{n-1}-1$（$n$ 为存储空间位数）；无符号的整数有效值范围为 $0$ 到 $2^n-1$（$n$ 为存储空间位数）。

以下字面量可以用于表示整数：

| 字面量类型               | 例子            |
| ------------------------ | --------------- |
| 十进制                   | `1024`          |
| 十六进制                 | `0x400`         |
| 八进制                   | `0o2000`        |
| 二进制                   | `0b10000000000` |
| 字节（仅用于 `u8` 类型） | `b'A'`          |

除了字节字面量，其他的字面量都可以用整数变种名作为后缀，并且可以用`_`作为数字的分隔符，例如：`1024u16`，`1_024`。

如果不确定要用哪一种整数变种，可以让 Rust 使用默认的`i32`，即使是在 64 位系统中，也通常是运算最快的。`isize` 和 `usize` 的主要使用场景是作为某种集合的索引类型。

> 如果尝试给整数赋值超出有效范围的值，会导致整数溢出。Rust 在 debug 模式下溢出会崩溃，release 模式下溢出则不会产生崩溃，但是可能会与预期值不一致。

#### 浮点数

Rust 的浮点数分为两种：`f32` 和 `f64`。和整数一样，这两种类型仅在存储空间大小上有区别。默认的浮点数类型为 `f64`，因为在现代 CPU 中，32 位浮点数与 64 位浮点数运算速度相差无几，而 64 位可以提供更高的精度。

```rust
fn main() {
  let x = 2.0; // f64
  let y: f32 = 3.0; // f32
}
```

浮点数使用 IEEE-754 标准来表示，`f32` 为单精度浮点数，`f64` 为双精度浮点数。

#### 数学运算

Rust 为所有的数字类型提供数学基本运算：加减乘除与取余。

```rust
fn main() {
  let sum = 5 + 10;
  let difference = 95.5 - 4.3;
  let product = 4 * 30;
  let quotient = 56.7 / 32.2;
  let remainder = 43 % 5;
}
```

#### 布尔类型

与大部分其他语言一样，Rust 的布尔值类型有两个可能值：`true` 和 `false`。布尔值使用 1 个字节的存储空间。

```rust
fn main() {
  let t = true;
  let f: bool = false;
}
```

布尔值主要用于条件判断，比如 `if` 表达式。

#### 字符类型

Rust 中的 `char` 类型是最基本的文本类型，字符字面量使用单引号（字符串则是双引号）：

```rust
fn main() {
  let c = 'z';
  let z = 'ℤ';
  let heart_eyed_cat = '😻';
}
```

Rust 的 `char` 类型使用 4 个字节存储，表示一个 Unicode 标量（UTF-32）。在 Rust 中字母变种、中文、日文、韩文、Emoji，零宽度空格都是一个有效的 `char` 值。Unicode 标量的有效范围为 `U+0000` 到 `U+D7FF` 和 `U+E000` 到 `U+10FFFF`。然而 Unicode 中并没有字符的概念，所以一般所说的字符可能和 `char` 会有出入。

### 复合类型（Compound Type）

复合类型用于将多个值组合成一个类型。Rust 有两个基本复合类型：元组（tuple）与数组（array）

#### 元组

元组用于将多个值组合成一个类型，这些值可以是不同的类型。Rust 是一种静态类型语言，每个元组类型拥有固定个数的值，并且对应位置的值的类型也是确定的。

```rust
fn main() {
  let tup: (i32, f64, u8) = (500, 6.4, 1);
  let tup = (500, 6.4, 1);

  let (x, y, z) = tup; // 通过解构取出元组中的值
  let x2 = tup.0; // 直接按位置取出元组中的值
}
```

#### 数组

与元组不同，数组的所有元素必须是同一种类型。与其他的一些语言不同，Rust 中的数组是固定长度的。

```rust
fn main() {

  let arr = [1, 2, 3, 4, 5];
  let arr: [i32; 5] = [1, 2, 3, 4, 5]; // 数组的类型语法：[type; length]

  // 另一种数组字面量，用于创建包含重复元素的数组
  let arr: [i32; 5] = [1; 5]; // 等同于 [1, 1, 1, 1, 1]

  let first = arr[0]; // 使用下标访问数组元素
  let second = arr[1];
}
```

数组下标越界会产生编译错误。

## 函数

Rust 中用 `fn` 关键字定义函数。最重要的函数是 `main` 函数，是整个程序的入口。

Rust 中函数和变量使用小写下划线的命名风格。

```rust
fn main() {
  println!("Hello, world!");
  another_function();
}

fn another_function() {
  println!("Another function.");
}
```

Rust 中的函数调用不关心函数定义的顺序。

### 函数的参数

函数的参数必须显式指定类型。

```rust
fn main() {
  another_function(5, 6);
}

fn another_function(x: i32, y: i32) {
  println!("The value of x is: {}", x);
  println!("The value of y is: {}", y);
}
```

### 函数体，语句与表达式

函数体由一系列的语句构成，可以由一个表达式结尾。Rust 是一种基于表达式的语言，能区分语句与表达式的区别尤为重要。

语句指的是执行某些动作的操作，并不返回值；而表达式会有一个值作为结果。

参数定义和函数体都是语句的一种。

```rust
fn main() { // fn statement
  let y = 6; // let statement
}
```

与其他语言不同，Rust 中赋值语句不产生结果，因此诸如 `x = y = 5` 的写法在 Rust 中行不通。

表达式可以是语句的一部分。

函数调用、宏调用、块都是表达式的一种。

```rust
fn main() {
  let x = 5;

  let y = { // block expression
    let x = 3;
    x + 1 // 结尾表达式，如果加`;`会变成语句
  };

  println!("The value of y is: {}", y);
}
```

块可以创建新的作用域，块表达式的值是其结尾表达式的值。

### 函数的返回值

函数可以给调用自己的地方返回一个值，返回值没有名称，但是需要定义类型。在 Rust 中，函数的返回值是作为函数体的块的值（即结尾表达式的值），但是可以用 `return` 关键字提前返回结果。

```rust
fn five() -> i32 {
  5
}

fn main() {
  let x = five();
  println!("The value of x is: {}", x);
}
```

### 注释

和其他一些语言一样，Rust 使用 `// some words`、`/* some words */` 表示注释，还有一种文档注释，之后再说。

## 控制流

### `if` 表达式

```rust
fn main() {
  let number = 3;

  if number < 5 {
    println!("condition was true");
  }

  if number < 5 {
    println!("condition was true");
  } else {
    println!("condition was false");
  }

  if number % 4 == 0 {
    println!("number is divisible by 4");
  } else if number % 3 == 0 {
    println!("number is divisible by 3");
  } else if number % 2 == 0 {
    println!("number is divisible by 2");
  } else {
    println!("number is not divisible by 4, 3, or 2");
  }

  let number_at_least_5 = if number > 5 { 5 } else { number }
}
```

`if` 表达式的值为执行的那个块的值，`if` 语句的所有块的值类型必须一致。

### 循环

Rust 有三种循环：`loop`、`while`、`for`。

#### `loop` 循环

`loop` 关键字会循环执行一个块，直到使用 `break` 关键字中止循环。

```rust
fn main() {
  loop {
    println!("again!");
  }
}
```

##### `loop` 的返回值

使用 `break` 关键字中止循环，`break` 后面接的值就是 `loop` 的值。

```rust
fn main() {
  let mut counter = 0;

  let result = loop {
    counter += 1;

    if counter == 10 {
      break counter * 2;
    }
  };

  println!("The result is {}", result);
}
```

#### `while` 循环

`while` 关键字会重复检查条件，当条件满足时，执行作为循环体的块，否则中止循环。

```rust
fn main() {
  let a = [10, 20, 30, 40, 50];
  let mut index = 0;

  while index < 5 {
    println!("the value is: {}", a[index]);

    index += 1;
  }
}
```

`while` 循环没有返回值。

#### `for` 循环

`for` 关键字会遍历一个集合

```rust
fn main() {
  let a = [10, 20, 30, 40, 50];

  for element in a.iter() {
    println!("the value is: {}", element);
  }

  for number in (1..4).rev() {
    println!("{}!", number);
  }
  println!("LIFTOFF!!!");
}
```

`for` 循环没有返回值。
