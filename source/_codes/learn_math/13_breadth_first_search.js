const inspect = Symbol.for('nodejs.util.inspect.custom');

class SocialNode {
  constructor(name) {
    this.id = ++SocialNode.seq;
    this.name = name;
    this.friends = new Set();

    SocialNode.nodes.set(this.id, this);
  }
  addFriend(node) {
    if (this !== node) {
      this.friends.add(node);
      node.friends.add(this);
    }
  }
  printGraphByBreadth() {
    const queue = [{ node: this, length: 0 }];
    const visited = new Set();
    while (queue.length > 0) {
      const current = queue.shift();
      if (!visited.has(current.node)) {
        console.log(this.name, '->', current.node.name, '=', current.length);
        visited.add(current.node);
        for (const friend of current.node.friends) {
          queue.push({ node: friend, length: current.length + 1 });
        }
      }
    }
  }
  // 广度优先遍历搜索
  distanceTo(node) {
    const queue = [{ node: this, length: 0 }];
    const visited = new Set();
    while (queue.length > 0) {
      const current = queue.shift();
      if (!visited.has(current.node)) {
        visited.add(current.node);
        if (current.node === node) {
          console.log('visited:', visited);
          return current.length;
        }
        for (const friend of current.node.friends) {
          queue.push({ node: friend, length: current.length + 1 });
        }
      }
    }
    console.log('visited:', visited);
    return null;
  }

  // 双向广度优先遍历搜索
  distanceToByBidirectionSearch(that) {
    const thisState = {
      queue: [{ node: this, length: 0 }],
      map: new Map(),
      get alive() {
        return this.queue.length > 0;
      }
    };
    const thatState = {
      queue: [{ node: that, length: 0 }],
      map: new Map(),
      get alive() {
        return this.queue.length > 0;
      }
    };
    const searchOneMore = (main, other) => {
      if (main.queue.length > 0) {
        const current = main.queue.shift();
        if (!main.map.has(current.node)) {
          main.map.set(current.node, current.length);
          if (other.map.has(current.node)) {
            const otherLength = other.map.get(current.node);
            return current.length + otherLength;
          }
          for (const friend of current.node.friends) {
            main.queue.push({ node: friend, length: current.length + 1 });
          }
        }
      }
    };

    let result = null;
    while (thisState.alive || thatState.alive) {
      result = searchOneMore(thisState, thatState);
      if (result) {
        console.log('visited:', thisState.map, thatState.map);
        return result;
      }
      result = searchOneMore(thatState, thisState);
      if (result) {
        console.log('visited:', thisState.map, thatState.map);
        return result;
      }
    }
    console.log('visited:', thisState.map, thatState.map);
    return null;
  }
  [inspect](depth, options) {
    return options.stylize(this.name, 'special');
  }
}
SocialNode.seq = 0;
SocialNode.nodes = new Map();

const linkeo = new SocialNode('linkeo');
const yongle = new SocialNode('yongle');

const jack = new SocialNode('jack');
const rose = new SocialNode('rose');

const luffy = new SocialNode('luffy');
const zoro = new SocialNode('zoro');

const naruto = new SocialNode('naruto');
const sasuke = new SocialNode('sasuke');

linkeo.addFriend(yongle);
jack.addFriend(rose);
luffy.addFriend(zoro);
naruto.addFriend(sasuke);
linkeo.addFriend(luffy);
luffy.addFriend(naruto);
yongle.addFriend(sasuke);
sasuke.addFriend(jack);

console.log([linkeo, rose, linkeo.distanceTo(rose)]);
console.log([linkeo, rose, linkeo.distanceToByBidirectionSearch(rose)]);

linkeo.printGraphByBreadth();
