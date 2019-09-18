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
      let text = '';
      this.utterance.forEach(utterance => {
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
          text += html + "<br>";
        } else {
          text += this.renderUtterance(utterance) + " ";
        }
      });
      setTimeout(() => {
        $('[data-toggle="tooltip"]').tooltip();
      }, 100);
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
      const find = '-+(\\s*-*)*';
      const re = new RegExp(find, 'g');
      result = result.replace(re, ' --- ');
      return result;
    },
    confword2HTML(word, confidence) {
      let confidenceSpan;
      if (this.showConfidence === 'true') {
        confidenceSpan = `<span style="color:rgba(0,0,0,${confidence});">`;
      } else if (this.showConfidence === 'false') {
        confidenceSpan = `<span class="forceColor" style="color:rgba(0,0,0,${confidence});">`;
      }
      return `${confidenceSpan}${word}</span> `;
    },
    keyword2HTML(word, confidence, keywordness) {
      let confidenceSpan;
      let keywordSpan;
      if (this.showConfidence === 'true') {
        confidenceSpan = `<span style="color:rgba(0,0,0,${confidence});">`;
      } else if (this.showConfidence === 'false') {
        confidenceSpan = `<span class="forceColor" style="color:rgba(0,0,0,${confidence});">`;
      }
      if (this.showKeywords === 'true') {
        keywordSpan = `<span class='DISPLAYKEYWORD KEYWORD' style='background:${this.keywordColor}' dataToggle="tooltip" dataPlacement="top" title="C: ${confidence} | KW: ${keywordness.toFixed(2)}">`;
      } else if (this.showKeywords === 'false') {
        keywordSpan = "<span class='KEYWORD'>";
      }
      return `${keywordSpan}${confidenceSpan}${word} </span></span>`;
    },
    visualizeConfidenceAndKeywordsShort(utterance) {
      let keywordnessTokenMap = this.calculateKeywordnessTokenMap(utterance);

      let newText = '';
      const text = utterance.text.split(' ');
      let word;
      let conf;
      let calculatedConf;
      for (let i = 0; i < text.length; i++) {
        word = text[i];
        conf = utterance.confidences[i];
        calculatedConf = Math.max(conf * conf, 0.1);
        if (keywordnessTokenMap.has(i)) {
          newText += this.keyword2HTML(word, calculatedConf, keywordnessTokenMap.get(i));
        } else {
          newText += `${this.fillArray('-', word.length).join('')} `;
        }
      }
      newText = this.mergeFiller(newText);
      // fix errors of mergeFiller
      newText = newText.replace(new RegExp("dataToggle", 'g'), "data-toggle");
      newText = newText.replace(new RegExp("dataPlacement", 'g'), "data-placement");

      return newText.trim();
    },
    visualizeConfidenceAndKeywordsMedium(utterance) {
      let text = utterance.text.split(' ');
      let keywordnessTokenMap = this.calculateKeywordnessTokenMap(utterance);

      const isImportantWord = Array(text.length).fill(0);
      let word;
      for (let i = 0; i < text.length; i++) {
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
      let calculatedConf;
      for (let i = 0; i < text.length; i++) {
        word = text[i];
        switch (isImportantWord[i]) {
          case 0: // not important
            newText += `${this.fillArray('-', word.length).join('')} `;
            break;
          case 1: // keyword
            conf = utterance.confidences[i];
            calculatedConf = Math.max(conf * conf, 0.1);
            newText += this.keyword2HTML(word, calculatedConf, keywordnessTokenMap.get(i));
            break;
          case 2: // confword
            conf = utterance.confidences[i];
            calculatedConf = Math.max(conf * conf, 0.1);
            newText += this.confword2HTML(word, calculatedConf);
            break;
          default:
            break;
        }
      }
      newText = this.mergeFiller(newText);
      // fix errors of mergeFiller
      newText = newText.replace(new RegExp("dataToggle", 'g'), "data-toggle");
      newText = newText.replace(new RegExp("dataPlacement", 'g'), "data-placement");

      return newText.trim();
    },
    visualizeConfidenceAndKeywordsFull(utterance) {
      let confidences = utterance.confidences;
      let tokens = utterance.text.split(' ');
      let keywordnessTokenMap = this.calculateKeywordnessTokenMap(utterance);

      // Build the final text
      let newText = '';
      let conf;
      let calculatedConf;
      let token;
      for (let i = 0; i < tokens.length; i++) {
        token = tokens[i];
        conf = confidences[i];
        calculatedConf = Math.max(conf * conf, 0.1);
        // if token is in this map, it has to be a keyword!
        if(keywordnessTokenMap.has(i)) {
          newText += this.keyword2HTML(token, calculatedConf, keywordnessTokenMap.get(i));
        } else {
          newText += this.confword2HTML(token, calculatedConf);
        }
      }
      newText = newText.replace(new RegExp("dataToggle", 'g'), "data-toggle");
      newText = newText.replace(new RegExp("dataPlacement", 'g'), "data-placement");
      return newText.trim();
    },
    calculateKeywordnessTokenMap(utterance) {

      let keywords = utterance.keywords;
      let confidences = utterance.confidences;
      let text = utterance.text;
      let tokens = utterance.text.split(' ');

      console.log("TL_UTT Text");
      console.log(text);
      console.log("TL_UTT Tokens");
      console.log(tokens);
      console.log("TL_UTT Keywords");
      console.log(keywords);
      console.log("TL_UTT Confidences");
      console.log(confidences);

      // map that stores a keywordScore for each array of involved tokenIndices
      // [
      //   { involved: [1, 2, 3], score: 10 },
      //   { involved: [6, 7, 8], score: 10 },
      // ]
      let keywordScore = [];

      // TOKENS:       0   1   2
      // CHAR OFFSET: 0123456789
      // STRING:      Tim ist to
      let offset = 0;
      let characterOffset2TokenID = new Map();
      // build characterOffset2TokenMap
      for(let i = 0; i < tokens.length; i += 1) {
        let token = tokens[i];
        for (let j = 0; j < token.length; j += 1) {
          characterOffset2TokenID.set(offset, i);
          offset += 1;
        }
        offset += 1;
      }
      console.log("TL_UTT Character2TokenID");
      console.log(characterOffset2TokenID);

      // perform regex search for each keyword in the list
      keywords.forEach((keyword) => {
        let numWords = keyword.word.split(' ').length;
        let match;
        const re = new RegExp(`${keyword.word}`, 'gi');
        while ((match = re.exec(text)) != null) {

          // using match.index to find token index
          let tokenIndex = characterOffset2TokenID.get(match.index);

          // calculate average confidence for the keyword phrase
          // also calculated an array of involved tokenIds in the keyword phrase
          let avgConfidence = 0;
          let involvedTokenIDs = [];
          for(let i = 0; i < numWords; i += 1) {
            let realIndex = tokenIndex + i;
            let confidence = confidences[realIndex];
            avgConfidence += confidence;
            involvedTokenIDs.push(realIndex);
          }

          // save keywordness for keyword phrase (as token ids)
          keywordScore.push({
            involved: involvedTokenIDs,
            score: keyword.score * avgConfidence,
          });
        }
      });

      console.log("TL_UTT KeywordScores");
      console.log(keywordScore);

      // sort the keywordScores by value
      keywordScore =  keywordScore.sort((a, b) => b.score - a.score);

      // then just use the top 3 keywords
      let maximum = Math.min(3, keywordScore.length);
      keywordScore = keywordScore.slice(0, maximum);

      // remap top keyword phrases as f.e.
      // { involved: [0, 1, 2], score: 10 }
      // to
      // [ { token: 0, score: 10 },
      //   { token: 1, score: 10 },
      //   { token: 2, score: 10 } ]
      let keywordnessTokenMap = new Map();
      keywordScore.forEach(obj => {
        obj.involved.forEach(tokenId => {
          keywordnessTokenMap.set(tokenId, obj.score);
        });
      });

      console.log("TL_UTT ProcessedKeywordScores");
      console.log(keywordnessTokenMap);

      return keywordnessTokenMap;
    }
  },
};
</script>

<style scoped>
</style>
