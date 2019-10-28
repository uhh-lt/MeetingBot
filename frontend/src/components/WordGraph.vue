<template>
  <div class="svg-container">
    <svg :style="'width:'+width+'px; height:'+height+'px'"></svg>
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */

import * as d3 from 'd3';
import Graph from '../helper/graph';

export default {
  name: 'WordGraph',
  props: ['height', 'width'],
  data() {
    return {
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
      node_g: null,
      link: null,
      link_g: null,
      simulation: null,
      newNodeID: 0,
      graph: new Graph(),
    };
  },
  watch: {
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
    this.$root.$on('onCurrentUtteranceChanged', this.onCurrentUtteranceChanged);
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);

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
  methods: {
    visualizeLinks(show) {
      if (show) {
        this.link_g.attr('stroke-width', 2);
      } else {
        this.link_g.attr('stroke-width', 0);
      }
    },
    onSettingsSaved(settings) {
      this.visualizeLinks(settings.visualizeLinks === 'true');
    },
    onCurrentUtteranceChanged(keywordInfos, minAge, maxAge) {
      console.log('Recieved new keywords!');
      console.log(keywordInfos);

      // build a map that contains all new keywords
      const newKeywordMap = new Map();
      const newLinks = [];

      // loop over keyword infos for utterance
      keywordInfos.forEach((info) => {
        const wordsInUtterance = [];

        // aggregate keywords
        const lowKeywords = info.flatMap((value) => {
          const newValue = value;
          newValue.phrase = value.phrase.toLowerCase();
          return newValue;
        });
        lowKeywords.forEach((keyword) => {
          const word = keyword.phrase;
          if (newKeywordMap.has(word)) {
            const updatedWord = newKeywordMap.get(word);
            const age1 = updatedWord.age;
            const age2 = keyword.age;
            updatedWord.count += 1;
            updatedWord.age = age1 < age2 ? age1 : age2;
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

      // // normalize ages
      const maxMinDif = maxAge - minAge;
      const scaleFactor = 9 / 10;
      newKeywordMap.forEach((word) => {
        word.age = scaleFactor * ((word.age - minAge) / maxMinDif);
      });

      console.log(newKeywordMap);

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

      this.restart();
    },
    color(d) {
      const color = d3.color(this.colorScale(d.group));
      return `rgb(${color.r + d.age * (255 - color.r)},${color.g + d.age * (255 - color.g)},${color.b + d.age * (255 - color.b)})`;
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

      const result = this.graph.connectedComponents();
      let group = 0;
      result.forEach((connectedComponent) => {
        connectedComponent.forEach((node) => {
          node.group = group;
        });
        group += 1;
      });
      console.log(result);
    },
  },
};
</script>

<style scoped>

</style>
