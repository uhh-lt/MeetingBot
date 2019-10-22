<template>
  <div class="svg-container">
    <svg :style="'width:'+width+'px; height:'+height+'px'"></svg>
    <button v-on:click="addNode">ADD NODE</button>
    <button v-on:click="randomGroupChange">Random Group Change</button>
    <button v-on:click="removeNode">Remove Node</button>
  </div>
</template>

<script>
import * as d3 from 'd3';
import Graph from '../helper/graph';

export default {
  name: 'WordGraph',
  data() {
    return {
      width: 400,
      height: 400,
      colorScale: d3.scaleOrdinal(d3.schemeCategory10),
      svg: null,
      g: null,
      currentNodeID: 0,
      nodeIDMap: new Map(),
      nodeLinkMap: new Map(),
      nodesMap: new Map(),
      nodeMapChangeTracker: 0,
      nodes: [],
      links: [],
      node: null,
      link: null,
      simulation: null,
      newNodeID: 0,
      graph: new Graph(),
    };
  },
  methods: {
    onCurrentUtteranceChanged(keywordInfos) {
      console.log('Recieved new keywords!');
      console.log(keywordInfos);

      // build a map that contains all new keywords
      // const newKeywordMap = new Map();
      // const newLinkMap = new Map();

      const newKeywordMap = new Map();
      const newLinks = [];

      // loop over keyword infos for utterance
      keywordInfos.forEach((info) => {
        const wordsInUtterance = [];

        // aggregate keywords
        const lowKeywords = info.flatMap(value => value.phrase).map(value => value.toLowerCase());
        lowKeywords.forEach((word) => {
          if (newKeywordMap.has(word)) {
            const updatedWord = newKeywordMap.get(word);
            updatedWord.count += 1;
            newKeywordMap.set(word, updatedWord);
          } else {
            const newWord = {
              id: word,
              group: 1,
              count: 1,
            };
            newKeywordMap.set(word, newWord);
            wordsInUtterance.push(newWord);
          }
        });

        // add new links
        for (let i = 0; i < wordsInUtterance.length; i += 1) {
          for (let j = i + i; j < wordsInUtterance.length; j += 1) {
            newLinks.push({
              source: wordsInUtterance[i],
              target: wordsInUtterance[j],
            });
          }
        }
      });

      // remove nodes that are not needed anymore
      this.graph.nodeIDMap.forEach((node) => {
        if (!newKeywordMap.has(node.id)) {
          this.graph.removeNode(node);
        }
      });

      // add & update new nodes
      newKeywordMap.forEach((keyword) => {
        this.graph.addNode(keyword);
      });

      // remove links that are not needed anymore
      // HOW?!

      // add new edges
      newLinks.forEach((link) => {
        this.graph.addEdge(link.source, link.target);
      });

      // update nodes & links
      this.nodes = this.graph.getNodeList();
      this.links = this.graph.getEdgeList();


      // // remove from the nodesMap all words, that do not occur in the newKeywordMap!
      // this.nodesMap.forEach((keyword) => {
      //   if (!newKeywordMap.has(keyword.id)) {
      //     this.nodesMap.delete(keyword.id);
      //   }
      // });
      // // add & update all words that do occur in the newKeywordMap
      // newKeywordMap.forEach((keyword) => {
      //   if (this.nodesMap.has(keyword.id)) {
      //     const updatedWord = this.nodesMap.get(keyword.id);
      //     updatedWord.count = keyword.count;
      //     this.nodesMap.set(updatedWord.id, updatedWord);
      //   } else {
      //     this.nodesMap.set(keyword.id, keyword);
      //   }
      // });
      // this.nodes = Array.from(this.nodesMap.values());
      this.restart();
    },
    addNode() {
      const newNodeID = `NewNode${this.newNodeID}`;
      this.newNodeID += 1;
      if (this.nodesMap.has(newNodeID)) {
        const updatedNode = this.nodesMap.get(newNodeID);
        updatedNode.count += 1;
        this.nodesMap.set(updatedNode.id, updatedNode);
      } else {
        const newNode = {
          id: newNodeID,
          group: 1,
          count: 1,
        };
        // this.nodes.push(newNode);
        this.nodesMap.set(newNodeID, newNode);
      }
      this.nodes = Array.from(this.nodesMap.values());
      this.restart();
    },
    removeNode() {
      const removeNodeID = `NewNode${this.newNodeID - 1}`;
      if (this.nodesMap.has(removeNodeID)) {
        this.nodesMap.delete(removeNodeID);
        this.nodes = Array.from(this.nodesMap.values());
        this.restart();
      }
    },
    randomGroupChange() {
      const randomNode = `NewNode${Math.floor(Math.random() * this.nodesMap.size)}`;
      if (this.nodesMap.has(randomNode)) {
        const updatedNode = this.nodesMap.get(randomNode);
        updatedNode.group = Math.floor(Math.random() * 10);
        this.nodesMap.set(updatedNode.id, updatedNode);
        this.nodes = Array.from(this.nodesMap.values());
        this.restart();
      }
    },
    color(d) {
      return this.colorScale(d.group);
    },
    drag(simulation) {
      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    },
    tick() {
      this.link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      // this.node
      //   .attr('cx', d => d.x)
      //   .attr('cy', d => d.y);

      this.node
        .attr('font-size', d => `${d.count * 10}px`)
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    },
    restart() {
      this.node = this.node.data(this.nodes, d => d.id);

      this.node.exit()
        .remove();

      // this.node = this.node.enter()
      //   .append('circle')
      //   .attr('r', 5)
      //   .call(this.drag(this.simulation))
      //   .merge(this.node);

      this.node = this.node.enter()
        .append('text')
        .text(d => d.id)
        .attr('fill', d => this.color(d))
        .attr('font-family', 'sans-serif')
        .call(this.drag(this.simulation))
        .merge(this.node);

      this.node.append('title')
        .text(d => d.id);

      this.link = this.link.data(this.links, d => `${d.source.id}-${d.target.id}`);

      this.link.exit()
        .remove();

      this.link = this.link.enter()
        .append('line')
        .merge(this.link);

      // Update and restart the simulation.
      this.simulation.nodes(this.nodes);
      this.simulation.force('link').links(this.links);
      this.simulation.alpha(1).restart();

      // const link = svg.append('g')
      //   .attr('stroke', '#999')
      //   .attr('stroke-opacity', 0.6)
      //   .selectAll('line')
      //   .data(this.links)
      //   .join('line')
      //   .attr('stroke-width', d => Math.sqrt(d.value));
      //
      // const node = svg.append('g')
      //   .attr('stroke', '#fff')
      //   .attr('stroke-width', 1.5)
      //   .selectAll('circle')
      //   .data(this.nodes)
      //   .join('circle')
      //   .attr('r', 5)
      //   .attr('fill', this.color)
      //   .call(this.drag(simulation));
    },
  },
  mounted() {
    this.$root.$on('onCurrentUtteranceChanged', this.onCurrentUtteranceChanged);

    this.svg = d3.select('svg')
      .attr('viewBox', [0, 0, this.width, this.height]);

    // const somenodes = [
    //   { id: 'Tim', group: 1 },
    //   { id: 'Tim1', group: 1 },
    //   { id: 'Tim2', group: 1 },
    //   { id: 'Tim3', group: 1 },
    //   { id: 'Sharilyn', group: 5 },
    //   { id: 'Sharilyn1', group: 2 },
    //   { id: 'Sharilyn2', group: 2 },
    //   { id: 'Sharilyn3', group: 2 },
    // ];
    // const somelinks = [
    //   { source: somenodes[0], target: somenodes[4], value: 10 },
    //   { source: somenodes[1], target: somenodes[5], value: 5 },
    //   { source: somenodes[2], target: somenodes[6], value: 7 },
    //   { source: somenodes[3], target: somenodes[7], value: 2 },
    // ];

    // this.links = this.data.links.map(d => Object.create(d));
    // this.links = somelinks;
    // this.nodes = this.data.nodes.map(d => Object.create(d));
    // this.nodes = somenodes;

    this.simulation = d3.forceSimulation(this.nodes)
      // .force('link', d3.forceLink(this.links).distance(200))
      .force('link', d3.forceLink(this.links).id(d => d.id).distance(50))
      // .force('charge', d3.forceManyBody().strength(-1))
      .force('charge', d3.forceManyBody().strength(-150))
      // .force('x', d3.forceX())
      // .force('y', d3.forceY())
      // .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      // .gravity(.05)
      .force('x', d3.forceX(this.width / 2).strength(0.1))
      .force('y', d3.forceY(this.height / 2).strength(0.1))
      .alphaTarget(1)
      .on('tick', this.tick);

    // this.g = this.svg.append('g').attr('transform', `translate(${this.width / 2},${this.height / 2})`);
    this.link = this.svg.append('g').attr('stroke', '#000').attr('stroke-width', 2).selectAll('link');
    // this.node = this.svg.append('g').attr('stroke', '#fff').attr('stroke-width', 1.5).selectAll('circle');
    this.node = this.svg.append('g').attr('stroke', 'black').attr('stroke-width', 1).selectAll('text');

    this.restart();
  },
};
</script>

<style scoped>

</style>
