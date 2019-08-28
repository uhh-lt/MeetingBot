<template>
  <div class="row bg-primary">
    <div class="col">
      <h2>Text Input:</h2>
      <textarea id="textarea-input" rows="4" cols="50" placeholder="Input german text here..."></textarea>
      <h2>Model</h2>
      <select>
        <option value="model-1">Model 1</option>
        <option value="model-2">Model 2</option>
        <option value="model-3">Model 3</option>
        <option value="model-4">Model 4</option>
      </select>
      <p><button v-on:click="callAPI()">Go :)</button></p>
    </div>
    <div class="col">
      <h4>Labels</h4>
      <input id="checkbox-per" type="checkbox" name="PER" value="PER"><span class="PER">PER</span><br>
      <input id="checkbox-loc" type="checkbox" name="LOC" value="LOC"><span class="LOC">LOC</span><br>
      <input id="checkbox-org" type="checkbox" name="ORG" value="ORG"><span class="ORG">ORG</span><br>
      <input id="checkbox-misc" type="checkbox" name="MISC" value="MISC"><span class="MISC">MISC</span><br>
    </div>
  </div>
</template>

<script>
const BROKER_URL = 'http://0.0.0.0:8888/mailsum';


export default {
  name: 'SummarizationInput',
  methods: {
    callAPI() {
      // Call NER API
      const text = document.getElementById('textarea-input').value;
      const options = {
        PER: document.getElementById('checkbox-per').checked,
        LOC: document.getElementById('checkbox-loc').checked,
        ORG: document.getElementById('checkbox-org').checked,
        MISC: document.getElementById('checkbox-misc').checked,
      };
      postData(`${BROKER_URL}/ner`, { text })
        .then(data => this.$root.$emit('visualizeEntities', text, data.entities, options)) // JSON-string from `response.json()` call
        .catch(error => console.error(error));

      // Call Keyword API
      postData(`${BROKER_URL}/keywords`, { count: 5, lang: 'deu', text })
        .then(data => this.$root.$emit('visualizeKeywords', data.keywords)) // JSON-string from `response.json()` call
        .catch(error => console.error(error));

      // Call Summary API
      postData(`${BROKER_URL}/summarize`, { method: 'textrank', text })
        .then(data => this.$root.$emit('visualizeSummary', data.summary)) // JSON-string from `response.json()` call
        .catch(error => console.error(error));
    },
  },
};

function postData(url = '', data = {}) {
  // Default options are marked with *
  return fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  })
    .then(response => response.json()); // parses JSON response into native JavaScript objects
}
</script>

<style scoped>
  textarea, select, button {
    width:100%
  }
</style>
