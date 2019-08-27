<template>
  <div class="row bg-secondary">
    <div class="col">
      <h3>Summary:</h3>
      <p>{{summary}}</p>
    </div>
</div>
</template>

<script>
export default {
  name: 'SummarizationVisualizer',
  data: function () {
    return {
      summary: "No Summary..."
    }
  },
  mounted() {
    // listen on visualizeSummary events
    this.$root.$on('visualizeSummary', (text, entities, options) => {
      this.visualizeSummary(text, entities, options);
    });
  },
  methods: {
    visualizeSummary: function(summary) {
      console.log(this.test);

      console.log(summary);

      this.summary = summary;
    }
  },
};
</script>

<style scoped>

</style>
