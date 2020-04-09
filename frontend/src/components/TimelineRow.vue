<template>
  <div class="d-flex" :class="{nodisplay: numLetters === 0}">
    <div v-for="n in parseInt(speakers)" class="flex-even" :key="'timeline-row-'+n">
      <div v-if="n === (utterance[0].speaker + 1)" class="timelinecontainer tl-container2 tl-left2" :id="'timelinerow-'+utterance[0].id" :data-utteranceid="utterance[0].id" :data-numutterances="utterance.length">
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

/**
 * This component visualizes grouped utterances for a speaker as a speech bubble. However, the speech bubbles are arranged in a table-like structure, so that each speaker has its own column. This component is used for the timeline setting 'conversation history with one line per speaker'.
 * To render the utterance itself, this component makes use of the timeline utterance component.
 */
export default {
  name: 'TimelineRow',
  components: { TimelineUtterance },
  props: ['utterance', 'mode', 'showConfidence', 'showKeywords', 'keywordColor', 'speakers'],
  data() {
    return {
      numLetters: 0,
    };
  },
  mounted() {
    // the following code initializes the onIntersection event
    // this event is sent to and used by the timeline component
    // we use this event to find out weather the user sees a new speech bubble (and therefore has scrolled)
    const callback = (entries) => {
      this.$root.$emit('onIntersection', entries);
    };
    const options = {
      root: document.querySelector('#timeline2'),
      rootMargin: '0px',
      threshold: 0,
    };
    const observer = new IntersectionObserver(callback, options);
    observer.observe(document.querySelector(`#timelinerow-${this.utterance[0].id}`));
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
