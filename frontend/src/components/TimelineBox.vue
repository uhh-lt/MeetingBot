<template>
  <div class="tl-container tl-left">
    <div class="tl-content">
      <div class="d-flex">
        <div class="p-2" style="position:relative;">
          <img v-on:click="counter++" :src="'/avatars/'+img" style="position:absolute; margin:auto; left:0; right:0;" class="rounded-circle" alt="speaker-img" width="64" height="64">
          <h6 style="margin-top:74px; white-space: nowrap; text-align:center; min-width:64px;">{{name}}</h6>
        </div>
        <div class="p-2 flex-grow-1">
          <div style="display:table; height:100%;">
            <div style="display:table-cell; vertical-align:middle;">
              <timeline-utterance :utterance="utterance" :mode="mode" :show-confidence="showConfidence" :show-keywords="showKeywords" :keyword-color="keywordColor"></timeline-utterance>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="timelinecircle">
      {{utterance.startTime}}
    </div>
  </div>
</template>

<script>
import TimelineUtterance from './TimelineUtterance.vue';

export default {
  name: 'TimelineBox',
  components: { TimelineUtterance },
  props: ['utterance', 'name', 'img', 'mode', 'showConfidence', 'showKeywords', 'keywordColor'],
};
</script>

<style scoped>

</style>
