<template>
  <Cloud :key="cloudKey" :data="allKeywords" :fontSizeMapper="fontSizeMapper" :width="width" :height="height"></Cloud>
</template>

<script>
import Cloud from 'vue-d3-cloud';

export default {
  name: 'WordCloud',
  props: ['height', 'width'],
  components: {
    Cloud,
  },
  data() {
    return {
      keywordMap: new Map(),
      allKeywords: [
        { text: 'nothing', value: 100 },
        { text: 'to', value: 100 },
        { text: 'show', value: 100 },
      ],
      fontSizeMapper: word => Math.log2(word.value) * 5,
      cloudKey: 0,
      maxKeywords: 10,
    };
  },
  watch: {
    height() {
      this.cloudKey += 1;
    },
    width() {
      this.cloudKey += 1;
    },
  },
  mounted() {
    // listen to events
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);
    this.$root.$on('onNewKeywords', this.handleNewKeywords);
  },
  methods: {
    onSettingsSaved(settings) {
      this.maxKeywords = parseInt(settings.wordCloudWords, 10);
    },
    handleNewKeywords(keywords) {
      console.log('Recieved new keywords!');
      const lowKeywords = keywords.flatMap(value => value.word.split(' ')).map(value => value.toLowerCase());
      lowKeywords.forEach((word) => {
        if (this.keywordMap.has(word)) {
          this.keywordMap.set(word, this.keywordMap.get(word) + 1);
        } else {
          this.keywordMap.set(word, 1);
        }
      });
      this.keywordMap = new Map([...this.keywordMap.entries()].sort((a, b) => b[1] - a[1]));
      this.computeAllKeywords();
    },
    computeAllKeywords() {
      // shorten keyword map
      const maximum = Math.min(this.keywordMap.size, this.maxKeywords);
      const shortMap = new Map([...this.keywordMap.entries()].slice(0, maximum));
      // convert to array
      let result = [];
      shortMap.forEach(((value, key) => {
        result.push({
          text: key,
          value: value * 100,
        });
      }));
      // if result is empty show placeholder keywords :D
      if (result.length === 0) {
        result = [
          { text: 'nothing', value: 100 },
          { text: 'to', value: 100 },
          { text: 'show', value: 100 },
        ];
      }
      // save
      this.allKeywords = result;
      this.cloudKey += 1;
    },
  },
};
</script>

<style scoped>
  svg {
    width: 100%;
  }
</style>
