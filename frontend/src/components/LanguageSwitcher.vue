<template>
  <fieldset class="form-group px-2">
    <label v-if="meeting.status === meeting.enum.BEFORE_MEETING">{{ $t('settings_language') }}:</label>
    <label v-if="meeting.status !== meeting.enum.BEFORE_MEETING">{{ $t('settings_language') }}: <span class="text-danger">{{ $t('settings_info_change_before_meeting') }}</span></label>
    <br>
    <template v-for="lang in languages">
      <div class="form-check form-check-inline" :key="'language-'+lang">
        <label :for="'language-selection-'+lang" class="form-check-label" @click="changeLanguage(lang)">
          <input :disabled="meeting.status !== meeting.enum.BEFORE_MEETING" class="form-check-input" type="radio" name="language-selection" :id="'language-selection-'+lang" :checked="currentLanguage === lang">
          {{ $t(lang) }}
        </label>
      </div>
    </template>
  </fieldset>
</template>

<script>
import Store from '../helper/Store';

export default {
  name: 'LanguageSwitcher',
  data() {
    return {
      languages: ['en', 'de'],
      meeting: Store.meeting,
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
