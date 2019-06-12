const util = require('util');

class ListNode {
  /**
   * @param {any} val
   * @param {ListNode} next
   */
  constructor(val, next = undefined) {
    this.val = val;
    this.next = next;
  }
  [util.inspect.custom](depth, options) {
    const vals = [];
    let curr = this;
    while (curr) {
      vals.push(curr.val);
      curr = curr.next;
    }
    return util.inspect(vals, Object.assign({ depth }, options));
  }

  /**
   * Revert list, or part of list. (May break current list)
   * @param {number} start The offset from which node start to revert. Default value is `0`, for the first node.
   * @param {number} size The size of reverted nodes, reverts only when `size >= 2`. Default value is `+Infinite`, to revert all rest nodes.
   * @return {ListNode} The new head node after revert.
   */
  revert(start = 0, size = Infinity) {
    /**
     * Revert several times from start.
     * @param {ListNode} start The node from which start to revert.
     * @param {number} count The count of revert ops.
     */
    function _revert(start, count = Infinity) {
      let prev = start;
      let curr = start.next;
      while (curr && count > 0) {
        [curr.next, prev, curr, count] = [prev, curr, curr.next, count - 1];
        // const next = curr.next;
        // curr.next = prev;
        // prev = curr;
        // curr = next;
        // count -= 1;
      }
      start.next = curr;
      return prev;
    }

    let prev = undefined;
    let begin = this;
    while (begin.next && start > 0) {
      [prev, begin, start] = [begin, begin.next, start - 1];
    }
    if (!begin) {
      return this;
    }
    const newBegin = _revert(begin, size - 1);
    if (!prev) {
      return newBegin;
    }
    prev.next = newBegin;
    return this;
  }
}

ListNode.from = iterable => {
  let head;
  let prev;
  for (const val of iterable) {
    const curr = new ListNode(val);
    if (!head) {
      head = curr;
    }
    if (prev) {
      prev.next = curr;
    }
    prev = curr;
  }
  return head;
};

{
  const head = ListNode.from([1, 2, 3, 4, 5]);
  console.log('original:', head);
  console.log('revert():', head.revert());
}
{
  const head = ListNode.from([1, 2, 3, 4, 5]);
  console.log('original:', head);
  console.log('revert(2):', head.revert(2));
}
{
  const head = ListNode.from([1, 2, 3, 4, 5]);
  console.log('original:', head);
  console.log('revert(2, 2):', head.revert(2, 2));
}
