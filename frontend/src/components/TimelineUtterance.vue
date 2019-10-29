<template>
  <div v-html="html"></div>
</template>

<script>
export default {
  name: 'TimelineUtterance',
  props: ['utterance', 'mode', 'showConfidence', 'showKeywords', 'keywordColor'],
  computed: {
    html() {
      let text = '';
      this.utterance.forEach((utterance) => {
        if (utterance.completed) {
          let html;
          switch (this.mode) {
            case 'FULL':
              html = this.visualizeConfidenceAndKeywordsFull(utterance);
              break;
            case 'MEDIUM':
              html = this.visualizeConfidenceAndKeywordsMedium(utterance);
              break;
            case 'SHORT':
              html = this.visualizeConfidenceAndKeywordsShort(utterance);
              break;
            default:
              html = '';
              break;
          }
          if (html !== '...') {
            text += `${html}<br>`;
          }
        } else {
          text += `${this.renderUtterance(utterance)} `;
        }
      });
      this.$parent.updateLetterCount(text.trim());
      return text.trim();
    },
  },
  methods: {
    renderUtterance(utterance) {
      return utterance.text;
    },
    fillArray(value, len) {
      return Array(len).fill(value);
    },
    mergeFiller(string) {
      let result = string;
      const find = '\\.+(\\s*\\.*)*';
      const re = new RegExp(find, 'g');
      result = result.replace(re, ' ... ');
      return result;
    },
    confword2HTML(word, confidence) {
      let confidenceSpan;
      if (this.showConfidence === 'true') {
        confidenceSpan = `<span style="color:rgba(0,0,0,${Math.max(confidence * confidence, 0.1)});" title="C: ${confidence.toFixed(4)}">`;
      } else if (this.showConfidence === 'false') {
        confidenceSpan = `<span class="forceColor" title="C: ${confidence.toFixed(4)}">`;
      }
      return `${confidenceSpan}${word}</span> `;
    },
    keyword2HTML(word, confidence, keywordness) {
      let confidenceSpan;
      let keywordSpan;
      if (this.showConfidence === 'true') {
        confidenceSpan = `<span style="color:rgba(0,0,0,${Math.max(confidence * confidence, 0.1)});">`;
      } else if (this.showConfidence === 'false') {
        confidenceSpan = '<span class="forceColor">';
      }
      if (this.showKeywords === 'true') {
        keywordSpan = `<span class='DISPLAYKEYWORD KEYWORD' style='background:${this.keywordColor}' title='C: ${confidence.toFixed(4)} | KW: ${keywordness.toFixed(2)}'>`;
      } else if (this.showKeywords === 'false') {
        keywordSpan = `<span class='KEYWORD' title='C: ${confidence.toFixed(4)} | KW: ${keywordness.toFixed(2)}'>`;
      }
      return `${keywordSpan}${confidenceSpan}${word} </span></span>`;
    },
    visualizeConfidenceAndKeywordsShort(utterance) {
      const { keywordnessTokenMap } = utterance;

      let newText = '';
      const text = utterance.text.split(' ');
      let word;
      let conf;
      for (let i = 0; i < text.length; i += 1) {
        word = text[i];
        conf = utterance.confidences[i];
        if (keywordnessTokenMap.has(i)) {
          newText += this.keyword2HTML(word, conf, keywordnessTokenMap.get(i));
        } else {
          newText += `${this.fillArray('.', word.length).join('')} `;
        }
      }
      newText = this.mergeFiller(newText);
      return newText.trim();
    },
    visualizeConfidenceAndKeywordsMedium(utterance) {
      const text = utterance.text.split(' ');
      const { keywordnessTokenMap } = utterance;

      const isImportantWord = Array(text.length).fill(0);
      let word;
      for (let i = 0; i < text.length; i += 1) {
        word = text[i];
        if (keywordnessTokenMap.has(i)) {
          isImportantWord[i] = 1;
          if (i > 0 && isImportantWord[i - 1] === 0) { isImportantWord[i - 1] = 2; }
          if (i > 1 && isImportantWord[i - 2] === 0) { isImportantWord[i - 2] = 2; }
          if (i < isImportantWord.length - 1 && isImportantWord[i + 1] === 0) { isImportantWord[i + 1] = 2; }
          if (i < isImportantWord.length - 2 && isImportantWord[i + 2] === 0) { isImportantWord[i + 2] = 2; }
        }
      }
      let newText = '';
      let conf;
      for (let i = 0; i < text.length; i += 1) {
        word = text[i];
        switch (isImportantWord[i]) {
          case 0: // not important
            newText += `${this.fillArray('.', word.length).join('')} `;
            break;
          case 1: // keyword
            conf = utterance.confidences[i];
            newText += this.keyword2HTML(word, conf, keywordnessTokenMap.get(i));
            break;
          case 2: // confword
            conf = utterance.confidences[i];
            newText += this.confword2HTML(word, conf);
            break;
          default:
            break;
        }
      }
      newText = this.mergeFiller(newText);
      return newText.trim();
    },
    visualizeConfidenceAndKeywordsFull(utterance) {
      const { confidences } = utterance;
      const tokens = utterance.text.split(' ');
      let { keywordInfo } = utterance;

      if (keywordInfo.length > 0) {
        keywordInfo = keywordInfo.sort((a, b) => a.involved[0] - b.involved[0]);
      }

      // Build the final text
      let newText = '';
      let nextKeywordToken = -1;
      let currentKeywordInfo = 0;
      if (keywordInfo.length > currentKeywordInfo) {
        // eslint-disable-next-line prefer-destructuring
        nextKeywordToken = keywordInfo[currentKeywordInfo].involved[0];
      }
      for (let i = 0; i < tokens.length; i += 1) {
        // keyword phrase
        if (i === nextKeywordToken) {
          // visualize keyword
          if (this.showKeywords === 'true') {
            newText += `<span class='DISPLAYKEYWORD KEYWORD' style='background:${this.keywordColor}'>`;
          } else if (this.showKeywords === 'false') {
            newText += '<span class="KEYWORD">';
          }
          for (let j = 0; j < keywordInfo[currentKeywordInfo].involved.length; j += 1) {
            if (this.showConfidence === 'true') {
              newText += `<span style="color:rgba(0,0,0,${Math.max(confidences[i + j] * confidences[i + j], 0.1)});" title='C: ${confidences[i + j].toFixed(4)} | KW: ${keywordInfo[currentKeywordInfo].kwScore.toFixed(2)} | S ${keywordInfo[currentKeywordInfo].score.toFixed(2)}'>`;
            } else if (this.showConfidence === 'false') {
              newText += `<span class="forceColor" title='C: ${confidences[i + j].toFixed(4)} | KW: ${keywordInfo[currentKeywordInfo].kwScore.toFixed(2)} | S ${keywordInfo[currentKeywordInfo].score.toFixed(2)}'>`;
            }
            newText += tokens[i + j];
            newText += '</span> ';
          }
          newText += '</span>';

          // update i
          i += keywordInfo[currentKeywordInfo].involved.length - 1;

          // update currentKeyword info & next KeywordToken
          currentKeywordInfo += 1;
          if (keywordInfo.length > currentKeywordInfo) {
            // eslint-disable-next-line prefer-destructuring
            nextKeywordToken = keywordInfo[currentKeywordInfo].involved[0];
          }
        // something else
        } else {
          newText += this.confword2HTML(tokens[i], confidences[i]);
        }
      }
      return newText.trim();
    },
  },
};
</script>

<style scoped>
</style>
