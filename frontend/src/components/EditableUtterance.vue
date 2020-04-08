<template>
  <div class="col-sm-9 form-control-plaintext"
     ref="editable"
     contenteditable
     v-on="listeners"></div>
</template>

<script>
/**
 * This is a micro-component that allows the user to manipulate a string.
 * This component takes an original string and visualizes it as an editable text field.
 * Once the string is edited by the user, the ORIGINAL string changes to that new value.
 * Please note that this emulates that the string is "passed by reference"!
 */
export default {
  props: ['value'],
  computed: {
    listeners() {
      return { ...this.$listeners, input: this.onInput };
    },
    html() {
      let html = '';
      const tokens = this.value.text.split(' ');
      for (let i = 0; i < tokens.length; i += 1) {
        const token = tokens[i];
        const confidence = this.value.confidences[i];
        html += confidence > 0.25 && token !== '&lt;UNK&gt;' ? `${token} ` : `<span class="confword">${token}</span> `; // <UNK> always red
      }
      return html.trim();
    },
  },
  mounted() {
    this.$refs.editable.innerHTML = this.html;
  },
  watch: {
    value() {
      this.$refs.editable.innerHTML = this.html;
    },
  },
  methods: {
    onInput(e) {
      const result = this.value;
      result.text = e.target.innerText;
      this.$emit('input', result);
    },
  },
};
</script>
