---
title: Node.js 中的事件循环
date: 2019-05-27 20:02:58
toc: true
categories:
  - Node.js
tags:
  - Node.js
  - Event
---

Node.js 中有一些用于稍后执行的函数，比如 `setTimeout(fn, ms)`，`setImmediate(fn)` 以及 `process.nextTick(fn)`。如何区分它们，将与 Node.js 的事件循环机制息息相关。

<!-- more -->

本文主要参考[另一篇文章](http://www.imooc.com/article/27083?block_id=tuijian_wz)进行转述。

## 一些常见的误解

- **事件循环是 JS 引擎来处理的**

  最常见的误解就是，事件循环是 JavaScript 引擎（V8、SpiderMonkey 等）的一部分。实际上，事件循环只用到 JS 引擎来执行 JavaScript 代码。Node.js 的事件循环是由 libuv 来完成的。

- **有一个栈或者队列来管理回调函数**

  首先排除用栈，其次也不是一个单一的队列。这个过程是复杂的，有多个队列（比如数据结构中的队列）参与。

- **事件循环运行在一个单独的线程里面**

  因为一些错误的 Node.js 事件循环图，很多人认为有两个线程，一个执行 JavaScript 代码，另一个执行事件循环。事实上，这两个是在同一个线程执行的。

- **在 `setTimeout` 中有系统的参与**

  另一个非常大的误解是 `setTimeout` 的回调函数在给定的延迟完成之后被（可能是 OS 或者内核）推进一个队列。

- **`setImmediate` 将回调函数放在第一个位置**

  作为常见的事件循环描述只有一个队列，所以一些开发者认为 `setImmediate` 将回调放在工作队列的前面。然而这是不正确的。

## 事件循环的结构

下图描述的是 Node.js 中的事件循环过程：

![Node.js 事件循环示意图](/images/posts/node-event-loop.png)

事件循环分为 6 个阶段，每个阶段负责特定的任务。每个阶段都有独立的队列（或其它用作队列的数据结构），JavaScript 代码可以在空闲/准备阶段之外的 5 个阶段执行。图中的 nextTick 队列与微任务队列不属于事件循环的一部分，而是在任何阶段都可以执行，它们有比事件循环更高的优先级。

- **计时器阶段（Timer）**

  计时器阶段是一个循环的开始，这个阶段处理计时器（`setTimeout`、`setInterval`）的回调。

  计时器队列是一个最小堆，它用于保留计时器和其回调。计时器阶段会检查计时器队列中过期的计时器，并执行它们的回调。

- **I/O 回调阶段（Pending I/O Callbacks）**

  这个阶段执行 Pending Queue 中的回调。这些回调是在之前的操作中加入到队列的（一般是 I/O 操作完成时加入的）错误处理的回调也将在这里执行。

- **空闲/等待阶段（Idle, Prepare）**

  这个阶段主要执行 Node.js 的一些内部操作，暂时不讨论其内容。

- **轮询阶段（Poll）**

  这个阶段接受新传入的连接（建立 Socket 等等）和数据（读取文件等待）。这个阶段大致可以分成两个部分：

  1. 如果 Watch Queue 里面有任务，它们将依次被执行。
  2. 一旦队列空了，Node.js 就会等待新的连接或数据。等待的时间取决于多种因素（待会再看）

- **检查阶段（Check）**

  轮询阶段专门用于处理 `setImmediate` 设置的回调。

- **关闭回调（Close）**

  关闭回调都是在这里处理的，像一个清理的阶段。

- **nextTick 队列与微任务队列**

  nextTick 队列中保存 `process.nextTick()` 设置的回调。而微任务队列保存 `Promise` 中的回调。它们不属于事件循环（libuv）的一部分，而是 Node.js 的一部分。在 C/C++与 JavaScript 交叉的过程中，它们都是尽可能快地被调用（不一定是当前的回调完成时）。

## 事件循环的流程

当你用 Node.js 执行一段 JavaScript 脚本时，Node.js 首先进行执行脚本前的准备（比如准备全局环境、初始化事件循环等），然后解析并执行代码（所有同步代码以及微任务将在这时候被执行），执行完代码，将检查循环是否还有事情要做（Alive），如果没有，将进入进程结束流程，否则将进入事件循环。

![Node.js 事件循环示意图](/images/posts/node-event-loop.png)

### 计时器阶段

根据前面的描述，计时器阶段将检查过期的计时器并执行回调。

具体来说，计时器队列（最小堆）以时间升序来保存计时器。每次都检查堆顶的计时器是否过期，如果过期就取出队列并执行回调，否则直接进入下一个阶段（因为后面的计时器都一定没有过期）。

当然，事件循环的每个阶段执行的任务数量是有最大限制的，达到这个数量后，即使有过期的计时器也不会执行，直接进入下一阶段。

### I/O 回调阶段

I/O 回调阶段检查 Pending Queue 中是否有任务，如果有，依次执行，直到队列为空或者达到系统限制。

之后将进入空闲阶段（Idle），然后 Node.js 将做一些内部准备，并进入轮询阶段。

### 轮询阶段

这个阶段首先检查 Watcher Queue 中是否有任务（比如文件读响应，Socket 连接请求、HTTP 连接请求等），如果有，将依次执行，直到队列为空或者达到系统限制。

如果没有要执行的回调，轮询阶段在某些条件下将等待一会儿。

- 如果关闭阶段、空闲阶段、I/O 回调阶段或者关闭阶段任意一个队列有任务在等待，则轮询阶段将等待 0ms，并进入检查阶段。
- 否则它将检查计时器队列的堆顶，并决定等待时间（如果已过期，则等待 0ms）

### 检查阶段

这个阶段将执行被 `setImmediate` 设置的回调，直到队列为空或者达到系统限制。

### 关闭阶段

这个阶段将执行处理关闭或者销毁的 `close` 回调。这个阶段完成后，将再次检查循环是否活着（还有任务要做）。如果没有，将退出事件循环，进入进程结束阶段；如果有，将再次进入计时器阶段。

## nextTick 队列与微任务队列

这两个队列会在一个阶段结束时尽可能快的运行。不像其他阶段，它们两个没有系统设置的最大限制，node 运行它们直到两个队列是空的。但是，nextTick 队列会比微任务队列有更高的任务优先级。

根据[另一篇文章](https://blog.csdn.net/i10630226/article/details/81369841)的解释，这两个队列会在每个阶段结束前按顺序执行，直到它们为空。

## 进程池（Thread Pool）

一个普遍的误解是 Node.js 有一个处理所有异步操作的进程池。

实际上，进程池是 libuv 的一部分，但不属于事件循环机制的一部分。而且并不是每个任务都要被进程池处理。libuv 能够灵活运用操作系统的异步 API 来保持环境为事件驱动的。而操作系统的异步 API 无法处理的任务（比如：DNS 查询、文件读取等），将由进程池来处理。进程池默认有 4 个进程，可以通过环境变量 `uv_threadpool_size` 来设置它的进程数量（最多可设置 128 个）。

## 帮助理解的例子

### 基础理解

下面代码的打印顺序如何？

```js
setTimeout(() => {
  console.log('setTimeout');
}, 0);
setImmediate(() => {
  console.log('setImmediate');
});
```

你可能会认为是 'setTimeout' 先被打印出来，或者 'setImmediate' 先被打印出来。但是，这个例子的打印顺序是不确定的。因为在计时器阶段，可能不会检查到计时器过期。

首先，根据 Node.js 的文档，`setTimeout` 的延时小于 1ms 或者大于 2147483647ms 时，将重置为 1ms。进入计时器阶段时，会记录一个时间，然后根据执行代码时的系统性能表现，检查计时器时，可能已经经过了 1ms，也可能没有经过。所以在第一次循环 'setTimeout' 不一定会被打印，而 'setImmediate' 一定会被打印。

但是，如果这段代码位于 I/O 回调中的话，'setImmediate' 一定会在 'setTimeout' 之前被打印。

### 更好地理解计时器

```js
let i = 0;
const start = new Date();
function foo() {
  i++;
  if (i < 1000) {
    setImmediate(foo);
  } else {
    const end = new Date();
    console.log('Execution time: ', end - start);
  }
}
foo();
```

上面的例子是连续使用 `setImmediate` 设置回调，直到 `i == 1000`。在我的 Macbook Pro 上面用 Node.js 10.14.1 执行，大约需要 80ms。

把其中的 `setImmediate` 修改为 `setTimeout`：

```js
let i = 0;
const start = new Date();
function foo() {
  i++;
  if (i < 1000) {
    setTimeout(foo, 0);
  } else {
    const end = new Date();
    console.log('Execution time: ', end - start);
  }
}
foo();
```

在同样的环境下执行修改后的代码，将需要约 1400ms 毫秒。

它们的差距在于，首先 `setTimeout` 至少会产生 1ms 的延时，其次 `setTimeout` 需要花一些时间来注册计时器，而计时器阶段的过期检查也需要一些开销。而再 `setImmediate` 的阶段，再回调中注册 `setImmediate` 将导致队列仍不为空，所以也不会跳出这一阶段（直到系统限制），将进行更少的循环，也节省了一些时间。

### `nextTick()` 与计时器

```js
let i = 0;
function foo() {
  i++;
  if (i > 20) {
    return;
  }
  console.log('foo');
  setTimeout(() => {
    console.log('setTimeout');
  }, 0);
  process.nextTick(foo);
}
setTimeout(foo, 2);
```

上面的例子将输出 20 次 'foo'，再输出 20 次 'setTimeout'。2 秒后，连续进行`nextTick()` 调用，然后检查别的任务（`setTimeout`）。

所以是每个回调执行完之后，开始检查 nextTick 队列的吗？再看看下面的例子。

```js
let i = 0;
function foo() {
  i++;
  if (i > 20) {
    return;
  }
  console.log('foo', i);
  setTimeout(() => {
    console.log('setTimeout', i);
  }, 0);
  process.nextTick(foo);
}
setTimeout(foo, 2);
setTimeout(() => {
  console.log('Other setTimeout');
}, 2);
```

这个例子很可能会在第一个 'foo' 打印之后打印 'other setTimeout'。

相同的计时器分成一组，nextTick 队列会在这组回调执行完之后执行。

## 一些普遍的问题

- JavaScript 代码是在哪里执行的？

  大多数人会认为事件循环有一个独立的线程执行，将回调推入一个队列，然后负责执行 JavaScript 的线程来依次执行。然而，事件循环和 JavaScript 的执行是同一个线程里的。所以，如果 JavaScript 代码不完成的话，事件循环不会向后走。

- 为什么有了 `setTimeout(fn, 0)` 还需要 `setImmediate(fn)`？

  因为 `setTimeout(fn, 0)` 的 0 不是 0ms，而是 1ms（因为至少要 1ms）。其次，`setImmediate` 可以减少额外的检查。而且 `setImmediate` 设置的回调将于轮询阶段的下一个阶段执行，因此用于 I/O 回调中，可以尽早执行。

- 为什么 `setImmediate` 与 `process.nextTick` 的意思相反？

  因为历史原因导致的命名问题。

- 如果在进程结束回调中使用 `setTimeout` 会如何？

  它也许会创建计时器，但是回调将不会被调用。因为这时已经结束了事件循环。
