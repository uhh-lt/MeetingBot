<template>
  <!-- START SETTINGS -->
  <div class="modal fade" id="settingsModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header text-white bg-dark">
          <h4 class="modal-title" id="exampleModalLabel">{{ $t('settings') }}</h4>
          <button v-on:click="revertSettings" type="button" class="btn btn-danger my-2 my-sm-0" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <ul class="nav nav-tabs" id="myTab" role="tablist" style="margin-bottom: 10px;">
            <li class="nav-item">
              <a class="nav-link active" id="general-tab" data-toggle="tab" href="#general" role="tab" aria-controls="general" aria-selected="true">{{ $t('general') }}</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" id="speaker-tab" data-toggle="tab" href="#speaker" role="tab" aria-controls="speaker" aria-selected="false">{{ $t('speaker') }}</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" id="agenda-tab" data-toggle="tab" href="#agenda" role="tab" aria-controls="agenda" aria-selected="false">{{ $t('agenda') }}</a>
            </li>
          </ul>
          <div class="tab-content" id="myTabContent">

            <!-- BEGIN GENERAL SETTINGS -->
            <div class="tab-pane fade show active" id="general" role="tabpanel" aria-labelledby="general-tab">
              <language-switcher></language-switcher>
              <hr>
              <fieldset class="form-group px-2">
                <label>{{ $t('settings_microphone_mode') }}:</label><br>
                <div class="form-check form-check-inline mb-2">
                  <label for="settings-microphone-mode-true" class="form-check-label">
                    <input v-model="microphonemode" class="form-check-input" type="radio" name="microphone-mode" id="settings-microphone-mode-true" value="FRONTEND">
                    Frontend
                  </label>
                </div>
                <div class="form-check form-check-inline mb-2">
                  <label for="settings-microphone-mode-false" class="form-check-label">
                    <input v-model="microphonemode" class="form-check-input" type="radio" name="microphone-mode" id="settings-microphone-mode-false" value="SERVER">
                    Server
                  </label>
                </div>
              </fieldset>
              <hr>
              <fieldset class="form-group px-2">
                <label>{{ $t('settings_summary_method') }}:</label><br>
                <div class="form-check form-check-inline mb-2">
                  <label for="settings-summary-method-textrank" class="form-check-label">
                    <input v-model="summarymethod" class="form-check-input" type="radio" name="summary-method" id="settings-summary-method-textrank" value="TEXTRANK">
                    Textrank
                  </label>
                </div>
                <div class="form-check form-check-inline mb-2">
                  <label for="settings-summary-method-bert" class="form-check-label">
                    <input v-model="summarymethod" class="form-check-input" type="radio" name="summary-method" id="settings-summary-method-bert" value="BERT">
                    BERT
                  </label>
                </div>
              </fieldset>
              <hr>
              <fieldset class="form-group px-2">
                <label>{{ $t('settings_timeline_sorting') }}:</label><br>
                <div class="form-check form-check-inline mb-2">
                  <label for="timeline-sorting-asc" class="form-check-label">
                    <input v-model="timelineSorting" class="form-check-input" type="radio" name="timeline-sorting" id="timeline-sorting-asc" value="ASC">
                    {{ $t('settings_ASCending') }}
                  </label>
                </div>
                <div class="form-check form-check-inline mb-2">
                  <label for="timeline-sorting-desc" class="form-check-label">
                    <input v-model="timelineSorting" class="form-check-input" type="radio" name="timeline-sorting" id="timeline-sorting-desc" value="DESC">
                    {{ $t('settings_DESCending') }}
                  </label>
                </div>
              </fieldset>
              <hr>
              <fieldset class="form-group px-2">
                <label>{{ $t('settings_confidences_as_greyscale') }}:</label><br>
                <div class="form-check form-check-inline">
                  <label for="visualize-confidence-yes" class="form-check-label">
                    <input v-model="shouldVisualizeConfidence" class="form-check-input" type="radio" name="visualize-confidence" id="visualize-confidence-yes" value="true">
                    {{ $t('yes') }}
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <label for="visualize-confidence-no" class="form-check-label">
                    <input v-model="shouldVisualizeConfidence" class="form-check-input" type="radio" name="visualize-confidence" id="visualize-confidence-no" value="false">
                    {{ $t('no') }}
                  </label>
                </div>
              </fieldset>
              <hr>
              <fieldset class="form-group px-2">
                <label>{{ $t('settings_timeline_view') }}:</label><br>
                <div class="form-check ">
                  <label for="timeline-view-line" class="form-check-label">
                    <input v-model="timelineView" class="form-check-input" type="radio" name="timeline-view" id="timeline-view-line" value="LINE">
                    {{ $t('settings_timeline_view_single_line') }}
                  </label>
                </div>
                <div class="form-check">
                  <label for="timeline-view-lanes" class="form-check-label">
                    <input v-model="timelineView" class="form-check-input" type="radio" name="timeline-view" id="timeline-view-lanes" value="LANES">
                    {{ $t('settings_timeline_view_multiple_lines') }}
                  </label>
                </div>
              </fieldset>
              <hr>
              <fieldset class="form-group px-2">
                <label>{{ $t('settings_highlight_keywords_with_color') }}:</label><br>
                <div class="form-check form-check-inline mb-2">
                  <label for="visualize-keywords-yes" class="form-check-label">
                    <input v-model="shouldVisualizeKeywords" class="form-check-input" type="radio" name="visualize-keywords" id="visualize-keywords-yes" value="true">
                    {{ $t('yes') }}
                  </label>
                </div>
                <div class="form-check form-check-inline mb-2">
                  <label for="visualize-keywords-no" class="form-check-label">
                    <input v-model="shouldVisualizeKeywords" class="form-check-input" type="radio" name="visualize-keywords" id="visualize-keywords-no" value="false">
                    {{ $t('no') }}
                  </label>
                </div>
                <div id="cp3a" class="input-group">
                  <input v-model="keywordColor" type="text" class="form-control input-lg"/>
                  <span class="input-group-append">
                      <span class="input-group-text colorpicker-input-addon"><i></i></span>
                    </span>
                </div>
              </fieldset>
              <hr>
              <fieldset class="form-group px-2">
                <label for="example-number-input">{{ $t('settings_word_cloud_max_words') }}:</label><br>
                  <input v-model="wordCloudWords" class="form-control" type="number" id="example-number-input">
              </fieldset>
              <div class="form-group px-2">
                <label for="wordcloudrange">{{ $t('settings_word_cloud_range') }}: {{rangeNum}}</label>
                <input v-model="rangeNum" type="range" class="custom-range" min="0" max="20" id="wordcloudrange">
              </div>
              <fieldset class="form-group px-2">
                <label>{{ $t('settings_word_cloud_visualize_edges') }}:</label><br>
                <div class="form-check form-check-inline">
                  <label for="visualize-links-yes" class="form-check-label">
                    <input v-model="visualizeLinks" class="form-check-input" type="radio" name="visualize-links" id="visualize-links-yes" value="true">
                    {{ $t('yes') }}
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <label for="visualize-links-no" class="form-check-label">
                    <input v-model="visualizeLinks" class="form-check-input" type="radio" name="visualize-links" id="visualize-links-no" value="false">
                    {{ $t('no') }}
                  </label>
                </div>
              </fieldset>
              <hr>
              <fieldset class="form-group px-2">
                <label>{{ $t('settings_random_speaker') }}:</label><br>
                <div class="form-check form-check-inline">
                  <label for="random-speaker-yes" class="form-check-label">
                    <input v-model="randomSpeaker" class="form-check-input" type="radio" name="random-speaker" id="random-speaker-yes" value="true">
                    {{ $t('yes') }}
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <label for="random-speaker-no" class="form-check-label">
                    <input v-model="randomSpeaker" class="form-check-input" type="radio" name="random-speaker" id="random-speaker-no" value="false">
                    {{ $t('no') }}
                  </label>
                </div>
              </fieldset>
              <hr>
              <fieldset class="form-group px-2">
                <label>{{ $t('settings_control_buttons_state_dependent') }}?</label><br>
                <div class="form-check form-check-inline">
                  <label for="control-buttons-yes" class="form-check-label">
                    <input v-model="controlButtonsStateDependent" class="form-check-input" type="radio" name="control-button" id="control-buttons-yes" value="true">
                    {{ $t('yes') }}
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <label for="control-buttons-no" class="form-check-label">
                    <input v-model="controlButtonsStateDependent" class="form-check-input" type="radio" name="control-button" id="control-buttons-no" value="false">
                    {{ $t('no') }}
                  </label>
                </div>
              </fieldset>
            </div>
            <!-- END GENERAL SETTINGS -->

            <!-- BEGIN SPEAKER SETTINGS -->
            <div class="tab-pane fade" id="speaker" role="tabpanel" aria-labelledby="speaker-tab">
              <div class="form-group px-2">
                <label v-if="meeting.status === meeting.enum.BEFORE_MEETING" for="customRange1">{{ $t('settings_num_speaker') }}: {{speakers}}</label>
                <label v-if="meeting.status !== meeting.enum.BEFORE_MEETING" for="customRange1">{{ $t('settings_num_speaker') }}: {{speakers}} <span class="text-danger">{{ $t('settings_info_change_before_meeting') }}</span></label>
                <input :disabled="meeting.status !== meeting.enum.BEFORE_MEETING" v-model="speakerCount" type="range" class="custom-range" min="1" max="4" id="customRange1">
              </div>
              <div v-for="(speaker, id) in speakers" :key="'speaker-settings-'+speaker">
                <hr>
                <div class="row" style="padding: 0 1rem;">
                  <div class="col-sm-4 form-group px-2">
                    <label :for="'speaker-' + speaker + '-name-input'">{{ $t('speaker') }} {{speaker}} {{ $t('name') }}:</label>
                    <input v-model="speakerName[id]" class="form-control" type="text" :id="'speaker-' + speaker + '-name-input'">
                  </div>
                  <div class="col-sm-8 form-group px-2">
                    <label :for="'speaker-' + speaker + '-email-input'">{{ $t('speaker') }} {{speaker}} {{ $t('email') }}:</label>
                    <input v-model="speakerMail[id]" class="form-control" type="text" :id="'speaker-' + speaker + '-email-input'">
                  </div>
                </div>
                <fieldset class="form-group px-2">
                  <label>{{ $t('speaker') }} {{speaker}} {{ $t('avatar') }}:</label><br>
                  <div v-for="avatar in avatars" :key="'avatar-speaker-'+speaker+'-'+avatar" class="form-check form-check-inline mb-2">
                    <label :for="'avatar-radios-' + avatar + '-speaker-' + speaker" class="form-check-label">
                      <input v-model="selectedAvatar[id]" class="form-check-input imgradio" type="radio" :name="'avatar-radios-speaker-' + speaker" :id="'avatar-radios-' + avatar + '-speaker-' + speaker" :value="avatar">
                      <img :src="'./avatars/'+avatar" width="100" height="100">
                    </label>
                  </div>
                </fieldset>
              </div>
            </div>
            <!-- END SPEAKER SETTINGS -->

            <!-- BEGIN AGENDA SETTINGS -->
            <div class="tab-pane fade" id="agenda" role="tabpanel" aria-labelledby="agenda-tab">
              <div class="form-group px-2">
                <label v-if="meeting.status === meeting.enum.BEFORE_MEETING" for="customRange1">{{ $t('settings_num_agendapoints') }}: {{agendas}}</label>
                <label v-if="meeting.status !== meeting.enum.BEFORE_MEETING" for="customRange1">{{ $t('settings_num_agendapoints') }}: {{agendas}} <span class="text-danger">{{ $t('settings_info_change_before_meeting') }}</span></label>
                <input :disabled="meeting.status !== meeting.enum.BEFORE_MEETING" v-model="agendaPoints" type="range" class="custom-range" min="1" max="10" id="customRange2">
              </div>
              <fieldset class="form-group px-2">
                <label for="agenda-warn-time-input">{{ $t('settings_warn_time') }} ({{ $t('settings_warn_time_info') }}):</label><br>
                <input v-model="agendaWarnTime" class="form-control" type="number" id="agenda-warn-time-input">
              </fieldset>
              <div v-for="(index, id) in agendas" :key="'agenda-settings-'+index">
                <div class="form-group px-2">
                  <hr>
                  <label :for="'agenda-' + index + '-titel-input'">{{index}}. {{ $t('settings_agendapoint_title') }}:</label>
                  <input v-model="agendaTitel[id]" class="form-control" type="text" :id="'agenda-' + index + '-titel-input'">
                </div>
                <fieldset class="form-group px-2">
                  <label v-if="meeting.status === meeting.enum.BEFORE_MEETING" :for="'agenda-' + index + '-time-input'">{{ $t('settings_planned_time_in_minutes') }}:</label>
                  <label v-if="meeting.status !== meeting.enum.BEFORE_MEETING" :for="'agenda-' + index + '-time-input'">{{ $t('settings_planned_time_in_minutes') }} <span class="text-danger">{{ $t('settings_info_change_before_meeting') }}</span>:</label><br>
                  <input :disabled="meeting.status !== meeting.enum.BEFORE_MEETING" v-model="agendaTime[id]" class="form-control" type="number" :id="'agenda-' + index + '-time-input'">
                </fieldset>
              </div>
            </div>
            <!-- END AGENDA SETTINGS -->

          </div>
        </div>
        <div class="modal-footer bg-light">
          <button v-on:click="revertSettings" type="button" class="btn btn-danger" data-dismiss="modal">{{ $t('close') }}</button>
          <button v-on:click="saveSettings" type="button" class="btn btn-primary" data-dismiss="modal">{{ $t('settings_save_changes') }}</button>
        </div>
      </div>
    </div>
  </div>
  <!--    END SETTINGS -->
</template>

<script>
import $ from 'jquery';
import 'bootstrap-colorpicker';
import 'bootstrap-colorpicker/dist/css/bootstrap-colorpicker.min.css';
import Store from '../helper/Store';
import LanguageSwitcher from './LanguageSwitcher.vue';

/**
 * This component offers a UI to set many different options. These options include general settings, speaker settings and agenda settings.
 * Once the settings are saved, this component emits the 'onSettingsSaved' event that allows all other components to adjust to the new settings.
 */
export default {
  name: 'Settings',
  components: { LanguageSwitcher },
  data() {
    return {
      speakerCount: '4',
      speakerName: [`${this.$t('speaker')} 1`, `${this.$t('speaker')} 2`, `${this.$t('speaker')} 3`, `${this.$t('speaker')} 4`],
      speakerMail: ['a@b.c', 'a@b.c', 'a@b.c', 'a@b.c'],
      avatars: ['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png', 'avatar5.png', 'avatar6.png'],
      selectedAvatar: ['avatar1.png', 'avatar1.png', 'avatar1.png', 'avatar1.png'],
      timelineSorting: 'DESC',
      timelineView: 'LINE',
      shouldVisualizeConfidence: 'false',
      shouldVisualizeKeywords: 'true',
      keywordColor: 'rgb(255, 255, 0)',
      wordCloudWords: '10',
      oldSettings: {},
      agendaPoints: '4',
      agendaTitel: [`${this.$t('point')} 1`, `${this.$t('point')} 2`, `${this.$t('point')} 3`, `${this.$t('point')} 4`, '', '', '', '', '', ''],
      agendaTime: ['10', '10', '10', '10', '10', '10', '10', '10', '10', '10'],
      agendaWarnTime: '5',
      meeting: Store.meeting,
      rangeNum: '10',
      randomSpeaker: 'false',
      controlButtonsStateDependent: 'true',
      visualizeLinks: 'false',
      summarymethod: 'TEXTRANK',
      microphonemode: 'FRONTEND',
    };
  },
  mounted() {
    // Init colorpicker
    $(() => {
      $('#cp3a').colorpicker();
    });
    $('#cp3a').on('colorpickerChange', (event) => {
      this.keywordColor = event.color.toString();
    });

    // init settings
    // emit the save settings event at the start of the application, so that every component adjusts to the standard settings
    setTimeout(this.saveSettings, 100);

    // listen to events from other components
    this.$root.$on('onImport', this.onImport);
  },
  computed: {
    speakers() {
      return parseInt(this.speakerCount, 10);
    },
    agendas() {
      return parseInt(this.agendaPoints, 10);
    },
    range() {
      return parseInt(this.rangeNum, 10);
    },
  },
  methods: {
    /**
     * This method applies all the setting set by the user.
     * This method emits the 'onSettingsSaved' event. Almost every other component listens to this event and then adapts to the settings.
     */
    saveSettings() {
      const settings = {
        speaker: this.speakers,
        speakerName: this.speakerName,
        speakerMail: this.speakerMail,
        selectedAvatar: this.selectedAvatar,
        timelineSorting: this.timelineSorting,
        timelineView: this.timelineView,
        showConfidence: this.shouldVisualizeConfidence,
        showKeywords: this.shouldVisualizeKeywords,
        keywordColor: this.keywordColor,
        wordCloudWords: this.wordCloudWords,
        agendaPoints: this.agendas,
        agendaTitel: this.agendaTitel,
        agendaTime: this.agendaTime,
        agendaWarnTime: this.agendaWarnTime,
        range: this.range,
        randomSpeaker: this.randomSpeaker,
        controlButtonsStateDependent: this.controlButtonsStateDependent,
        visualizeLinks: this.visualizeLinks,
        summarymethod: this.summarymethod,
        microphonemode: this.microphonemode,
      };
      this.oldSettings = this.jsonCopy(settings);
      this.$root.$emit('onSettingsSaved', this.jsonCopy(settings));
    },
    /**
     * This function reverts all changes. It resets all settings to the old settings.
     */
    revertSettings() {
      this.speakerCount = `${this.oldSettings.speaker}`;
      this.speakerName = this.oldSettings.speakerName;
      this.speakerMail = this.oldSettings.speakerMail;
      this.selectedAvatar = this.oldSettings.selectedAvatar;
      this.timelineSorting = this.oldSettings.timelineSorting;
      this.timelineView = this.oldSettings.timelineView;
      this.showConfidence = this.oldSettings.showConfidence;
      this.showKeywords = this.oldSettings.showKeywords;
      this.keywordColor = this.oldSettings.keywordColor;
      this.wordCloudWords = this.oldSettings.wordCloudWords;
      this.agendaPoints = this.oldSettings.agendaPoints;
      this.agendaTitel = this.oldSettings.agendaTitel;
      this.agendaTime = this.oldSettings.agendaTime;
      this.agendaWarnTime = this.oldSettings.agendaWarnTime;
      this.rangeNum = this.oldSettings.range;
      this.randomSpeaker = this.oldSettings.randomSpeaker;
      this.controlButtonsStateDependent = this.oldSettings.controlButtonsStateDependent;
      this.visualizeLinks = this.oldSettings.visualizeLinks;
      this.summarymethod = this.oldSettings.summarymethod;
      this.microphonemode = this.oldSettings.microphonemode;
    },
    /**
     * This event fires when the users imports a .ics file with the importer.
     * All imported information (agenda, speaker settings) are stored & saved here in the settings component.
     */
    onImport(e) {
      const event = this.jsonCopy(e);
      this.agendaPoints = event.agenda.agendaPoints;

      for (let i = 0; i < Math.min(event.agenda.agendaTitle.length, 10); i += 1) {
        this.agendaTitel[i] = event.agenda.agendaTitle[i];
      }
      for (let i = 0; i < Math.min(event.agenda.agendaTime.length, 10); i += 1) {
        this.agendaTime[i] = event.agenda.agendaTime[i];
      }
      for (let i = 0; i < Math.min(event.selectedAttendents, 4); i += 1) {
        this.speakerName[i] = event.attendants[i].name;
        this.speakerMail[i] = event.attendants[i].email;
      }
      this.speakerCount = Math.min(event.selectedAttendents, 4);
      this.saveSettings();
    },
    /**
     * This is a utility function that creates a deep copy of any object
     * @param src object to clone
     * @returns {any} cloned object
     */
    jsonCopy(src) {
      return JSON.parse(JSON.stringify(src));
    },
  },
};
</script>

<style scoped>

</style>
