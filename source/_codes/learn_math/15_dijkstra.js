const inspect = Symbol.for('nodejs.util.inspect.custom');

class GraphNode {
  constructor(name, bidirection = false) {
    this.name = name;
    this.id = ++GraphNode.seq;
    this.bidirection = bidirection;
    this.edges = new Map();

    GraphNode.nodes[this.id] = this;
  }
  setEdge(node, weight, bidirection = this.bidirection) {
    if (this !== node) {
      this.edges.set(node, weight);
      if (bidirection) {
        node.edges.set(this, weight);
      }
    }
  }
  [inspect](depth, options) {
    return options.stylize(this.name, 'special');
  }
}
GraphNode.seq = 0;
GraphNode.nodes = [];

/**
 * @param {GraphNode} from
 * @param {GraphNode} to
 */
function dijkstra(from, to) {
  /** @type {Map<GraphNode, number>} */
  const minWeights = new Map();
  /** @type {Set<GraphNode>} */
  const determined = new Set();
  /** @type {Map<GraphNode, GraphNode[]>} */
  const routes = new Map();

  // Functions
  const getMinNode = () => {
    let min = +Infinity;
    let minNode = null;
    for (const [node, weight] of minWeights.entries()) {
      if (!determined.has(node) && weight < min) {
        min = weight;
        minNode = node;
      }
    }
    return [minNode, min];
  };

  // Initialize
  minWeights.set(from, 0);
  determined.add(from);
  for (const [firstNode, weight] of from.edges.entries()) {
    minWeights.set(firstNode, weight);
    routes.set(firstNode, [from, firstNode]);
  }

  // Main Loop
  while (minWeights.size > determined.size) {
    const [node, weight] = getMinNode();
    determined.add(node);
    for (const [nextNode, nextWeight] of node.edges.entries()) {
      if (!determined.has(nextNode)) {
        const prevWeight = minWeights.get(nextNode) || Infinity;
        if (weight + nextWeight < prevWeight) {
          minWeights.set(nextNode, weight + nextWeight);
          routes.set(nextNode, [...routes.get(node), nextNode]);
        }
      }
    }
  }
  console.log({ minWeights, determined, routes });
  return {
    weight: minWeights.get(to) || Infinity,
    route: routes.get(to) || null
  };
}
{
  const [A, B, C, D, E] = 'A,B,C,D,E'
    .split(',')
    .map(name => new GraphNode(name));

  A.setEdge(C, 20);
  A.setEdge(B, 50);
  A.setEdge(D, 10);
  C.setEdge(B, 20);
  D.setEdge(E, 20);
  E.setEdge(B, 5);

  console.log(A, B, dijkstra(A, B));
}
{
  const [s, a, b, c, d, e, f, g, h] = 's,a,b,c,d,e,f,g,h'
    .split(',')
    .map(name => new GraphNode(name));
  s.setEdge(a, 5);
  s.setEdge(b, 3);
  s.setEdge(c, 2);
  s.setEdge(d, 4);
  b.setEdge(a, 2);
  d.setEdge(c, 1);
  a.setEdge(e, 3);
  b.setEdge(f, 1);
  c.setEdge(f, 4);
  c.setEdge(h, 8);
  d.setEdge(h, 6);
  f.setEdge(e, 1);
  e.setEdge(g, 1);
  f.setEdge(h, 2);
  h.setEdge(g, 4);
  console.log(s, g, dijkstra(s, g));
}
