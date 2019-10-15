<template>
  <div class="d-flex" :class="{nodisplay: numLetters === 0}">
    <div v-for="n in parseInt(speakers)" class="flex-even" :key="'timeline-row-'+n">
      <div v-if="n === (utterance[0].speaker + 1)" class="timelinecontainer tl-container2 tl-left2" :data-utteranceid="utterance[0].id" :data-numutterances="utterance.length">
        <div class="timelinecontainer2 tl-content" style="position:relative;">
          <div style="display:table; height:100%;">
            <div style="display:table-cell; vertical-align:middle;">
              <timeline-utterance :utterance="utterance" :mode="mode" :show-confidence="showConfidence" :show-keywords="showKeywords" :keyword-color="keywordColor"></timeline-utterance>
            </div>
          </div>
        </div>
        <div class="tl-left-line" :style="'width:calc(' + ((parseInt(speakers) - n) * 100) + '% + 2px);'"></div>
      </div>
    </div>
    <div class="p-1" style="position:relative; width:66px;">
      <div class="tlline"></div>
      <div class="tlcircle">{{utterance[0].startTime}}</div>
    </div>
  </div>
</template>

<script>
import TimelineUtterance from './TimelineUtterance.vue';

export default {
  name: 'TimelineRow',
  components: { TimelineUtterance },
  props: ['utterance', 'mode', 'showConfidence', 'showKeywords', 'keywordColor', 'speakers'],
  data() {
    return {
      numLetters: 0,
    };
  },
  methods: {
    updateLetterCount(text) {
      this.numLetters = text.length;
    },
  },
};
</script>

<style scoped>
  .nodisplay {
    display: none !important;
  }
</style>
