<template>
  <div class="d-flex">
    <div v-for="n in parseInt(speakers)" class="flex-even">
      <div v-if="n === (utterance.speaker + 1)" class="tl-container2 tl-left2">
        <div class="tl-content" style="position:relative;">
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
      <div class="tlcircle">{{utterance.startTime}}</div>
    </div>
  </div>
</template>

<script>
import TimelineUtterance from './TimelineUtterance.vue';

export default {
  name: 'TimelineRow',
  components: { TimelineUtterance },
  props: ['utterance', 'mode', 'showConfidence', 'showKeywords', 'keywordColor', 'speakers'],
};
</script>

<style scoped>

</style>
