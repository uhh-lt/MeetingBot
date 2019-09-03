<template>
  <div v-html="html"></div>
</template>

<script>
import $ from 'jquery';

export default {
  name: 'TimelineUtterance',
  props: ['utterance', 'mode', 'showConfidence', 'showKeywords', 'keywordColor'],
  computed: {
    html() {
      if (this.utterance.completed) {
        let html;
        console.log('MODE');
        console.log(this.mode);
        switch (this.mode) {
          case 'FULL':
            html = this.visualizeConfidenceAndKeywordsFull();
            break;
          case 'MEDIUM':
            html = this.visualizeConfidenceAndKeywordsMedium();
            break;
          case 'SHORT':
            html = this.visualizeConfidenceAndKeywordsShort();
            break;
        }
        setTimeout(() => {
          $('[data-toggle="tooltip"]').tooltip();
        }, 100);
        return html;
      }
      return this.renderUtterance();
    },
  },
  methods: {
    renderUtterance() {
      return this.utterance.text;
    },
    inList(item, list) {
      return list.indexOf(item) >= 0;
    },
    fillArray(value, len) {
      return Array(len).fill(value);
    },
    confword2HTML(word, confidence) {
      let confidenceSpan;
      if (this.showConfidence === 'true') {
        confidenceSpan = `<span class="visualize-confidence" style="color:rgba(0,0,0,${confidence});">`;
      } else if (this.showConfidence === 'false') {
        confidenceSpan = `<span class="visualize-confidence force-color" style="color:rgba(0,0,0,${confidence});">`;
      }
      return `${confidenceSpan}${word}</span> `;
    },
    keyword2HTML(word, confidence) {
      let confidenceSpan;
      let keywordSpan;
      if (this.showConfidence === 'true') {
        confidenceSpan = `<span class="visualize-confidence" style="color:rgba(0,0,0,${confidence});">`;
      } else if (this.showConfidence === 'false') {
        confidenceSpan = `<span class="visualize-confidence force-color" style="color:rgba(0,0,0,${confidence});">`;
      }
      if (this.showKeywords === 'true') {
        keywordSpan = `<span class='DISPLAYKEYWORD KEYWORD' style='background:${this.keywordColor}' data-toggle="tooltip" data-placement="top" title="Score:">`;
      } else if (this.showKeywords === 'false') {
        keywordSpan = "<span class='KEYWORD'>";
      }
      return `${keywordSpan}${confidenceSpan}${word} </span></span>`;
    },
    visualizeConfidenceAndKeywordsShort() {
      let { keywords } = this.utterance;
      keywords = keywords.flatMap(value => value.word.split(' ')).map(value => value.toLowerCase());
      let newText = '';
      const text = this.utterance.text.split(' ');
      let word;
      let conf;
      let calculatedConf;
      for (let i = 0; i < text.length; i++) {
        word = text[i];
        conf = this.utterance.confidences[i];
        calculatedConf = Math.max(conf * conf, 0.1);
        if (this.inList(word.toLowerCase(), keywords)) {
          newText += this.keyword2HTML(word, calculatedConf);
        } else {
          newText += `${this.fillArray('-', word.length).join('')} `;
        }
      }
      return newText.trim();
    },
    visualizeConfidenceAndKeywordsMedium() {
      let { keywords } = this.utterance;
      keywords = keywords.flatMap(value => value.word.split(' ')).map(value => value.toLowerCase());
      const text = this.utterance.text.split(' ');
      const isImportantWord = Array(text.length).fill(0);
      let word;
      for (let i = 0; i < text.length; i++) {
        word = text[i];
        if (this.inList(word.toLowerCase(), keywords)) {
          isImportantWord[i] = 1;
          if (i > 0 && isImportantWord[i - 1] === 0) { isImportantWord[i - 1] = 2; }
          if (i > 1 && isImportantWord[i - 2] === 0) { isImportantWord[i - 2] = 2; }
          if (i < isImportantWord.length - 1 && isImportantWord[i + 1] === 0) { isImportantWord[i + 1] = 2; }
          if (i < isImportantWord.length - 2 && isImportantWord[i + 2] === 0) { isImportantWord[i + 2] = 2; }
        }
      }
      let newText = '';
      let conf;
      let calculatedConf;
      for (let i = 0; i < text.length; i++) {
        word = text[i];
        switch (isImportantWord[i]) {
          case 0: // not important
            newText += `${this.fillArray('-', word.length).join('')} `;
            break;
          case 1: // keyword
            conf = this.utterance.confidences[i];
            calculatedConf = Math.max(conf * conf, 0.1);
            newText += this.keyword2HTML(word, calculatedConf);
            break;
          case 2: // confword
            conf = this.utterance.confidences[i];
            calculatedConf = Math.max(conf * conf, 0.1);
            newText += this.confword2HTML(word, calculatedConf);
            break;
        }
      }
      return newText.trim();
    },
    visualizeConfidenceAndKeywordsFull() {
      let { keywords } = this.utterance;
      keywords = keywords.flatMap(value => value.word.split(' ')).map(value => value.toLowerCase());
      const text = this.utterance.text.split(' ');
      const isImportantWord = Array(text.length).fill(0);
      let word;
      for (let i = 0; i < text.length; i++) {
        word = text[i];
        if (this.inList(word.toLowerCase(), keywords)) {
          isImportantWord[i] = 1;
        }
      }
      let newText = '';
      let conf;
      let calculatedConf;
      for (let i = 0; i < text.length; i++) {
        word = text[i];
        switch (isImportantWord[i]) {
          case 0: // confword
            conf = this.utterance.confidences[i];
            calculatedConf = Math.max(conf * conf, 0.1);
            newText += this.confword2HTML(word, calculatedConf);
            break;
          case 1: // keyword
            conf = this.utterance.confidences[i];
            calculatedConf = Math.max(conf * conf, 0.1);
            newText += this.keyword2HTML(word, calculatedConf);
            break;
        }
      }
      return newText.trim();
    },
  },
};
</script>

<style scoped>

</style>
