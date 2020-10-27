---
title: JavaScript 中的继承与原型链
toc: true
categories:
  - JavaScript
tags:
  - JavaScript
  - OOJS
date: 2019-06-12 21:36:07
---

对于使用过基于类的面向对象语言（如 Java 或 C++）的开发者而言，JavaScript 中的继承可能有些奇怪，因为它是动态的，并且没有类的概念。

尽管 JavaScript 基于原型的继承模型通常被认为是 JavaScript 弱点，但其实这比经典的基于类的模型要更加强大。

<!-- more -->

## 原型链

JavaScript 的对象是动态的属性集合，其中有一个属性用于指向其原型对象。这种类似链表的结构被称为原型链。

> 根据 ECMAScript，`[[Prototype]]` 符号用于指向对象的原型。 从 ECMAScript 6 开始，可以通过 `Object.getPrototypeOf()` 和 `Object.setPrototypeOf()` 来访问对象的原型。而非标准属性 `__proto__` 也用访问对象的原型。
>
> 这与构造函数的`prototype`属性不同。使用构造函数构造的实例对象的原型（`[[Prototype]]`）是构造函数的 `prototype`。`Object.prototype` 属性表示 `Object` 的原型对象，通常是原型链最后一层。

### 属性继承

当访问一个对象的属性时，不仅会在该对象中查找属性，也会顺着原型链一层层地查找，直到找到一个名字匹配的属性或者达到原型链末尾。而设置对象的属性时，将直接在当前对象中创建或修改属性（**除非该属性设置了 getter 或 setter**）。

示例：

```js
const A = function() {
  this.a = 1;
  this.b = 2;
  this.c = 3;
  this.d = 4;
};
A.prototype.b = 5;
Object.defineProperty(A.prototype, 'c', {
  get() {
    return 6;
  }
});
let d = 7;
Object.defineProperty(A.prototype, 'd', {
  get() {
    return d;
  },
  set(value) {
    d = value;
  }
});

const a = new A();
// 原型链为 a { a: 1, b: 2 } -> A.prototype { b: 4, c: 5, d: 7 } -> Object.prototype -> null

console.log(a.a); // 1
console.log(a.b); // 2
console.log(a.c); // 6
console.log(a.d); // 4
console.log(a.e); // undefined
console.log(A.prototype.b); // 5
console.log(A.prototype.c); // 6
console.log(A.prototype.d); // 4
```

注：

- a 中的 b 属性覆盖了原型上的 b 属性，这种情况叫做属性遮蔽（Property Shadowing）。
- 只定义 getter 的属性无法修改，也无法遮蔽。
- 定义了 setter 的属性将按照 setter 定义的方式去修改，不会进行遮蔽。

### 方法继承

JavaScript 中其实并没有基于类的方法这一概念。在 JavaScript 中，我们把函数类型的属性称为方法。方法的继承和其他属性没有差别，包括属性遮蔽（这时候相当于方法的覆写）。

**当继承的函数被调用时，`this` 指向当前对象，而不是继承的函数所在的原型对象。**

示例：

```js
const parent = {
  val: 2,
  add(val) {
    this.val += val;
  }
};
const child = Object.create(parent); // 创建一个以 parent 为原型的对象
child.val = 4;
child.add(4);

console.log(child.val); // 8
console.log(parent.val); // 2
```

### 构造函数的 prototype 属性

我们知道，JavaScript 中的函数也是对象的一种，函数也可以定义属性。而每一个函数都有一个特殊的属性 ---- "prototype"，用于表示当这个函数用作构造函数时，所构造的对象的原型对象。

prototype 属性默认包括两个属性：

- "constructor" 属性，指向原来那个函数
- "\_\_proto\_\_" 属性，指向这个原型对象的原型（如之前所说，这是一个非标准属性）

## 通过不同方式创建对象并生成原型链

### 使用字面量或者函数语法

```js
const object = { a: 1 };
// object
// -> Object.prototype { hasOwnProperty, ... }
// -> null

const array = [2, 3, 4];
// array
// -> Array.prototype { indexOf, forEach, ... }
// -> Object.prototype -> null

const func = () => 5;
// func
// -> Function.prototype { call, bind, ...}
// -> Object.prototype -> null
```

### 构造函数

```js
function Graph() {
  this.vertices = [];
  this.edges = [];
}
Graph.prototype.addVertex = function(v) {
  this.vertices.push(v);
};

const g = new Graph();
// g
// -> Graph.prototype { addVertex }
// -> Object.prototype -> null
```

### Object.create

```js
const a = { a: 1 };
// a -> Object.prototype -> null

const b = Object.create(a);
// b -> a -> Object.prototype -> null

const c = Object.create(b);
// c -> b -> a -> Object.prototype -> null

const d = Object.create(null);
// d -> null

d.hasOwnProperty();
// 报错，因为 d 没有继承 Object.prototype
```

### class 关键字

ECMAScript 引入了一套新的关键字，可以让开发者用于使用基于类风格的语法来编写代码。但是这只是语法糖，其内部实现仍然是基于原型的。

这些关键字包括：`class`, `constructor`, `static`, `extends` 和 `super`。

```js
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  get area() {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  constructor(sideLength) {
    super(sideLength, sideLength);
  }
  get sideLength() {
    return this.width;
  }
  set sideLength(newValue) {
    this.width = newValue;
    this.height = newValue;
  }
}

const square = new Square(2);
// square { width, height }
// -> Square.prototype { sideLength }
// -> Rectangle.prototype { area }
// -> Object.prototype -> null
```

### 性能

在原型链上查找属性比较耗时，对性能有副作用，这在性能要求苛刻的情况下很重要。另外，试图访问不存在的属性时会遍历整个原型链。

遍历对象的属性时，原型链上的每个可枚举属性都会被枚举出来。要检查对象是否具有自己定义的属性，而不是其原型链上的某个属性，则必须使用所有对象从 `Object.prototype` 继承的 `hasOwnProperty` 方法，或者使用 `Object.keys()`。

注意：检查属性是否为 `undefined` 是不能够检查其是否存在的。该属性可能已存在，但其值恰好被设置成了 `undefined`。

### 扩充原生对象的原型

经常使用的一个错误实践是扩展 Object.prototype 或其他内置原型。

这种技术被称为猴子补丁并且会破坏封装。尽管一些流行的框架（如 Prototype.js）在使用该技术，但仍然没有足够好的理由使用附加的非标准方法来混入内置原型。

扩展内置原型的唯一理由是支持 JavaScript 引擎的新特性（polyfill），如 `Array.forEach`。

### 比较四种扩展原型链的方法

- 使用构造的实例

  ```js
  function foo() {}
  foo.prototype = { foo: 'foo' };

  function bar() {}
  const proto = new foo();
  proto.bar = 'bar';
  bar.prototype = proto;

  const inst = new bar();
  // inst
  // -> bar.prototype (proto) -> foo.prototype
  // -> Object.prototype -> null
  ```

  优点：支持目前以及所有可想象到的浏览器(IE5.5 都可以使用). 这种方法非常快，非常符合标准，并且充分利用 JIST 优化。

  缺点：在初始化 foo 构造函数的过程中，可能会想设置一些实例属性，但是 foo 的构造器只会执行一次，可能会引发潜在的问题。

- Object.create

  ```js
  function foo() {}
  foo.prototype = { foo: 'foo' };

  function bar() {}
  bar.prototype = Object.create(foo.prototype, { bar: { value: 'bar' } });

  const inst = new bar();
  // inst
  // -> bar.prototype -> foo.prototype
  // -> Object.prototype -> null
  ```

  优点：支持所有流行的浏览器，包括 IE9 及以上。仅对原型进行一次修改，可以让浏览器进行更好的优化，也支持创建没有原型的对象。

  缺点：IE8 及以下不可使用。使用第二个参数进行属性设置的时候可能会耗费大量时间，因为对每个属性的描述也是一个对象，对成百上千个属性的设置可能造成延迟。

- Object.setPrototypeOf

  ```js
  function foo() {}
  foo.prototype = { foo: 'foo' };

  function bar() {}
  bar.prototype = Object.setPrototypeOf({ bar: 'bar' }, foo.prototype);

  const inst = new bar();
  // inst
  // -> bar.prototype -> foo.prototype
  // -> Object.prototype -> null
  ```

  优点：支持所有流行的浏览器，包括 IE9 及以上。允许动态修改对象的原型，甚至给没有原型的对象设置原型。

  缺点：应当被禁用，且会造成严重的性能问题。因为许多浏览器对原型进行优化，而动态修改原型打乱了这些优化，甚至导致浏览器重新编译并优化代码。且 IE8 及以下不可使用。

- \_\_proto\_\_

  ```js
  const inst = {
    __proto__: {
      bar: 'bar',
      __proto__: {
        foo: 'foo',
        __proto__: Object.prototype
      }
    }
  };
  // inst
  // -> bar.prototype -> foo.prototype
  // -> Object.prototype -> null
  ```

  优点：支持所有流行的浏览器，包括 IE11 及以上。允许动态修改对象的原型，甚至给没有原型的对象设置原型。而且给一个不是对象的值设置 \_\_proto\_\_ 属性会什么都不做而不会导致异常。

  缺点：应当被禁用，且会造成严重的性能问题。因为许多浏览器对原型进行优化，而动态修改原型打乱了这些优化，甚至导致浏览器重新编译并优化代码。且 IE10 及以下不可使用。

## 动态性

对于 Java 或 C++ 的开发者来说，JavaScript 可能会使人困惑，因为一切都是动态的，运行时的。

在构造函数的 prototype 中设置的属性可以共享给所有构造出来的实例。

而甚至在实例构造之后，仍可以修改 prototype 的属性，其修改将影响所有继承该原型的对象（除非属性被遮蔽）。

## 总结

在编写使用它的复杂代码之前，理解原型继承模型是**至关重要**的。此外，请注意代码中原型链的长度，并在必要时将其分解，以避免可能的性能问题。此外，原生原型**不应该**被扩展，除非它是为了与新的 JavaScript 特性兼容。
