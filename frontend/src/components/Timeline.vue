<template>
  <div class="col-8">

    <div class="card" style="margin-top: 1em; margin-bottom:1em;">
      <h5 class="card-header" style="height: 50px;"><span>{{ $t('timeline_title') }}</span></h5>
      <div class="card-body" style="padding:0;">

        <div v-if="settings.timelineView === 'LINE'" id="timeline" ref="timelineRef" class="disable-scrollbars">
          <TimelineBox v-for="utt in displayUtterances" :mode="utteranceMode" :show-confidence="settings.showConfidence" :show-keywords="settings.showKeywords" :keyword-color="settings.keywordColor" :utterance="utt" :name="settings.speakerName[utt[0].speaker]" :img="settings.selectedAvatar[utt[0].speaker]" :key="'line-' + utt[0].id"></TimelineBox>
        </div>

        <div v-if="settings.timelineView === 'LANES'" id="timeline2" ref="timelineRef" class="disable-scrollbars">
          <div class="d-flex stickytimelineheader">
            <div v-for="(n, id) in settings.speaker" :key="'speaker-'+id" class="p-1 flex-even bg-light" style="border-bottom: 1px solid rgba(0,0,0,.125);">
              <div class="p-1" style="position:relative;">
                <img :src="'/avatars/' + settings.selectedAvatar[id]" style="position:absolute; margin:auto; left:0; right:0;" class="rounded-circle" alt="speaker-img" width="64" height="64">
                <h6 style="margin-top:74px; text-align:center;">{{settings.speakerName[id]}}</h6>
              </div>
            </div>
            <div class="p-1 bg-light" style="position:relative; width:66px; border-bottom: 1px solid rgba(0,0,0,.125);">
              <div class="tlline"></div>
            </div>
          </div>
          <TimelineRow v-for="utt in displayUtterances" :speakers="settings.speaker" :mode="utteranceMode" :show-confidence="settings.showConfidence" :show-keywords="settings.showKeywords" :keyword-color="settings.keywordColor" :utterance="utt" :name="settings.speakerName[utt[0].speaker]" :key="'lanes-' + utt[0].id"></TimelineRow>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import TimelineBox from './TimelineBox.vue';
import TimelineRow from './TimelineRow.vue';

export default {
  name: 'Timeline',
  components: { TimelineRow, TimelineBox },
  props: ['utterances', 'utteranceIDMap', 'utteranceMode'],
  mounted() {
    // listen to vue events
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);
    this.$root.$on('onReset', this.onReset);
    this.$root.$on('onIntersection', this.onIntersection);
    this.$root.$on('onRecheckCurrentUtteranceChange', this.checkForCurrentUtteranceChange);

    // listen to html events
    this.$refs.timelineRef.addEventListener('wheel', () => {
      this.sendOnWheelScroll(Date.now());
      this.getTimeline().stop();
    });
  },
  computed: {
    displayUtterances() {
      if (this.settings.timelineSorting === 'ASC') {
        return this.calcGroupedUtterances();
      }
      return this.calcGroupedUtterances().reverse();
    },
  },
  data() {
    return {
      settings: {
        speaker: 4,
        speakerName: ['Sprecher 1', 'Sprecher 2', 'Sprecher 3', 'Sprecher 4'],
        selectedAvatar: ['avatar1.png', 'avatar1.png', 'avatar1.png', 'avatar1.png'],
        timelineSorting: 'DESC',
        timelineView: 'LINE',
        showConfidence: 'false',
        showKeywords: 'true',
        keywordColor: 'rgb(255, 255, 0)',
        range: 10,
        randomSpeaker: 'false',
        controlButtonsStateDependent: 'false',
      },
      currentUtterance: -1,
      currentBubble: -1,
      intersectingElements: new Map(),
    };
  },
  methods: {
    sendOnWheelScroll(time) {
      this.$root.$emit('onWheelScroll', time);
    },
    sendOnCurrentUtteranceChanged(keywords, minRange, maxRange) {
      this.$root.$emit('onCurrentUtteranceChanged', keywords, minRange, maxRange);
    },
    calcGroupedUtterances() {
      const groupedUtterances = [];
      let lastSpeaker = -1;
      this.utterances.forEach((utterance) => {
        // same speaker => add to utterance group
        if (utterance.speaker === lastSpeaker) {
          const utteranceGroup = groupedUtterances.pop();
          utteranceGroup.push(utterance);
          groupedUtterances.push(utteranceGroup);

          // other speaker => create new utterance group
        } else {
          groupedUtterances.push([utterance]);
        }
        // update last speaker
        lastSpeaker = utterance.speaker;
      });
      return groupedUtterances;
    },
    getTimeline() {
      if (this.settings.timelineView === 'LINE') {
        return $('#timeline');
      }
      return $('#timeline2');
    },
    onSettingsSaved(settings) {
      this.onSortingChanged(this.settings, settings);
      this.onTimelineViewChanged(this.settings, settings);
      this.settings = settings;
    },
    onReset() {
      this.currentUtterance = -1;
      this.currentBubble = -1;
      this.intersectingElements = new Map();
    },
    onSortingChanged(oldSettings, newSettings) {
      if (oldSettings.timelineSorting !== newSettings.timelineSorting) {
        window.requestAnimationFrame(() => {
          // scroll to bot if timeline sorting changed to ASC
          if (newSettings.timelineSorting === 'ASC') {
            this.getTimeline().stop().animate({ scrollTop: this.getTimeline()[0].scrollHeight }, 500);
            // this.$refs.timelineRef.scrollTop = this.$refs.timelineRef.scrollHeight;
          }
          // scroll to top if timeline sorting changed to DESC
          if (newSettings.timelineSorting === 'DESC') {
            this.getTimeline().stop().animate({ scrollTop: 0 }, 500);
            // this.$refs.timelineRef.scrollTop = 0;
          }
        });
      }
    },
    onTimelineViewChanged(oldSettings, newSettings) {
      if (oldSettings.timelineView !== newSettings.timelineView) {
        this.intersectingElements = new Map();
        // find current utterance bubble and then scroll to this element
        window.requestAnimationFrame(() => {
          const allContainers = this.getTimeline()[0].querySelectorAll('.timelinecontainer:not(.nodisplay)');
          const currentUtterance = this.currentUtterance.toString(10);
          let currentContainer = null;
          for (let id = 0; id < allContainers.length; id += 1) {
            const container = allContainers[id];
            if (container.dataset.utteranceid === currentUtterance) {
              currentContainer = container;
              break;
            }
          }
          if (currentContainer !== null) {
            const timeline = this.getTimeline();
            const value = currentContainer.offsetTop - timeline[0].offsetHeight / 2 + currentContainer.offsetHeight / 2;
            timeline.stop().animate({ scrollTop: value }, 500);
          }
        });
      }
    },
    onIntersection(entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.intersectingElements.set(entry.target.id, entry.target);
        } else {
          this.intersectingElements.delete(entry.target.id);
        }
      });
      // visible containers have changed, therefore, check if currentUtterance has changed and new keywords should be sent
      this.checkForCurrentUtteranceChange(false);
    },
    checkForCurrentUtteranceChange(forceUpdateIfTop) {
      // this method checks if the current bubble has changed
      // if the current bubble has changed, all keywords surrounding the current bubble are collected & sent

      // force update if scroll is top
      if (forceUpdateIfTop && this.$refs.timelineRef.scrollTop === 0) {
        // force update by setting this.currentUtterance to -1
        this.currentUtterance = -1;
        this.currentBubble = -1;
      }

      const middle = this.$refs.timelineRef.scrollTop + this.$refs.timelineRef.clientHeight / 2 - 100;
      const allVisibleContainers = Array.from(this.intersectingElements.values()).filter(container => !container.classList.contains('nodisplay'));

      let container;
      let nearestContainer = -1;
      let nearestUtterance = -1;
      let distance = -1;
      let minDistance = 10000000;
      for (let id = 0; id < allVisibleContainers.length; id += 1) {
        container = allVisibleContainers[id];
        container.getElementsByClassName('timelinecontainer2')[0].style.borderColor = '';
        distance = Math.abs(container.offsetTop - middle);
        if (distance < minDistance) {
          minDistance = distance;
          nearestContainer = id;
          nearestUtterance = parseInt(container.dataset.utteranceid, 10);
        }
      }

      if (nearestContainer === -1 || nearestUtterance === -1) {
        return;
      }

      allVisibleContainers[nearestContainer].getElementsByClassName('timelinecontainer2')[0].style.borderColor = 'grey';

      if (this.currentUtterance !== nearestUtterance) {
        this.currentUtterance = nearestUtterance;
        // collect keywords from utterances around current utterance
        const keywordInfos = [];
        let minRange = 0;
        let maxRange = 0;

        if (this.utteranceMode === 'FULL') {
          minRange = Math.max(this.currentUtterance - this.settings.range, 0);
          maxRange = Math.min(this.currentUtterance + this.settings.range, this.utterances.length - 1);
          for (let utteranceID = minRange; utteranceID <= maxRange; utteranceID += 1) {
            const { keywordInfo } = this.utteranceIDMap.get(utteranceID);
            // eslint-disable-next-line no-param-reassign
            keywordInfo.forEach((info) => { info.age = utteranceID; });
            keywordInfos.push(keywordInfo);
          }
        } else {
          let utteranceID = this.currentUtterance;
          const { keywordInfo } = this.utteranceIDMap.get(utteranceID);
          // eslint-disable-next-line no-param-reassign
          keywordInfo.forEach((info) => { info.age = utteranceID; });
          keywordInfos.push(keywordInfo);

          let i = 0;
          utteranceID = this.currentUtterance + 1;
          while (i < this.settings.range && utteranceID <= this.utterances.length - 1) {
            // eslint-disable-next-line no-shadow
            const { keywordInfo } = this.utteranceIDMap.get(utteranceID);
            // if there are keywords in this utterance ...
            if (keywordInfo.length > 0) {
              // ... add this keywords to the word graph
              // eslint-disable-next-line no-param-reassign
              keywordInfo.forEach((info) => { info.age = utteranceID; });
              keywordInfos.push(keywordInfo);
              i += 1;
            }
            utteranceID += 1;
          }
          maxRange = utteranceID - 1;

          i = 0;
          utteranceID = this.currentUtterance - 1;
          while (i < this.settings.range && utteranceID >= 0) {
            // eslint-disable-next-line no-shadow
            const { keywordInfo } = this.utteranceIDMap.get(utteranceID);
            // if there are keywords in this utterance ...
            if (keywordInfo.length > 0) {
              // ... add this keywords to the word graph
              // eslint-disable-next-line no-param-reassign
              keywordInfo.forEach((info) => { info.age = utteranceID; });
              keywordInfos.push(keywordInfo);
              i += 1;
            }
            utteranceID -= 1;
          }
          minRange = utteranceID + 1;
        }

        const standardRange = 2 * this.settings.range + 1;
        const adaptiveRange = maxRange - minRange + 1;
        const totalRange = Math.max(standardRange, adaptiveRange);
        const newMaxRange = totalRange + minRange - 1; // upscaled max range
        this.sendOnCurrentUtteranceChanged(keywordInfos, minRange, newMaxRange);
      }
      // // BASED ON BUBBLES
      // if (this.currentBubble !== nearestContainer) {
      //   this.currentBubble = nearestContainer;
      //
      //   const allContainers = this.$refs.timelineRef.querySelectorAll('.timelinecontainer:not(.nodisplay)');
      //
      //   // collect keywords from utterances around current utterance
      //   // richtig für descending
      //   const keywordInfos = [];
      //   const minRange = Math.max(this.currentBubble - this.settings.range, 0);
      //   const maxRange = Math.min(this.currentBubble + this.settings.range, allContainers.length - 1);
      //
      //   if (this.settings.timelineSorting === 'DESC') {
      //     for (let i = minRange; i <= maxRange; i += 1) {
      //       const utteranceID = parseInt(allContainers[i].dataset.utteranceid, 10);
      //       const numUtterances = parseInt(allContainers[i].dataset.numutterances, 10);
      //
      //       for (let j = utteranceID; j < utteranceID + numUtterances; j += 1) {
      //         const { keywordInfo } = this.utteranceIDMap.get(j);
      //         // eslint-disable-next-line no-param-reassign
      //         keywordInfo.forEach((info) => { info.age = i; });
      //         keywordInfos.push(keywordInfo);
      //       }
      //     }
      //   } else if (this.settings.timelineSorting === 'ASC') {
      //     for (let i = minRange; i <= maxRange; i += 1) {
      //       const utteranceID = parseInt(allContainers[i].dataset.utteranceid, 10);
      //       const numUtterances = parseInt(allContainers[i].dataset.numutterances, 10);
      //
      //       for (let j = utteranceID; j < utteranceID + numUtterances; j += 1) {
      //         const { keywordInfo } = this.utteranceIDMap.get(j);
      //         // eslint-disable-next-line no-param-reassign
      //         keywordInfo.forEach((info) => { info.age = minRange + maxRange - i; });
      //         keywordInfos.push(keywordInfo);
      //       }
      //     }
      //   }
      //
      //   const totalRange = 2 * this.settings.range + 1;
      //   const newMinRange = Math.max(this.currentBubble - this.settings.range, 0);
      //   const newMaxRange = (totalRange - (maxRange - minRange + 1)) + maxRange;
      //   this.sendOnCurrentUtteranceChanged(keywordInfos, newMinRange, newMaxRange);
      // }
    },
  },
};
</script>

<style scoped>

</style>
