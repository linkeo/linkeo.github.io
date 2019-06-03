---
title: 自己实现一个 Promise 类
toc: true
categories:
  - JavaScript
tags:
  - JavaScript
  - Node.js
  - Promise
date: 2019-05-30 11:38:12
---

自从 ES6 引入的 Promise 将我们从回调地狱中解放了出来，ES7 提出的 async/await 特性更是进一步地简化了异步代码的编写。

那么我们就通过自己实现一个 Promise 类，来一窥其内部的奥秘（本文将遵照 Promise/A+ 规范实现 Promise，并且添加一些常用的函数）

<!-- more -->

本文将新的 Promise 类命名为 Future（参考 [Dart 中与 Promise 对应的概念](https://api.dartlang.org/stable/2.3.1/dart-async/Future-class.html)的名称）

本文为了模拟 Promise 的微任务，使用 Node.js 的 `process.nextTick` 函数来产生微任务。并且本文将使用 ES2015+ 语法来实现。

## 基本实现

首先我们不考虑结果为 Promise 或者 thenable 的情况。

### 构造器

首先我们知道，Promise 的构造器需要传入一个函数（我们称为 executor），这个函数有 `resolve`、`reject` 两个参数，分别用于将 Promise 的状态设为成功（fulfilled）或者失败（rejected），并且如果这个函数抛出错误，Promise 也将失败。而 Promise 一开始就具有待定（pending）状态。

```js
/* 属性常量 */
const state = Symbol();
const result = Symbol();

/* 状态常量 */
const PENDING = Symbol();
const REJECTED = Symbol();
const FULFILLED = Symbol();

/* 工具函数 */
// 设置不可枚举属性
const defineProperty = (obj, key, value) =>
  Object.defineProperty(obj, key, {
    value,
    writable: true,
    configurable: false,
    enumerable: false
  });

class Future {
  constructor(executor) {
    // 参数检查
    if (typeof executor !== 'function') {
      throw new Error('Future executor undefined is not a function');
    }

    // 设置状态、结果属性
    defineProperty(this, state, PENDING);
    defineProperty(this, result, undefined);

    // 成功处理函数
    const resolveFunction = value => {
      if (this[state] === PENDING) {
        this[state] = FULFILLED;
        this[result] = value;
      }
    };

    // 失败处理函数
    const rejectFunction = reason => {
      if (this[state] === PENDING) {
        this[state] = REJECTED;
        this[result] = reason;
      }
    };

    try {
      executor(resolveFunction, rejectFunction);
    } catch (err) {
      rejectFunction(err);
    }
  }
}
```

> 这里简化了 “私有” 属性的声明，使用私有 Symbol 作为不可枚举属性的名称，可以防止外部模块访问（实际上，使用 `Object.getOwnPropertySymbols` 仍然可以得到这些 Symbol，但是需要额外的判断来确定 Symbol 的作用）。

### then 方法

我们知道，Promise 的 then 方法可以传入两个参数作为回调，分别处理成功和失败的情况，而这两个参数分别只有在类型为函数的情况下，才认为有效，其余情况会忽略。then 函数会返回一个新的 Promise，用于处理 then 的回调产生的结果（或者没有设置对应回调的情况下，处理原 Promise 的结果）。

为了使原 Promise 可以处理 then 的回调，我们定义两个队列用于存放回调。

```js
/* 属性常量 */
const onFulfilledCallbacks = Symbol();
const onRejectedCallbacks = Symbol();

// @{Future.constructor} 在 Promise 的构造器中设置回调队列
defineProperty(this, onFulfilledCallbacks, []);
defineProperty(this, onRejectedCallbacks, []);
```

在对应的处理函数中，调用这些回调：

```js
// 成功的时候，调用所有成功回调队列中的函数
this[state] = FULFILLED;
this[result] = value;
this[onFulfilledCallbacks].forEach(cb => {
  process.nextTick(() => cb(this[result]));
});

// 失败的时候，调用所有失败回调队列中的函数
this[state] = REJECTED;
this[result] = reason;
this[onRejectedCallbacks].forEach(cb => {
  process.nextTick(() => cb(this[result]));
});
```

做好这些准备，我们就可以开始实现 then 函数了：

```js
class Future {
  // constructor(executor) { ... }
  then(onFulfilled, onRejected) {
    const newFuture = new Future((resolve, reject) => {
      // 设置原 Promise 成功处理函数
      const onPrevFulfilled = value => {
        if (typeof onFulfilled !== 'function') {
          // 如果没有设置成功回调，则直接使用原 Promise 的成功结果
          resolve(value);
        } else {
          // 如果设置了成功回调，则用成功的结果为参数调用回调
          try {
            // 并以回调的结果为本次成功结果
            resolve(onFulfilled(value));
          } catch (err) {
            // 如果抛出异常，则设置为错误结果
            reject(err);
          }
        }
      };
      // 设置原 Promise 失败处理函数
      const onPrevRejected = reason => {
        // 如果没有设置失败回调，则直接使用原 Promise 的失败结果
        if (typeof onRejected !== 'function') {
          reject(reason);
        } else {
          // 如果设置了失败回调，则用失败的结果为参数调用回调
          try {
            // 并以回调的结果为本次**成功**结果
            resolve(onRejected(reason));
          } catch (err) {
            // 如果抛出异常，则设置为错误结果
            reject(err);
          }
        }
      };
      if (this[state] === FULFILLED) {
        // 如果原 Promise 已经成功，直接调用成功处理函数
        process.nextTick(() => {
          onPrevFulfilled(this[result]);
        });
      } else if (this[state] === REJECTED) {
        // 如果原 Promise 已经失败，直接调用失败处理函数
        process.nextTick(() => {
          onPrevRejected(this[result]);
        });
      } else {
        // 如果原 Promise 仍然待定，则将处理函数加到原 Promise 的回调队列中
        this[onFulfilledCallbacks].push(onPrevFulfilled);
        this[onRejectedCallbacks].push(onPrevRejected);
      }
    });
    // 返回新创建的 Promise
    return newFuture;
  }
}
```

> 这里 `process.nextTick` 用于模拟 then 回调的微任务执行优先级。

## 处理 thenable

刚才的基本实现应该可以处理普通的结果了，现在我们要考虑将 Promise 或者 thenable 作为结果的情况。

thenable 其实就是定义了 then 方法的对象（或函数），对 thenable 的支持可以使得不同的 Promise 实现之间相互兼容。

只要对象可以成功提供 then 函数，我们就认为它是合法的 thenable，就可以把 then 当作 Promise 的 then 方法来使用。

根据以上描述，Promise 对象本身就是一个 thenable，那么其实我们只需要判断 thenable 即可。

### 支持 thenable 结果

如果当前 Promise 的结果是 thenable，我们就等到它们的状态变为成功或失败，并将它们的结果设为当前 Promise 的结果。

根据 Promise/A+ 规范，executor 的 reject 回调用于设置失败原因，不需要处理 thenable 的情况。我们只需要修改成功处理函数（resolveFunction）来等待 thenable 的结果：

```js
// 成功处理函数
const resolveFunction = value => {
  // 处理 thenable 的情况
  // 首先判断是一个对象或函数
  if (
    (value !== null && typeof value === 'object') ||
    typeof value === 'function'
  ) {
    try {
      const then = value.then;
      // 取得 then 函数，并且将当前 Promise 的处理函数设置为回调
      if (typeof then === 'function') {
        then.call(value, resolveFunction, rejectFunction);
        return;
      }
    } catch (err) {
      // 如果无法成功获得 then 函数，设置当前 Promise 为错误状态
      rejectFunction(err);
      return;
    }
  }
  if (this[state] === PENDING) {
    this[state] = FULFILLED;
    this[result] = value;
    this[onFulfilledCallbacks].forEach(cb => {
      process.nextTick(() => cb(this[result]));
    });
  }
};
```

### 正确处理结果回调

我们知道，resolveFunction 和 rejectFunction 只有最初调用的那个可以生效，我们一开始使用一个简单的有限状态机来控制状态转移。

但是由于加入了 thenable 的处理，状态设置的顺序和调用处理函数的顺序将可能会不同，我们将无法保证只有第一次调用能够生效。如果我们先 resolve 一个 thenable，再 resolve 一个普通结果，如上的处理方式会采用后面的普通结果；同理，如果先 resolve 一个 thenable，再抛出异常，我们会得到失败的结果。所以，我们需要另外的机制来保证只有第一次调用的处理函数才能生效。

首先，我们采用一个工具函数来包装这对处理函数，使得它们总共只能被调用一次。

```js
const once = (resolve, reject) => {
  let called = false;
  const callable = () => (called ? false : ((called = true), true));
  return {
    resolve: value => (callable() ? resolve(value) : undefined),
    reject: reason => (callable() ? reject(reason) : undefined)
  };
};
```

我们修改构造器的最后一段，将处理过的函数丢给 executor：

```js
const { resolve, reject } = once(resolveFunction, rejectFunction);
try {
  executor(resolve, reject);
} catch (err) {
  reject(err);
}
```

这样就可以保证 executor 只能调用一次处理函数，之后再调用或者抛出异常都不再理会。

### 正确处理 thenable 嵌套

但是 thenable 也可能会提供一个 thenable 作为结果，这时候对新的 thenable 的处理，我们是放在 resolveFunction 中的，回顾一下刚刚的代码：

```js
// 成功处理函数
const resolveFunction = value => {
  if (
    (value !== null && typeof value === 'object') ||
    typeof value === 'function'
  ) {
    try {
      const then = value.then;
      if (typeof then === 'function') {
        then.call(value, resolveFunction, rejectFunction);
        return;
      }
    } catch (err) {
      rejectFunction(err);
      return;
    }
  }
  if (this[state] === PENDING) {
    this[state] = FULFILLED;
    this[result] = value;
    this[onFulfilledCallbacks].forEach(cb => {
      process.nextTick(() => cb(this[result]));
    });
  }
};
```

这里同样会产生上述回调处理顺序问题，所以我们需要保证 resolveFunction 中产生的回调，也只能执行一次。

```js
// 成功处理函数
const resolveFunction = value => {
  // 使用带执行检查的函数作为回调
  const callback = once(resolveFunction, rejectFunction);
  if (
    (value !== null && typeof value === 'object') ||
    typeof value === 'function'
  ) {
    try {
      const then = value.then;
      if (typeof then === 'function') {
        // 修改这里的回调
        then.call(value, callback.resolve, callback.reject);
        return;
      }
    } catch (err) {
      // 修改这里的错误处理函数
      callback.reject(err);
      return;
    }
  }
  if (this[state] === PENDING) {
    this[state] = FULFILLED;
    this[result] = value;
    this[onFulfilledCallbacks].forEach(cb => {
      process.nextTick(() => cb(this[result]));
    });
  }
};
```

## 测试

我们先安装 Promise/A+ 测试库：

```bash
npm i -g promises-aplus-tests
```

然后加入以下代码，提供测试库需要的接口：

```js
exports.resolved = value =>
  new Future((resolve, reject) => {
    resolve(value);
  });
exports.rejected = reason =>
  new Future((resolve, reject) => {
    reject(reason);
  });
exports.deferred = () => {
  const response = {};
  response.promise = new Future((resolve, reject) => {
    response.resolve = resolve;
    response.reject = reject;
  });
  return response;
};
```

接着执行测试（`--bail` 参数用于控制测试在第一次失败时终止）：

```bash
promises-aplus-tests custom_promise.js --bail
```

我们发现，我们的实现不符合规范的第 2.3.1 条：

> 2.3.1: If `promise` and `x` refer to the same object, reject `promise` with a `TypeError' as the reason. via return from a fulfilled promise

这一条是说，Promise 不能以他自己为结果，否则得抛出 TypeError，测试的情况为：

```js
const promise = new Promise((resolve, reject) => {
  process.nextTick(() => {
    resolve(promise);
  });
});
```

这种情况下，Promise 会等待自己完成时才能完成，这是一个死锁。

我们在 resolveFunction 的开头增加一段检查，来完成这一条规范：

```js
const resolveFunction = value => {
  const callback = once(resolveFunction, rejectFunction);
  if (value === this) {
    callback.reject(new TypeError('Promise cannot resolve itself.'));
    return;
  }
  // ...
};
```

再次执行测试，我们会发现全部的测试都可以通过了。

最终通过测试的代码如下：

```js
/* 属性常量 */
const state = Symbol();
const result = Symbol();
const onFulfilledCallbacks = Symbol();
const onRejectedCallbacks = Symbol();

/* 状态常量 */
const PENDING = Symbol();
const REJECTED = Symbol();
const FULFILLED = Symbol();

/* 工具函数 */
// 设置不可枚举属性
const defineProperty = (obj, key, value) =>
  Object.defineProperty(obj, key, {
    value,
    writable: true,
    configurable: false,
    enumerable: false
  });
const once = (resolve, reject) => {
  let called = false;
  const callable = () => (called ? false : ((called = true), true));
  return {
    resolve: value => (callable() ? resolve(value) : undefined),
    reject: reason => (callable() ? reject(reason) : undefined)
  };
};

class Future {
  constructor(executor) {
    // 参数检查
    if (typeof executor !== 'function') {
      throw new Error('Future executor undefined is not a function');
    }

    // 设置状态、结果属性
    defineProperty(this, state, PENDING);
    defineProperty(this, result, undefined);
    // 设置回调队列
    defineProperty(this, onFulfilledCallbacks, []);
    defineProperty(this, onRejectedCallbacks, []);

    // 成功处理函数
    const resolveFunction = value => {
      try {
        // 使用带执行检查的函数作为回调
        const callback = once(resolveFunction, rejectFunction);
        // 检查是否结果为自己本身
        if (value === this) {
          callback.reject(new TypeError('Promise cannot resolve itself.'));
          return;
        }
        if (
          (value !== null && typeof value === 'object') ||
          typeof value === 'function'
        ) {
          try {
            const then = value.then;
            if (typeof then === 'function') {
              then.call(value, callback.resolve, callback.reject);
              return;
            }
          } catch (err) {
            callback.reject(err);
            return;
          }
        }
        if (this[state] === PENDING) {
          this[state] = FULFILLED;
          this[result] = value;
          this[onFulfilledCallbacks].forEach(cb => {
            process.nextTick(() => cb(this[result]));
          });
        }
      } catch (err) {
        console.error(err.stack);
      }
    };

    // 失败处理函数
    const rejectFunction = reason => {
      try {
        if (this[state] === PENDING) {
          this[state] = REJECTED;
          this[result] = reason;
          this[onRejectedCallbacks].forEach(cb => {
            process.nextTick(() => cb(this[result]));
          });
        }
      } catch (err) {
        console.error(err.stack);
      }
    };

    const { resolve, reject } = once(resolveFunction, rejectFunction);
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    const newFuture = new Future((resolve, reject) => {
      // 设置原 Promise 成功处理函数
      const onPrevFulfilled = value => {
        if (typeof onFulfilled !== 'function') {
          // 如果没有设置成功回调，则直接使用原 Promise 的成功结果
          resolve(value);
        } else {
          // 如果设置了成功回调，则用成功的结果为参数调用回调
          try {
            // 并以回调的结果为本次成功结果
            resolve(onFulfilled(value));
          } catch (err) {
            // 如果抛出异常，则设置为错误结果
            reject(err);
          }
        }
      };
      // 设置原 Promise 失败处理函数
      const onPrevRejected = reason => {
        // 如果没有设置失败回调，则直接使用原 Promise 的失败结果
        if (typeof onRejected !== 'function') {
          reject(reason);
        } else {
          // 如果设置了失败回调，则用失败的结果为参数调用回调
          try {
            // 并以回调的结果为本次**成功**结果
            resolve(onRejected(reason));
          } catch (err) {
            // 如果抛出异常，则设置为错误结果
            reject(err);
          }
        }
      };
      if (this[state] === FULFILLED) {
        // 如果原 Promise 已经成功，直接调用成功处理函数
        process.nextTick(() => {
          onPrevFulfilled(this[result]);
        });
      } else if (this[state] === REJECTED) {
        // 如果原 Promise 已经失败，直接调用失败处理函数
        process.nextTick(() => {
          onPrevRejected(this[result]);
        });
      } else {
        // 如果原 Promise 仍然待定，则将处理函数加到原 Promise 的回调队列中
        this[onFulfilledCallbacks].push(onPrevFulfilled);
        this[onRejectedCallbacks].push(onPrevRejected);
      }
    });
    // 返回新创建的 Promise
    return newFuture;
  }
}
```

## 添加常用的函数

### Promise.prototype.catch 和 Promise.prototype.finally

catch 方法类似于 then 方法，只是它只接受一个错误回调。我们可以通过使用 then 函数来达到它的效果。

```js
class Future {
  // then(onFulfilled, onRejected) { ... }
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
}
```

finally 方法可以指定一个没有参数的回调，用于在 Promise 的状态发生变化时触发，finally 方法返回一个新的 Promise。

只有在回调抛出异常的情况下，新 Promise 会以这个异常为原因失败，否则新的 Promise 的结果将和原 Promise 一致。

同样，我们可以通过使用 then 函数来达到它的效果。

```js
class Future {
  // then(onFulfilled, onRejected) { ... }
  finally(onFinally) {
    const callback =
      typeof onFinally === 'function' ? () => onFinally() : undefined;
    return this.then(callback, callback).then(() => {
      if (this[state] === REJECTED) {
        throw this[result];
      }
      return this[result];
    });
  }
}
```

### Promise.resolve 和 Promise.reject

Promise 的类方法 resolve 和 reject 用于构造一个确定结果的 Promise。

```js
class Future {
  static resolve(value) {
    return new Future((resolve, reject) => resolve(value));
  }
  static reject(reason) {
    return new Future((resolve, reject) => reject(reason));
  }
}
```

### Promise.all 和 Promise.race

Promise 的类方法 all 和 race 用于多个 Promise 的控制。

all 方法的参数为一个可迭代对象（Iterable，比如数组），返回一个 Promise。Promise 成功的结果将是一个新的数组。如果传入的数组里有 thenable，则将结果放到结果的对应位置，否则放数组元素本身。任意一个 thenable 的失败，都将导致整个结果失败。

```js
class Future {
  static all(iterable) {
    let pending = 0;
    return new Future((resolve, reject) => {
      const iterator = iterable && iterable[Symbol.iterator];
      if (!iterator || typeof iterator.next !== 'function') {
        throw new TypeError('argument must be iterable.');
      }
      const values = [];
      for (
        let item = iterator.next(), index = 0;
        !(item && item.done);
        item = iterator.next(), index += 1
      ) {
        if (item == null || typeof item !== 'object') {
          throw new TypeError('iterator.next() returned a non-object value');
        }
        if (
          (item.value !== null && typeof item.value === 'object') ||
          typeof item.value === 'function'
        ) {
          const then = item.value.then;
          if (typeof then === 'function') {
            pending += 1;
            const callback = value => {
              values[i] = value;
              pending -= 1;
              if (pending === 0) {
                resolve(values);
              }
            };
            then.call(item.value, callback, reject);
          } else {
            values[i] = item.value;
          }
        } else {
          values[i] = item.value;
        }
      }
      if (pending === 0) {
        resolve(values);
      }
    });
  }
}
```

race 方法的参数也为一个可迭代对象（Iterable，比如数组），返回一个 Promise。Promise 的结果将是数组元素中最快确定的结果（如果数组元素是 thenable，则需要等待它的结果，否则立即取出结果）。任意一个 thenable 的失败，都将导致整个结果失败。

```js
class Future {
  static race(iterable) {
    return new Promise((resolve, reject) => {
      const iterator = iterable && iterable[Symbol.iterator];
      if (!iterator || typeof iterator.next !== 'function') {
        throw new TypeError('argument must be iterable.');
      }
      for (
        let item = iterator.next(), index = 0;
        !(item && item.done);
        item = iterator.next(), index += 1
      ) {
        if (item == null || typeof item !== 'object') {
          throw new TypeError('iterator.next() returned a non-object value');
        }
        if (
          (item.value !== null && typeof item.value === 'object') ||
          typeof item.value === 'function'
        ) {
          const then = item.value.then;
          if (typeof then === 'function') {
            then.call(item.value, resolve, reject);
          } else {
            process.nextTick(() => {
              resolve(item.value);
            });
          }
        } else {
          process.nextTick(() => {
            resolve(item.value);
          });
        }
      }
    });
  }
}
```

### Promise.promisify

promisify 函数用于将标准回调风格异步函数转换成 Promise 风格异步函数，将会在函数列表末尾增加一个错误优先风格的回调（`(err, value) => { ... }`）来用于转换。

```js
class Future {
  static futurify(asyncFunctionWithCallback) {
    return (...args) =>
      new Future((resolve, reject) => {
        asyncFunctionWithCallback(...args, (err, value) => {
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        });
      });
  }
}
```

## 总结

到此，一个满足 Promise/A+ 规范的自定义 Promise 类就完成了，也顺便添加了一些常用的规范外的方法。
