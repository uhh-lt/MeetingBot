<template>
  <div class="tl-container tl-left">
    <div class="tl-content">
      <div class="d-flex">
        <div class="p-2" style="position:relative;">
          <img v-on:click="counter++" :src="'/avatars/'+img" style="position:absolute; margin:auto; left:0; right:0;" class="rounded-circle" alt="speaker-img" width="64" height="64">
          <h6 style="margin-top:74px; white-space: nowrap; text-align:center; min-width:64px;">{{name}} {{utterance.completed}}</h6>
        </div>
        <div class="p-2 flex-grow-1">
          <div style="display:table; height:100%;">
            <div style="display:table-cell; vertical-align:middle;" v-html="html">
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
import $ from 'jquery';

export default {
  name: 'TimelineBox',
  props: ['utterance', 'name', 'img', 'mode', 'showConfidence', 'showKeywords', 'keywordColor'],
  data() {
    return {
      tmpStuff: '',
    };
  },
  computed: {
    html() {
      if (this.utterance.completed) {
        let html = this.visualizeConfidenceAndKeywords();
        setTimeout(function () {
          $('[data-toggle="tooltip"]').tooltip();
        }, 100);
        return html;
      }
      return this.renderUtterance();
    },
  },
  watch: {
    showConfidence(newVal, oldVal) {
      this.visualizeConfidence();
    },
    showKeywords(newVal, oldVal) {
      this.visualizeKeywords();
    },
  },
  methods: {
    renderUtterance() {
      return this.utterance.text;
    },
    visualizeConfidence() {
      const elements = document.getElementsByClassName('visualize-confidence');
      for (let i = 0; i < elements.length; i++) {
        if (this.showConfidence === 'true') {
          elements[i].classList.remove('force-color');
        } else if (this.showConfidence === 'false') {
          elements[i].classList.add('force-color');
        }
      }
    },
    visualizeKeywords() {
      const elements = document.getElementsByClassName('KEYWORD');
      for (let i = 0; i < elements.length; i++) {
        if (this.showKeywords === 'true') {
          elements[i].classList.add('DISPLAYKEYWORD');
          elements[i].style.background = this.keywordColor;
        } else if (this.showKeywords === 'false') {
          elements[i].classList.remove('DISPLAYKEYWORD');
          elements[i].style.background = '';
        }
      }
    },
    visualizeConfidenceAndKeywordsShort() {

    },
    visualizeConfidenceAndKeywords() {
      let replacements = [];

      let index = 0;
      const text = this.utterance.text.split(' ');
      for (let i = 0; i < text.length; i++) {
        const word = text[i];
        const conf = this.utterance.confidences[i];
        const calculatedConf = Math.max(conf * conf, 0.1);
        let spanStart = '';
        if (this.showConfidence === 'true') {
          spanStart += `<span class="visualize-confidence" style="color:rgba(0,0,0,${calculatedConf});">`;
        } else if (this.showConfidence === 'false') {
          spanStart += `<span class="visualize-confidence force-color" style="color:rgba(0,0,0,${calculatedConf});">`;
        }
        const spanEnd = '</span>';

        replacements.push([index, spanStart]);
        index += word.length;
        replacements.push([index, spanEnd]);
        index += 1;
      }

      const { showKeywords } = this;
      const utteranceText = this.utterance.text;
      const { keywordColor } = this;
      if (this.utterance.keywords.length > 0) {
        this.utterance.keywords.forEach((element) => {
          let match;
          const re = new RegExp(`((?:^|\\W))${element.word}(?:$|\\W)`, 'ig');
          while ((match = re.exec(utteranceText)) != null) {
            let spanStart;
            if (showKeywords === 'true') {
              spanStart = `<span class='DISPLAYKEYWORD KEYWORD' style='background:${keywordColor}' data-toggle="tooltip" data-placement="top" title="${element.score}">`;
            } else if (showKeywords === 'false') {
              spanStart = "<span class='KEYWORD'>";
            }
            const spanEnd = '</span>';

            replacements.push([match.index, spanStart]);
            replacements.push([match.index + match[1].length + element.word.length, spanEnd]);
          }
        });
      }

      // Sort the replacements
      replacements = replacements.sort((a, b) => a[0] - b[0]);
      console.log(replacements);

      // Insert the replacements
      let oldText = this.utterance.text;
      let newText = this.utterance.text;
      let offset = 0;
      replacements.forEach((element) => {
        newText = oldText.slice(0, element[0] + offset) + element[1] + oldText.slice(element[0] + offset, oldText.length);
        oldText = newText;
        offset += element[1].length;
      });

      return oldText;
    },
  },
};
</script>

<style scoped>

</style>
