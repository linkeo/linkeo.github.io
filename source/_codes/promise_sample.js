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
            const nextValue = onFulfilled(value);
            // 并以回调的结果为本次成功结果
            resolve(nextValue);
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
            const nextValue = onRejected(reason);
            // 并以回调的结果为本次**成功**结果
            resolve(nextValue);
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

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
}

// Custom Promise
exports.Future = Future;
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
