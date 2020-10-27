---
title: 理解 Node.js 中的垃圾回收机制
toc: true
categories:
  - Node.js
tags:
  - Node.js
  - Performance
date: 2019-06-21 14:15:21
---

虽然 Node.js 的学习曲线非常平坦，但是保持 Node.js 运行的机制非常复杂。为了避免一些性能缺陷，我们必须理解其机制。

这篇文章将介绍 Node.js 的内存管理方式。

<!-- more -->

V8 引擎是 Google 为 Chrome 浏览器而开发 JavaScript 引擎，但同时也可以脱离 Chrome 独立使用。Node.js 内部就是使用了 V8 引擎来执行 JavaScript 代码。

在 Node.js 中 V8 引擎负责编译并执行 JavaScript 代码、为 JavaScript 的变量和对象分配内存以及进行垃圾回收。

## V8 的内存管理机制

像 C 这样的语言是将内存管理全权交给开发者来管理，开发者来决定分配多少的内存并何时释放，一旦开发者忘记释放，那么这片内存将永远被占用，且无法使用。而在 JavaScript 中，内存管理是交给引擎来做的，开发者不必考虑何时去释放不再使用的内存。

在 V8 引擎中，是通过垃圾回收机制来管理内存的。垃圾回收机制通过定期检查来找出那些已经无法被访问到的对象来清楚它们使用的内存。

通过自动的垃圾回收机制，我们不需要再管理内存，可以更加专注于应用的逻辑。但是同时，如果我们对其机制不了解，就可能会写出具有缺陷的代码，造成内存泄漏。

### V8 的内存分配结构

V8 中为 JavaScript 所分配的内存空间称为常驻内存集（Resident Set），其中包括用于存放代码逻辑的代码段（Code Segment，这里是存放包含 JIT 指令处理过的特殊对象），用于存放局部变量或引用的栈（Stack）以及用于存放对象与闭包的堆（Heap）。

![V8的内存结构](/images/posts/v8-gc-memory.png)

在 Node.js 中，可以通过内置 API 来获取内存使用信息：

```js
console.log(process.memoryUsage());
// { rss: 23752704,
//   heapTotal: 9682944,
//   heapUsed: 5774144,
//   external: 33920 }
```

其中：

- 'rss'（Resident Set Size）代表常驻内存集的大小
- 'heapTotal' 代表堆大小
- 'heapUsed' 代表堆中已使用空间的大小（用来判断内存泄漏）
- 'external' 代表 V8 引擎内部的 C++对象所占用的空间

由于 V8 是为浏览器开发的引擎，不太可能会遇到使用大量内存的场景，所以它默认的可分配内存上线设置的不大，64 位系统下约为 1.4GB，32 位系统中约为 700MB。

### V8 的垃圾回收机制

回看 JavaScript 中的垃圾回收机制，一般分为两种：引用计数机制与标记清除机制。其中 IE6 使用的是引用计数机制，现代浏览器使用的都是标记清除机制。

#### 引用计数机制（IE6 等）

引用计数机制记录对每个对象的引用的数量，当数量为 0 时，引用计数机制就认为可以清除这个对象了。

引用计数机制有一个很严重的缺陷：循环引用导致的内存泄漏。

例如：

```js
function showPitfall() {
  const a = {};
  const b = {};
  a.b = b;
  b.a = a;
}
```

在这个例子中，a 和 b 对对方都有一个引用，因此在函数执行完后，它们的引用计数也不为 0，将永远不会被清除。

但其实我们经常在写隐含着循环引用的代码，例如：

```js
const element = document.querySelector('#el');
element.onclick = function onclick(event) {
  console.log('#el is clicked.');
};
```

这个例子中，onclick 函数形成了一个可以访问 element 的闭包，而 element 上又绑定了 onclick 这个函数，element 与闭包之间形成了循环引用。

#### 标记清除机制（V8 等）

标记清除算法在对象中添加一个标记，通过对可访问的对象设置标记来识别出那些不可被访问的对象。

通常标记清楚算法会选取一些根节点，比如 window 对象，然后将所有根节点及其子节点标记为活跃，所有从根节点可访问的对象都视为不可删除。

所有没有被标记的对象都是可以清除的。

现代浏览器的引擎通过不同的方法来优化这个机制，但本质都是一样的。

在这种机制下，内存泄漏通常是由于我们保存了不必要的引用。

比如：

1. 不必要的全局变量，比如在宽松语法下意外声明的全局变量（未使用声明关键字或者不正确地使用 this 关键字）

   ```js
   function foo() {
     bar = 'This is an implicit global variable';
     this.bar = 'This is an implicit global variable via this';
   }
   foo();
   ```

2. 忘记清除地计时器或者其他回调

   ```js
   function startSettingHTML() {
     const someData = getData();
     setInterval(function() {
       const node = document.querySelector('#node');
       if (node) {
         node.innerHTML = JSON.stringify(someData);
       }
     }, 1000);
   }
   startSettingHTML();
   ```

   这个例子中，计时器的回调函数产生了一个可以访问 someData 的闭包，由于计时器没有被清除，即使 #node 元素不再存在，这个回调不再有意义，someData 也不会被清除。

3. 保留了 DOM 节点的引用

   有时候为了方便使用，会在代码中保存对 DOM 节点的引用。如果你忘记清除该引用，那么由于子节点会保留父节点的引用，即使父节点从 DOM 树中移除，子节点这条链上的元素都无法被清除。（比如保留 tr 元素的引用，之后删掉整个 table，但是 table 还会一直在内存里）

   ```js
   window.inputs = {};
   window.forms = {};
   // ...
   forms.login = document.querySelector('#login-form');
   inputs.password = forms.login.querySelector('.password-input');
   inputs.password.onkeyup = validatePassword;
   // ...
   function onLogin() {
     forms.login.remove(); // forms is just like inputs, stores DOM elements.
     froms.login = null;
   }

   // 只要 inputs.password 不清除，#login-form 就一直无法清除
   ```

4. 闭包

   ```js
   let theThing = null;
   let replaceThing = function() {
     let originalThing = theThing;
     let unused = function() {
       if (originalThing) {
         console.log('originalThings exists.');
       }
     };
     theThing = {
       longString: '*'.repeat(1000000),
       someMethod() {
         console.log('some message');
       }
     };
   };
   setInterval(replaceThing, 1000);
   ```

   这是个由微妙的方式导致内存泄漏的例子（Metero 的开发者发现了这个漏洞，并在[这篇文章](https://blog.meteor.com/an-interesting-kind-of-javascript-memory-leak-8b47d2e7f156)中有详细描述）。V8 可以识别闭包中是否使用了变量，但是这个例子中，unused 和 someMethod 共享了闭包作用域，而 unused 中使用了 originalThing，迫使 originalThing 处于活跃状态。

### V8 的垃圾回收策略

标记擦除机制会对所有可访问的对象进行标记，这在对象较多时是一个很耗时的操作，V8 通过分代管理内存的方式来降低这个消耗。

分代内存基于一种假设：大部分新生对象倾向于早死，无法存活多次 GC 周期；能够存活多个 GC 周期的对象都比较长寿。

V8 的分代内存管理就是将堆内存空间划分为新生代（New Generation）空间和老生代（Old Generation）空间，对它们采用不同的垃圾回收算法。

- 新生代的对象存活时间较短，为经历过 0 次或 1 次 GC 的对象。
- 老生代的对象存活时间较长，为经历过 2 次或以上 GC 的对象。

默认情况下，64 位系统下，新生代空间为 32MB，老生代空间为 1.4GB，32 位系统下，新生代空间为 16MB，老生代空间为 700MB。

将新生代中的对象转移到老生代的过程称为晋升。

#### 新生代的内存管理算法

1、分配方式

新生代存放的都是生存周期短的对象，分配内存也比较容易，只保存一个指向内存空间的指针，根据分配对象大小递增指针即可，当存储空间快要满时，进行一次垃圾回收。

2、垃圾回收算法

新生代采用 Scavenge 垃圾回收算法，算法实现时主要采用 Cheney 算法。

Cheney 算法将内存均分为两个 semispace，一块处于使用状态（称为 From 空间），一块处于闲置状态（称为 To 空间）。

Cheney 算法的过程如下：

1. 从 From 空间分配对象，如果 From 空间被占满，则执行 Scavenge 算法进行垃圾回收。
2. 检查 From 空间的存活对象，如果对象存活，检查是否满足晋升条件，如果满足则晋升到老生代，不满足则复制到 To 空间。
3. 如果对象不存活，则释放其使用的空间。
4. 完成上述过程后，反转 From 空间与 To 空间。

![新生代GC过程示意图](/images/posts/v8-gc-young-generation.png)

#### 对象晋升条件

对象晋升的条件有两个：

1. 对象是否经历过 Scavenge 回收。如果已经经历过一次 Scavenge，则将对象晋升，否则复制到 To 空间。
2. To 空间的使用率是否超过限制（25%）。如果超过 25%的限制，则直接分配至老生代。设置 25% 的原因是，如果反转 semiplace 之后，空间占用比过高，会影响后续内存分配。

#### 老生代的内存管理算法

老生代与新生代不同，不适合用 Scavenge 算法进行垃圾回收：

1. 老生代的存活对象的比例更高，复制存活对象的操作会很多
2. 老生代的空间远大于新生代，采用 Scavenge 算法将空间分为两部分将造成很大的浪费。

老生代内存空间的垃圾回收有两种方式：标记清除（Mark Sweep）和标记合并（Mark Compact）。

1、标记清除

标记清除算法在标记阶段对死掉的对象进行标记，并且在回收阶段直接释放掉对应的内存空间。

标记清除算法只清除死掉的对象，Scavenge 算法只复制存活的对象，而在老生代中死对象的比例较低，新生代中存活对象的比例较低，所以这两种算法都能够较高效地进行垃圾回收。

但是，标记清除这种方式会产生内存空间碎片化（占用空间不连续）的问题。

![标记清除过程示意图](/images/posts/v8-gc-mark-sweep.png)

2、标记合并

为了解决标记清除的空间碎片化问题，我们需要引入标记合并算法。

标记合并算法在标记阶段和标记清除一样，对死对象进行标记，在回收阶段，将存活的对象向内存空间的一端移动，然后直接将这部分之外的内存占用全部清除掉。

![2、标记合并过程示意图](/images/posts/v8-gc-mark-compact.png)

3、两者的结合

很明显，标记合并涉及到很多内存复制操作，效率要比标记清除低很多。

在 V8 中，老生代主要使用标记清除进行垃圾回收，只有当空间不足以从新生代晋级新对象的时候才会使用标记合并算法。

## 总结

1. Node.js 中的的垃圾回收就是 V8 的垃圾回收
2. V8 主要使用标记清除算法
3. V8 的堆分为两块：新生代与老生代
4. 新生代存放没有或仅经历一次 GC 的对象，使用 Scavenge 算法进行 GC
5. 老生代存放从新生代晋升的对象，结合标记清除与标记合并两种算法进行 GC
