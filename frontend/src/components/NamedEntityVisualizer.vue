<template>
  <div class="row bg-secondary">
    <div class="col">
      <h3 v-on:click="visualizeNamedEntities('test', 'test')">Entities:</h3>
      <p v-html="test"></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NamedEntityVisualizer',
  data: function () {
    return {
      test: "No entities detected..."
    }
  },
  mounted() {
    // listen on visualizeEntities events
    this.$root.$on('visualizeEntities', (text, entities, options) => {
      this.visualizeNamedEntities(text, entities, options);
    });
  },
  methods: {
    visualizeNamedEntities: function(text, entities, options) {
      console.log(this.test);

      console.log(entities);

      if(entities.length === 0)
        return;

      // Order Replacements
      let replacements = [];
      entities.forEach(function (element) {
        if(!options[element.label])
          return;

        let spanStart = "<span class='" + element.label + "'>";
        let spanEnd = " <b>"+element.label+"</b></span>";

        replacements.push([element.start, spanStart]);
        replacements.push([element.end, spanEnd]);
      });
      replacements = replacements.sort((a, b) => a[0] - b[0]);

      // Insert the spans
      let newText = text;
      let offset = 0;
      replacements.forEach(function (element) {
        newText = text.slice(0, element[0] + offset) + element[1] + text.slice(element[0] + offset, text.length);
        text = newText;
        offset = offset + element[1].length;
      });

      // Apply the new text
      this.test = newText;
    }
  },
};
</script>

<style scoped>
</style>
