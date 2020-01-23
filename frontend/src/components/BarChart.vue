<template>
  <svg id="chart" width="100%" height="100%"></svg>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'BarChart',
  props: ['speakerCount', 'speakerNames', 'openSidebarElements'],
  data() {
    return {
      redeanteil: [0, 0, 0, 0],
      redeanteilInProzent: [0, 0, 0, 0],
      data: [
        {
          speaker: 'Speaker 1',
          redeanteil: 0,
        },
        {
          speaker: 'Speaker 2',
          redeanteil: 0,
        },
        {
          speaker: 'Speaker 3',
          redeanteil: 0,
        },
        {
          speaker: 'Speaker 4',
          redeanteil: 0,
        },
      ],
      svg: null,
      margin: {
        top: 0, right: 20, bottom: 20, left: 10,
      },
      x: null,
      y: null,
      g: null,
    };
  },
  computed: {
    barChartData() {
      return this.data;
    },
    speakers() {
      return parseInt(this.speakerCount, 10);
    },
  },
  mounted() {
    this.$root.$on('onCompleteUtterance', this.onCompleteUtterance);
    this.$root.$on('onReset', this.onReset);
    this.initBarChart();
  },
  watch: {
    data() {
      this.loadData();
    },
    speakerNames() {
      this.loadData();
    },
    speakerCount() {
      this.loadData();
    },
    openSidebarElements() {
      this.draw();
    },
  },
  methods: {
    onReset() {
      this.redeanteil = [0, 0, 0, 0];
      this.redeanteilInProzent = [0, 0, 0, 0];
      this.data = [
        {
          speaker: 'Speaker 1',
          redeanteil: 0,
        },
        {
          speaker: 'Speaker 2',
          redeanteil: 0,
        },
        {
          speaker: 'Speaker 3',
          redeanteil: 0,
        },
        {
          speaker: 'Speaker 4',
          redeanteil: 0,
        },
      ];
    },
    onCompleteUtterance(utterance, data, speaker) {
      // update redeanteil
      this.redeanteil[speaker] += data.length;

      // compute redeanteil in percent
      const totalRedeanteil = this.redeanteil.reduce((total, num) => total + num);
      for (let spkr = 0; spkr < this.redeanteil.length; spkr += 1) {
        this.redeanteilInProzent[spkr] = this.redeanteil[spkr] / totalRedeanteil;
      }

      // update data
      this.data = [];
      for (let i = 0; i < this.speakers; i += 1) {
        this.data[i] = {
          speaker: this.speakerNames[i],
          redeanteil: this.redeanteilInProzent[i],
        };
      }
      this.data = this.data.slice(0);
    },
    initBarChart() {
      // SETUP
      this.svg = d3.select('#chart');
      this.x = d3.scaleLinear();
      this.y = d3.scaleBand().padding(0.1);

      this.g = this.svg.append('g')
        .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

      this.g.append('g')
        .attr('class', 'axis axis--x');

      this.g.append('g')
        .attr('class', 'axis axis--y');

      window.addEventListener('resize', this.draw);
    },
    loadData() {
      this.x.domain([0, 1]);
      this.y.domain(this.data.map(d => d.speaker));
      this.draw();
    },
    draw() {
      const bounds = this.svg.node().getBoundingClientRect();
      const width = bounds.width - this.margin.left - this.margin.right;
      const height = bounds.height - this.margin.top - this.margin.bottom;

      this.x.rangeRound([0, width]);
      this.y.rangeRound([height, 0]);

      this.g.select('.axis--x')
        .attr('font-size', '14')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(this.x).ticks(10, '%'));

      this.g.select('.axis--y')
        .attr('font-size', '14')
        .call(d3.axisLeft(this.y))
        .selectAll('text')
        .attr('fill', 'none');
      // .style('text-anchor', 'middle')
      // .attr('x', '0')
      // .attr('dx', '0em')
      // .attr('dy', '-1em')
      // .attr('transform', 'rotate(-90)');

      const bars = this.g.selectAll('.bar')
        .data(this.data);

      // ENTER
      bars
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', 5)
        .attr('y', d => this.y(d.speaker))
        .attr('width', d => this.x(d.redeanteil))
        .attr('height', this.y.bandwidth());

      // UPDATE
      bars.attr('x', 5)
        .attr('y', d => this.y(d.speaker))
        .attr('width', d => this.x(d.redeanteil))
        .attr('height', this.y.bandwidth());

      // EXIT
      bars.exit()
        .remove();

      const texts = this.g.selectAll('.txt')
        .data(this.data);

      // ENTER
      texts
        .enter().append('text')
        .attr('class', 'txt')
        .style('text-anchor', 'start')
        .attr('fill', 'black')
        .attr('x', d => this.x(d.redeanteil) + 8)
        .attr('y', d => this.y(d.speaker) + this.y.bandwidth() / 2 + 6)
        .text(d => d.speaker);

      // UPDATE
      texts
        .attr('x', d => this.x(d.redeanteil) + 8)
        .attr('y', d => this.y(d.speaker) + this.y.bandwidth() / 2 + 6)
        .text(d => d.speaker);

      // EXIT
      texts.exit()
        .remove();
    },
  },
};
</script>

<style>
  .bar {
    fill: rgba(40, 167, 69, 0.2);
    stroke-width: 1;
    stroke: #28a745;
  }
</style>
