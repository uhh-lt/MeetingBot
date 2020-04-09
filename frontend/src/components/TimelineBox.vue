<template>
  <div :id="'timelinebox-'+utterance[0].id" class="timelinecontainer tl-container tl-left" :class="{nodisplay: numLetters === 0}" :data-utteranceid="utterance[0].id" :data-numutterances="utterance.length">
    <div class="timelinecontainer2 tl-content">
      <div class="d-flex">
        <div class="p-2" style="position:relative;">
          <img v-if="mode === 'FULL'" :src="'/avatars/'+img" style="position:absolute; margin:auto; left:0; right:0;" class="rounded-circle" alt="speaker-img" width="64" height="64">
          <h6 v-if="mode === 'FULL'" style="margin-top:74px; white-space: nowrap; text-align:center; min-width:64px;">{{name}}</h6>
          <div v-else style="margin:0; white-space: nowrap; text-align:center; min-width:64px;">{{name}}</div>
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
      {{utterance[0].startTime}}
    </div>
  </div>
</template>

<script>
import TimelineUtterance from './TimelineUtterance.vue';

/**
 * This component visualizes grouped utterances for a speaker as a speech bubble. It is used for the timeline setting 'conversation history as a single line'.
 * To render the utterance itself, this component makes use of the timeline utterance component.
 */
export default {
  name: 'TimelineBox',
  components: { TimelineUtterance },
  props: ['utterance', 'name', 'img', 'mode', 'showConfidence', 'showKeywords', 'keywordColor'],
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
      root: document.querySelector('#timeline'),
      rootMargin: '0px',
      threshold: 0,
    };
    const observer = new IntersectionObserver(callback, options);
    observer.observe(document.querySelector(`#timelinebox-${this.utterance[0].id}`));
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
    display: none;
  }
</style>
