<template>
  <div class="svg-container">
    <svg :style="'width:'+width+'px; height:'+height+'px'"></svg>
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */

import * as d3 from 'd3';
import Graph from '../helper/graph';

/**
 * This components manages keywords as a graph and visualizes them with d3.js.
 * A force directed graph is used to visualize the keywords.
 * Keywords that should be visualized can be passed with the event onCurrentUtteranceChanged.
 */
export default {
  name: 'WordGraph',
  props: ['height', 'width'],
  data() {
    return {
      colorScale: d3.schemeCategory10,
      svg: null,
      currentNodeID: 0,
      nodeIDMap: new Map(),
      nodeLinkMap: new Map(),
      nodesMap: new Map(),
      nodeMapChangeTracker: 0,
      nodes: [],
      links: [],
      node: null,
      node_g: null,
      link: null,
      link_g: null,
      simulation: null,
      newNodeID: 0,
      graph: new Graph(),
      settings: null,
    };
  },
  watch: {
    // if width or height of the sidebar element changes, it is necessary to update the svg and restart the simulation
    // so that the updated svg size is used
    width(newVal) {
      this.svg.attr('viewBox', [0, 0, this.width, this.height]);
      this.simulation.force('x', d3.forceX(newVal / 2).strength(0.01));
      this.restart();
    },
    height(newVal) {
      this.svg.attr('viewBox', [0, 0, this.width, this.height]);
      this.simulation.force('y', d3.forceY(newVal / 2).strength(0.01));
      this.restart();
    },
  },
  mounted() {
    // listen to events from other components
    this.$root.$on('onCurrentUtteranceChanged', this.onCurrentUtteranceChanged);
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);
    this.$root.$on('onReset', this.onReset);

    this.init();
  },
  methods: {
    /**
     * This function intializes the d3.js force directed graph
     */
    init() {
      this.svg = d3.select('svg')
        .attr('viewBox', [0, 0, this.width, this.height]);

      this.simulation = d3.forceSimulation(this.nodes)
        .force('link', d3.forceLink(this.links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-150))
        .force('x', d3.forceX(this.width / 2).strength(0.01))
        .force('y', d3.forceY(this.height / 2).strength(0.01))
        .alphaTarget(1)
        .on('tick', this.tick);

      this.link_g = this.svg.append('g').attr('stroke', '#000').attr('stroke-width', 2);
      this.link = this.link_g.selectAll('link');
      this.node_g = this.svg.append('g').attr('stroke', 'black').attr('stroke-width', 0);
      this.node = this.node_g.selectAll('text');

      this.restart();
    },
    /**
     * This function starts the d3.js force directed graph. First it loads the data, then it starts the simulation.
     */
    restart() {
      this.node = this.node.data(this.nodes, d => d.id);

      this.node.exit()
        .remove();

      this.node = this.node.enter()
        .append('text')
        .text(d => d.id)
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .call(this.drag(this.simulation))
        .merge(this.node);

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

      // assign groups depending on connected nodes
      const result = this.graph.connectedComponents();
      const groups = [];
      let group = 0;
      result.forEach((connectedComponent) => {
        const groupCounter = new Map();
        connectedComponent.forEach((node) => {
          groupCounter.set(node.group, groupCounter.has(node.group) ? groupCounter.get(node.group) + 1 : 1);
        });
        const maxGroup = [...groupCounter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 1)[0][0];
        let assignGroup = 0;
        if (groups.indexOf(maxGroup) < 0) {
          assignGroup = maxGroup;
        } else {
          while (groups.indexOf(group) >= 0) {
            group += 1;
          }
          assignGroup = group;
        }
        groups.push(assignGroup);
        connectedComponent.forEach((node) => {
          node.group = assignGroup;
        });
      });
    },
    /**
     * This function enables drag & drog for the nodes of the d3.js force directed graph.
     */
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
    /**
     * This function is called every tick and updates the d3.js force directed graph. It is important for the drag & drop feature.
     */
    tick() {
      this.link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      this.node
        .attr('font-size', d => `${20 * Math.sqrt(d.count)}px`)
        .attr('fill', d => this.color(d))
        .attr('x', (d) => {
          if (d.x < this.width * 0.1) {
            return this.width * 0.1;
          }
          if (d.x >= this.width - this.width * 0.1) {
            return this.width - this.width * 0.1;
          }
          return d.x;
        })
        .attr('y', (d) => {
          if (d.y < this.height * 0.1) {
            return this.height * 0.1;
          }
          if (d.y >= this.height - this.height * 0.1) {
            return this.height - this.height * 0.1;
          }
          return d.y;
        });
    },
    /**
     * This function returns an appropriate color for the node. The more recent the node / keyword, the more intense is the returned color. The color of the node depends on the group.
     * @param d a node of the graph
     * @return {string} color of the node
     */
    color(d) {
      let color = d3.color('black');
      if (d.group < this.colorScale.length) {
        color = d3.color(this.colorScale[d.group]);
      }
      return `rgb(${color.r + (1 - d.age) * (255 - color.r)},${color.g + (1 - d.age) * (255 - color.g)},${color.b + (1 - d.age) * (255 - color.b)})`;
    },
    /**
     * This function determines weather links between nodes are shown or not.
     * @param show {boolean} show or hide the links between nodes
     */
    visualizeLinks(show) {
      if (show) {
        this.link_g.attr('stroke-width', 2);
      } else {
        this.link_g.attr('stroke-width', 0);
      }
    },
    // BEGIN methods that react to events
    /**
     * This function takes multiple utterance of which each utterance has a list of keywords.
     * All passed keywords are rearranged as a graph and then rendered appropriately with d3.js.
     * @param keywordInfos list of utterances. each utterance consist of a list of keywords.
     * @param minAge newest age of all passed keywords
     * @param maxAge oldest age of all passed keywords
     */
    onCurrentUtteranceChanged(keywordInfos, minAge, maxAge) {
      // log all keywords that should be rendered:
      let log = 'Recieved new keywords!\n';
      keywordInfos.forEach((info) => {
        info.forEach((kw) => {
          log += `${kw.word} age: ${kw.age}\n`;
        });
      });
      log += `Min: ${minAge} Max: ${maxAge}`;
      console.log(log);

      // build a map that contains all new keywords
      let newKeywordMap = new Map();
      const newLinks = [];

      // loop over keyword infos for utterance
      keywordInfos.forEach((info) => {
        const wordsInUtterance = [];

        // aggregate keywords
        info.forEach((keyword) => {
          const word = keyword.lemma;
          if (newKeywordMap.has(word)) {
            const updatedWord = newKeywordMap.get(word);
            updatedWord.count += 1;
            updatedWord.age = updatedWord.age > keyword.age ? updatedWord.age : keyword.age;
            newKeywordMap.set(word, updatedWord);
            if (wordsInUtterance.indexOf(updatedWord) < 0) {
              wordsInUtterance.push(updatedWord);
            }
          } else {
            const newWord = {
              id: word,
              group: 1,
              count: 1,
              age: keyword.age,
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

      // normalize ages
      let maxMinDif = maxAge - minAge;
      if (maxMinDif === 0) {
        maxMinDif = 1;
      }
      const scaleFactor = 0.8;
      newKeywordMap.forEach((word) => {
        word.age = scaleFactor * ((word.age - minAge) / maxMinDif) + 0.2;
      });

      // limit node count to settings: sort by age, descending, then only take first n elements
      newKeywordMap = new Map([...newKeywordMap.entries()].sort((a, b) => b[1].age - a[1].age).slice(0, this.settings.wordCloudWords));

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
      // does not seem necessary!

      // add new edges
      newLinks.forEach((link) => {
        this.graph.addEdge(link.source, link.target);
      });

      // update nodes & links
      this.nodes = this.graph.getNodeList();
      this.links = this.graph.getEdgeList();

      this.restart();
    },
    onReset() {
      this.currentNodeID = 0;
      this.nodeIDMap = new Map();
      this.nodeLinkMap = new Map();
      this.nodesMap = new Map();
      this.nodeMapChangeTracker = 0;
      this.nodes = [];
      this.links = [];
      this.newNodeID = 0;
      this.graph = new Graph();
      this.nodes = this.nodes.slice();
      this.links = this.links.slice();
      this.restart();
    },
    onSettingsSaved(settings) {
      this.settings = settings;
      this.visualizeLinks(settings.visualizeLinks === 'true');
    },
    // END methods that react to events
  },
};
</script>

<style scoped>

</style>
