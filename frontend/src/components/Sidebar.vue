<template>
  <div id="sidebar">
    <div class="card sidebar-element">
      <h5 class="card-header" style="height: 50px;">
        <i v-if="!sidebarElements[0]" v-on:click="toggleSidebarElement(0)" class="fas fa-chevron-down"></i>
        <i v-if="sidebarElements[0]" v-on:click="toggleSidebarElement(0)" class="fas fa-chevron-up"></i>
        <span style="margin-left:0.5em;">Redeanteile (in %)</span>
      </h5>
      <div :class="sidebarElements[0] ? 'card-body' : 'card-body hide'" :style="sidebarBodyHeights[0]">
        <bar-chart :speaker-names="speakerName" :speaker-count="speakerCount" :styles="{position: 'relative', height: '100%'}"></bar-chart>
      </div>
    </div>

    <div class="card sidebar-element">
      <h5 class="card-header" style="height: 50px;">
        <i v-if="!sidebarElements[1]" v-on:click="toggleSidebarElement(1)" class="fas fa-chevron-down"></i>
        <i v-if="sidebarElements[1]" v-on:click="toggleSidebarElement(1)" class="fas fa-chevron-up"></i>
        <span style="margin-left:0.5em;">Redeanteile (in %)</span>
      </h5>
      <div :class="sidebarElements[1] ? 'card-body' : 'card-body hide'" :style="sidebarBodyHeights[1]">
        <p>Some Element :D</p>
      </div>
    </div>

    <div class="card sidebar-element">
      <h5 class="card-header" style="height: 50px;">
        <i v-if="!sidebarElements[2]" v-on:click="toggleSidebarElement(2)" class="fas fa-chevron-down"></i>
        <i v-if="sidebarElements[2]" v-on:click="toggleSidebarElement(2)" class="fas fa-chevron-up"></i>
        <span style="margin-left:0.5em;">Redeanteile (in %)</span>
      </h5>
      <div :class="sidebarElements[2] ? 'card-body' : 'card-body hide'" :style="sidebarBodyHeights[2]">
        <p>Some Element :D</p>
      </div>
    </div>

  </div>
</template>

<script>
import BarChart from './BarChart';

export default {
  name: 'Sidebar',
  props: ['speakerName', 'speakerCount'],
  components: { BarChart },
  data() {
    return {
      sidebarElements: [false, false, false],
      sidebarBodyHeights: ['', '', ''],
    };
  },
  created() {
    window.addEventListener('resize', this.updateSidebarHeights);
  },
  methods: {
    numOpenSidebarElements() {
      return this.sidebarElements.map(value => value * 1)
        .reduce((pv, cv) => pv + cv, 0);
    },
    toggleSidebarElement(element) {
      this.sidebarElements[element] = !this.sidebarElements[element];
      this.sidebarElements = this.sidebarElements.slice(0);
      this.updateSidebarHeights();
    },
    updateSidebarHeights() {
      const result = Array(this.sidebarElements.length).fill('');
      if (window && document && document.getElementById('navigation') && document.getElementById('footer') && document.getElementsByClassName('card-header').length > 0) {
        const navbarHeight = document.getElementById('navigation').clientHeight;
        const footerHeight = document.getElementById('footer').clientHeight;
        const maxSidebarHeight = window.innerHeight - navbarHeight - footerHeight - 2;
        const sidebarHeaderHeight = document.getElementsByClassName('card-header')[0].clientHeight + 3;
        const activeElements = this.numOpenSidebarElements();
        const totalElements = this.sidebarElements.length;
        const margins = (2 + totalElements - 1) / activeElements;
        for (let i = 0; i < this.sidebarElements.length; i++) {
          if (this.sidebarElements[i]) {
            result[i] = `height: calc(${(maxSidebarHeight - totalElements * sidebarHeaderHeight) / activeElements}px - ${margins}em)`;
          }
        }
      }
      this.sidebarBodyHeights = result;
    },
  },
};
</script>

<style scoped>
  #sidebar {
    height: 100%;
    padding-top: 1em;
  }

  .sidebar-element {
    margin-bottom: 1em;
  }

  .hide {
    display: none;
  }
</style>
