---
title: JavaScript 中的闭包（Closures）
date: 2019-05-23 10:19:58
category:
  - JavaScript
tags:
  - JavaScript
toc: true
---

什么是闭包？哪里用得到闭包？

闭包是函数和声明该函数的词法环境的组合。

<!-- more -->

## 什么是闭包？

> 闭包是函数和声明该函数的词法环境的组合。
>
> ---- [JavaScript Reference](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)

### 词法作用域

考虑如下情况：

```js
function init() {
  var name = 'Mozilla'; // name 是 init 函数的局部变量
  // displayName() 是一个内部函数，是一个闭包
  function displayName() {
    console.log(name); // 使用了外部函数中的变量
  }
  displayName();
}
init();
```

这个例子说明词法作用域的范围，函数的词法作用域包括了函数自身的作用域以及定义该函数的位置的作用域。
也就是说，函数可以访问在其上层作用域中定义的变量。

### 闭包

再看一下这个例子：

```js
function makeFunc() {
  var name = 'Mozilla';
  function displayName() {
    console.log(name);
  }
  return displayName;
}
var myFunc = makeFunc();
myFunc();
```

在这个例子中，内部函数并没有直接执行，而是被外部函数返回。这个例子在 JavaScript 中是可行的。但是在一些其它的编程语言中，函数中的局部变量仅函数的其执行期可用，一旦函数执行完毕，函数中的局部变量将被销毁。但其实变量销毁的逻辑其实是一样的，都为了节省内存，在变量不可再被访问时，进行销毁。（比如这些语言的局部变量一定是在函数执行完毕就无法再被访问了，又比如一些语言的引用计数方式的 GC）

由于 JavaScript 中的函数会形成闭包，闭包可以访问其外层作用域，所以只要这些函数还能被访问到，外层作用域的变量就不会被销毁。由于我们还持有 `myFunc`（等同于 `displayName`，一个可以访问 `name` 变量的闭包），所以 `name` 变量不会被销毁。

下面是一个更有意思的例子：

```js
function makeAdder(x) {
  return function(y) {
    return x + y;
  };
}

var add5 = makeAdder(5);
var add10 = makeAdder(10);

console.log(add5(2)); // 7
console.log(add10(2)); // 12
```

在这个例子中，`add5` 和 `add10` 共享函数定义，但是各自有不同的词法环境。`add5` 的环境中，`x` 为 5，而 `add10` 中，`x` 为 10。

## 闭包的用处

闭包是一个很有用的特性，因为他可以将函数和其定义的环境联系起来。这个面向对象编程中，对象允许将其方法和其属性与其它方法联系起来有些相像。

### 函数工厂

在上面那个例子中，我们可以看到闭包的一种用法：函数工厂。根据不同参数，创建行为具有相同规则但是又不相同的函数，例如创建可以修改字体大小的函数，并且绑定到不同事件上面去：

```js
function fontSizeSetter(size) {
  return function() {
    document.body.style.fontSize = size + 'px';
  };
}

document.getElementById('font-size-12').onClick = fontSizeSetter(12);
document.getElementById('font-size-14').onClick = fontSizeSetter(14);
document.getElementById('font-size-16').onClick = fontSizeSetter(16);
```

### 模拟私有变量与方法

JavaScript 不像 Java 等一些其它语言，JavaScript 无法定义私有的变量或方法（即只能被同一个类访问的变量或方法）。

但是通过闭包，我们可以模拟相同的效果。例如：

```js
var Counter = (function() {
  var privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }
  return {
    increment: function() {
      changeBy(1);
    },
    decrement: function() {
      changeBy(-1);
    },
    value: function() {
      return privateCounter;
    }
  };
})();

console.log(Counter.value()); // 0
Counter.increment();
Counter.increment();
console.log(Counter.value()); // 2
Counter.decrement();
console.log(Counter.value()); // 1
```

这个例子中，`Counter` 对象有三个方法：`increment`、`decrement` 和 `value`，并且除了这三个方法，没有地方再可以访问 `privateCounter` 与 `changeBy`。

像这种通过闭包来定义公共函数，并使其可以访问私有变量和函数的方式，通常被称为*模块模式（Module Pattern）*。

再举一个更加面向对象一些的例子：

```js
function Counter(initValue) {
  var privateCounter = initValue || 0;
  return {
    increment() {
      privateCounter += 1;
      return this;
    },
    decrement() {
      privateCounter -= 1;
      return this;
    },
    get value() {
      return privateCounter;
    }
  };
}

const counter1 = new Counter();
counter1.increment().increment().value; // 2
counter1.decrement().value; // 1

const counter2 = new Counter(counter1.value);
counter2.increment().value; // 2
counter2.increment().decrement().value; // 2
```

运用 `class` 语法的版本：

```js
class Counter {
  constructor(initValue = 0) {
    let privateCounter = initValue;
    function makeChainableChanger(value) {
      return function() {
        privateCounter += value;
        return this;
      };
    }
    return {
      increment: makeChainableChanger(1),
      decrement: makeChainableChanger(-1),
      get value() {
        return privateCounter;
      }
    };
  }
}
```

## 闭包的常见错误

在 ECMAScript 2015 引入 `let` 关键字之前，在循环中有一个常见的闭包创建问题。

示例如下：

```js
function showHelp(help) {
  document.getElementById('help').innerHTML = help;
}

function setupHelp() {
  var helpText = [
    { id: 'email', help: 'Your e-mail address' },
    { id: 'name', help: 'Your full name' },
    { id: 'age', help: 'Your age (you must be over 16)' }
  ];

  for (var i = 0; i < helpText.length; i++) {
    var item = helpText[i];
    document.getElementById(item.id).onfocus = function() {
      showHelp(item.help);
    };
  }
}

setupHelp();
```

这个例子中，每个循环创建了一个闭包，由于在循环中被创建，这 3 个闭包共享了相同的词法环境（循环的词法环境），在这些闭包被调用时，循环早已结束，词法环境中的 `item` 已经指向了 `helpText` 的最后一项。

解决这个问题有很多种办法，比如可以通过引入更多闭包解决：

```js
function showHelp(help) {
  document.getElementById('help').innerHTML = help;
}

function showHelpCallback(item) {
  return function() {
    showHelp(item.help);
  };
}

function setupHelp() {
  var helpText = [
    { id: 'email', help: 'Your e-mail address' },
    { id: 'name', help: 'Your full name' },
    { id: 'age', help: 'Your age (you must be over 16)' }
  ];

  for (var i = 0; i < helpText.length; i++) {
    var item = helpText[i];
    document.getElementById(item.id).onfocus = showHelpCallback(item);
  }
}

setupHelp();
```

或者使用匿名闭包：

```js
function showHelp(help) {
  document.getElementById('help').innerHTML = help;
}

function setupHelp() {
  var helpText = [
    { id: 'email', help: 'Your e-mail address' },
    { id: 'name', help: 'Your full name' },
    { id: 'age', help: 'Your age (you must be over 16)' }
  ];

  for (var i = 0; i < helpText.length; i++) {
    (function() {
      var item = helpText[i];
      document.getElementById(item.id).onfocus = function() {
        showHelp(item.help);
      };
    })();
  }
}

setupHelp();
```

而更好的方法是，使用 `let` 关键词将变量声明到块作用域（循环的块作用域是每一次循环独立的）而不是整个循环上。（所以在很多项目的规范中，要求永远不要使用 `var` 关键词）

```js
function showHelp(help) {
  document.getElementById('help').innerHTML = help;
}

function setupHelp() {
  const helpText = [
    { id: 'email', help: 'Your e-mail address' },
    { id: 'name', help: 'Your full name' },
    { id: 'age', help: 'Your age (you must be over 16)' }
  ];

  for (let i = 0; i < helpText.length; i++) {
    let item = helpText[i];
    document.getElementById(item.id).onfocus = function() {
      showHelp(item.help);
    };
  }
}

setupHelp();
```

## 性能考量

> 如果不是某些特定任务需要使用闭包，在其它函数中创建函数是不明智的，因为闭包在处理速度和内存消耗方面对脚本性能具有负面影响。
>
> 例如，在创建新的对象或者类时，方法通常应该关联于对象的原型，而不是定义到对象的构造器中。原因是这将导致每次构造器被调用时，方法都会被重新赋值一次（也就是，每个对象的创建）。
>
> ---- [JavaScript Reference](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures#Performance_considerations)

考虑以下示例：

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
  this.getName = function() {
    return this.name;
  };
  this.getMessage = function() {
    return this.message;
  };
}
```

在上面的代码中，我们并没有利用到闭包的好处，因此可以避免使用闭包。修改成如下：

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype.getName = function() {
  return this.name;
};
MyObject.prototype.getMessage = function() {
  return this.message;
};
```
