class TreeNode {
  constructor(char, prefix, data = null) {
    this.char = char;
    this.prefix = prefix;
    this.data = data;
    this.children = {};
  }
}

class Dictionary {
  constructor(initialWords) {
    this._tree = new TreeNode('', '');
    if (initialWords != null && typeof initialWords === 'object') {
      for (const word of Object.keys(initialWords)) {
        this.addWord(word, initialWords[word]);
      }
    }
  }
  addWord(word, data) {
    const chars = [...word];
    let current = this._tree;
    for (let i = 0; i < chars.length; i += 1) {
      const char = chars[i];
      const isTailChar = i === chars.length - 1;
      if (!current.children[char]) {
        current.children[char] = isTailChar
          ? new TreeNode(char, current.prefix + char, data)
          : new TreeNode(char, current.prefix + char);
      }
      current = current.children[char];
    }
  }
  findWord(word) {
    const chars = [...word];
    let current = this._tree;
    for (let i = 0; i < chars.length; i += 1) {
      const char = chars[i];
      if (!current.children[char]) {
        return null;
      }
      current = current.children[char];
      if (!current) {
        return null;
      }
    }
    return current.data;
  }
  printWordsByDepth() {
    const stack = [this._tree];
    while (stack.length > 0) {
      const peek = stack.pop();
      if (peek.data) {
        console.log(peek.prefix);
      }
      const nextChars = Object.keys(peek.children)
        .sort()
        .reverse();
      for (const nextChar of nextChars) {
        stack.push(peek.children[nextChar]);
      }
    }
  }
}

const dict = new Dictionary({
  fire: { spell: 'fire' },
  water: { spell: 'water' },
  air: { spell: 'air' },
  earch: { spell: 'earch' },
  magic: { spell: 'magic' },
  magician: { spell: 'magician' },
  magical: { spell: 'magical' },
  index: { spell: 'index' },
  indexed: { spell: 'indexed' },
  indexes: { spell: 'indexes' },
  indices: { spell: 'indices' },
  vertex: { spell: 'vertex' },
  vertexes: { spell: 'vertexes' },
  vertices: { spell: 'vertices' }
});

console.log(dict.findWord('fire'));
console.log(dict.findWord('flame'));

dict.printWordsByDepth();
