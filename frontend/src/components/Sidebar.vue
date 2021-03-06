<template>
  <div id="sidebar">
    <div class="card sidebar-element">
      <h5 class="card-header" style="height: 50px;">
        <i v-if="!sidebarElements[0]" v-on:click="toggleSidebarElement(0)" class="fas fa-chevron-down"></i>
        <i v-if="sidebarElements[0]" v-on:click="toggleSidebarElement(0)" class="fas fa-chevron-up"></i>
        <span style="margin-left:0.5em;">{{ $t('sidebar_agenda') }}</span>
      </h5>
      <div :class="sidebarElements[0] ? 'card-body' : 'card-body hide'" :style="sidebarBodyHeights[0]">
        <AgendaVisualizer></AgendaVisualizer>
      </div>
    </div>

    <div class="card sidebar-element">
      <h5 class="card-header" style="height: 50px;">
        <i v-if="!sidebarElements[1]" v-on:click="toggleSidebarElement(1)" class="fas fa-chevron-down"></i>
        <i v-if="sidebarElements[1]" v-on:click="toggleSidebarElement(1)" class="fas fa-chevron-up"></i>
        <span style="margin-left:0.5em;">{{ $t('sidebar_wordcloud') }}</span>
      </h5>
      <div id="wordcloud-container" :class="sidebarElements[1] ? 'card-body' : 'card-body hide'" :style="sidebarBodyHeights[1]">
        <WordGraph :width="wordCloudSize.width" :height="wordCloudSize.height"></WordGraph>
      </div>
    </div>

    <div class="card sidebar-element">
      <h5 class="card-header" style="height: 50px;">
        <i v-if="!sidebarElements[2]" v-on:click="toggleSidebarElement(2)" class="fas fa-chevron-down"></i>
        <i v-if="sidebarElements[2]" v-on:click="toggleSidebarElement(2)" class="fas fa-chevron-up"></i>
        <span style="margin-left:0.5em;">{{ $t('sidebar_speakerpercentages') }}</span>
      </h5>
      <div :class="sidebarElements[2] ? 'card-body' : 'card-body hide'" :style="sidebarBodyHeights[2]">
        <bar-chart :speaker-names="speakerName" :speaker-count="speakerCount" :open-sidebar-elements="numOpenSidebarElements"></bar-chart>
      </div>
    </div>

  </div>
</template>

<script>
import AgendaVisualizer from './AgendaVisualizer.vue';
import WordGraph from './WordGraph.vue';
import BarChart from './BarChart.vue';

/**
 * This component allows to display 3 sidebar elements.
 * It handles opening, closing and resizing of the sidebar elements.
 */
export default {
  name: 'Sidebar',
  props: ['speakerName', 'speakerCount'],
  components: {
    BarChart, WordGraph, AgendaVisualizer,
  },
  data() {
    return {
      sidebarElements: [false, false, false],
      sidebarBodyHeights: ['', '', ''],
      sidebarHeights: [0, 0, 0],
      updatingWordCloud: false,
      wordCloudSize: {
        height: 0,
        width: 0,
      },
    };
  },
  computed: {
    numOpenSidebarElements() {
      return this.sidebarElements.map(value => value * 1)
        .reduce((pv, cv) => pv + cv, 0);
    },
  },
  created() {
    window.addEventListener('resize', this.updateSidebarHeights);
  },
  methods: {
    /**
     * This function handles opening & closing of sidebar elements
     * @param element the sidebar element
     */
    toggleSidebarElement(element) {
      this.sidebarElements[element] = !this.sidebarElements[element];
      this.sidebarElements = this.sidebarElements.slice(0);
      this.updateSidebarHeights();
    },
    /**
     * This function handles resizing of sidebar elements
     */
    updateSidebarHeights() {
      const result = Array(this.sidebarElements.length).fill('');
      if (window && document && document.getElementById('navigation') && document.getElementById('footer') && document.getElementsByClassName('card-header').length > 0) {
        const navbarHeight = document.getElementById('navigation').clientHeight;
        const footerHeight = document.getElementById('footer').clientHeight;
        const maxSidebarHeight = window.innerHeight - navbarHeight - footerHeight - 2;
        const sidebarHeaderHeight = document.getElementsByClassName('card-header')[0].clientHeight + 3;
        const activeElements = this.numOpenSidebarElements;
        const totalElements = this.sidebarElements.length;
        const margins = (2 + totalElements - 1) / activeElements;
        for (let i = 0; i < this.sidebarElements.length; i += 1) {
          if (this.sidebarElements[i]) {
            result[i] = `height: calc(${(maxSidebarHeight - totalElements * sidebarHeaderHeight) / activeElements}px - ${margins}em)`;
          }
        }
      }
      this.sidebarBodyHeights = result;
      if (!this.updatingWordCloud) {
        this.updatingWordCloud = true;
        setTimeout(() => {
          console.log('update word-cloud heights');
          console.log(document.getElementById('wordcloud-container'));
          if (document.getElementById('wordcloud-container')) {
            const container = document.getElementById('wordcloud-container');
            this.wordCloudSize.height = container.clientHeight;
            this.wordCloudSize.width = container.clientWidth;
            console.log(this.wordCloudSize);
          } else {
            this.wordCloudSize.height = 0;
            this.wordCloudSize.width = 0;
          }
          this.updatingWordCloud = false;
        }, 1000);
      }
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

  #wordcloud-container {
    padding:0 !important;
  }
</style>
