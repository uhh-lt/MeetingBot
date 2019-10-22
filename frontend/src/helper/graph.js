function Graph() {
  this.nodeIDMap = new Map(); // node ID to node map
  this.nodes = []; // list of node ids
  this.edges = new Map(); // one list of node ids per node
  this.internalNumber = 0;

  this.addNode = (node) => {
    let addedNode = null;
    if (this.nodeIDMap.has(node.id)) {
      const updatedNode = this.nodeIDMap.get(node.id);
      updatedNode.count = node.count;
      updatedNode.group = node.group;
      addedNode = updatedNode;
    } else {
      addedNode = node;
      addedNode.internalNumber = this.internalNumber;
      this.internalNumber += 1;
      this.nodes.push(node.id);
      this.edges.set(node.id, []);
    }
    this.nodeIDMap.set(node.id, addedNode);
  };

  this.addEdge = (node1, node2) => {
    if (node1.id === node2.id) return; // no edges between same node

    if (this.nodeIDMap.has(node1.id) && this.nodeIDMap.has(node2.id)
      && this.edges.has(node1.id) && this.edges.has(node2.id)) {
      const node1Edges = this.edges.get(node1.id);
      const node2Edges = this.edges.get(node2.id);
      // node 2 is not in the edge list of node 1
      if (node1Edges.indexOf(node2.id) < 0) {
        node1Edges.push(node2.id);
      }
      // node 1 is not in the edge list of node 2
      if (node2Edges.indexOf(node1.id) < 0) {
        node2Edges.push(node1.id);
      }
    } else {
      console.log('ERROR: Nodes do not exist');
    }
  };

  this.removeNode = (node) => {
    // remove from nodeIDMap
    console.log(`Removing node ${node.id}`);
    if (this.nodeIDMap.has(node.id)) {
      this.nodeIDMap.delete(node.id);
    }
    // remove from node list
    const index = this.nodes.indexOf(node.id);
    if (index >= 0) {
      this.nodes.splice(index, 1);
    }
    // remove from connected nodes' edge list
    // easy, as this is not a directed graph!
    if (this.edges.has(node.id)) {
      const nodeEdges = this.edges.get(node.id);
      // loop through all connected nodes
      nodeEdges.forEach((nodeID) => {
        // and delete the removed node from their edge lists
        const connectedNodeEdges = this.edges.get(nodeID);
        const i = connectedNodeEdges.indexOf(node.id);
        if (i >= 0) {
          connectedNodeEdges.splice(i, 1);
        }
      });
      // remove from edge list
      this.edges.delete(node.id);
    }
  };

  this.removeEdge = (node1, node2) => {
    if (this.edges.has(node1.id) && this.edges.has(node2.id)) {
      const node1Edges = this.edges.get(node1.id);
      const node2Edges = this.edges.get(node2.id);

      const index1 = node1Edges.indexOf(node2.id);
      if (index1 >= 0) {
        node1Edges.splice(index1, 1);
      }

      const index2 = node2Edges.indexOf(node1.id);
      if (index2 >= 0) {
        node2Edges.splice(index2, 1);
      }
    }
  };

  this.getNodeList = () => this.nodes.map(nodeID => this.nodeIDMap.get(nodeID));

  this.getEdgeList = () => {
    const resultMap = new Map();
    this.edges.forEach((connectedNodeIDs, nodeID) => {
      connectedNodeIDs.forEach((connectedNodeID) => {
        const connectedNode = this.nodeIDMap.get(connectedNodeID);
        const node = this.nodeIDMap.get(nodeID);
        const id = connectedNode.internalNumber < node.internalNumber ? `${connectedNode.id}---${node.id}` : `${node.id}---${connectedNode.id}`;
        const source = connectedNode.internalNumber < node.internalNumber ? connectedNode : node;
        const target = connectedNode.internalNumber < node.internalNumber ? node : connectedNode;
        resultMap.set(id, {
          source,
          target,
        });
      });
    });
    return Array.from(resultMap.values());
  };
}

export default Graph;
