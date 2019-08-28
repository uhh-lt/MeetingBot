<template>
  <div class="row bg-primary">
    <div class="col">
      <h3>Keywords:</h3>
      <ul>
        <li v-for="keyword in keywords">
          <b>{{ keyword.word }}</b> - Score: {{ keyword.score}}
        </li>
      </ul>
    </div>
</div>
</template>

<script>
export default {
  name: 'KeywordVisualizer',
  data() {
    return {
      keywords: [{ word: 'No keywords found...', score: 0 }],
    };
  },
  mounted() {
    // listen on visualizeEntities events
    this.$root.$on('visualizeKeywords', (keywords) => {
      this.visualizeKeywords(keywords);
    });
  },
  methods: {
    visualizeKeywords(keywords) {
      console.log(keywords);
      this.keywords = keywords;
    },
  },
};
</script>

<style scoped>

</style>
