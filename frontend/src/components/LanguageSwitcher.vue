<template>
  <fieldset class="form-group px-2">
    <label>{{ $t('settings_language') }}:</label><br>
    <template v-for="lang in languages">
      <div class="form-check form-check-inline" :key="'language-'+lang">
        <label :for="'language-selection-'+lang" class="form-check-label" @click="changeLanguage(lang)">
          <input class="form-check-input" type="radio" name="language-selection" :id="'language-selection-'+lang" :checked="currentLanguage === lang">
          {{ $t(lang) }}
        </label>
      </div>
    </template>
  </fieldset>
</template>

<script>
export default {
  name: 'LanguageSwitcher',
  data() {
    return {
      languages: ['en', 'de'],
    };
  },
  computed: {
    currentLanguage() {
      return this.$i18n.locale;
    },
  },
  methods: {
    changeLanguage(lang) {
      this.$i18n.locale = lang;
    },
  },
};
</script>

<style scoped>

</style>
