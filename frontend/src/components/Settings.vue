<template>
  <!--    START SETTINGS-->
  <div class="modal fade" id="settingsModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header text-white bg-dark">
          <h4 class="modal-title" id="exampleModalLabel">Settings</h4>
          <button v-on:click="revertSettings" type="button" class="btn btn-danger my-2 my-sm-0" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <ul class="nav nav-tabs" id="myTab" role="tablist" style="margin-bottom: 10px;">
            <li class="nav-item">
              <a class="nav-link active" id="general-tab" data-toggle="tab" href="#general" role="tab" aria-controls="general" aria-selected="true">General</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" id="speaker-tab" data-toggle="tab" href="#speaker" role="tab" aria-controls="speaker" aria-selected="false">Speakers</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" id="other-tab" data-toggle="tab" href="#other" role="tab" aria-controls="other" aria-selected="false">Placeholder</a>
            </li>
          </ul>
          <div class="tab-content" id="myTabContent">
            <!--              BEGIN GENERAL SETTINGS-->
            <div class="tab-pane fade show active" id="general" role="tabpanel" aria-labelledby="general-tab">
              <fieldset class="form-group px-2">
                <label>Timeline Sorting:</label><br>
                <div class="form-check form-check-inline mb-2">
                  <label for="timeline-sorting-asc" class="form-check-label">
                    <input v-model="timelineSorting" class="form-check-input" type="radio" name="timeline-sorting" id="timeline-sorting-asc" value="ASC">
                    ASCending
                  </label>
                </div>
                <div class="form-check form-check-inline mb-2">
                  <label for="timeline-sorting-desc" class="form-check-label">
                    <input v-model="timelineSorting" class="form-check-input" type="radio" name="timeline-sorting" id="timeline-sorting-desc" value="DESC">
                    DESCending
                  </label>
                </div>
              </fieldset>
              <hr>
              <fieldset class="form-group px-2">
                <label>Timeline View:</label><br>
                <div class="form-check ">
                  <label for="timeline-view-line" class="form-check-label">
                    <input v-model="timelineView" class="form-check-input" type="radio" name="timeline-view" id="timeline-view-line" value="LINE">
                    Display Timeline as single Line
                  </label>
                </div>
                <div class="form-check">
                  <label for="timeline-view-lanes" class="form-check-label">
                    <input v-model="timelineView" class="form-check-input" type="radio" name="timeline-view" id="timeline-view-lanes" value="LANES">
                    Display Timeline as multiple Lanes
                  </label>
                </div>
              </fieldset>
              <hr>
              <fieldset class="form-group px-2">
                <label>Visualize Confidence with Greyscale:</label><br>
                <div class="form-check form-check-inline">
                  <label for="visualize-confidence-yes" class="form-check-label">
                    <input v-model="shouldVisualizeConfidence" class="form-check-input" type="radio" name="visualize-confidence" id="visualize-confidence-yes" value="true">
                    Yes
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <label for="visualize-confidence-no" class="form-check-label">
                    <input v-model="shouldVisualizeConfidence" class="form-check-input" type="radio" name="visualize-confidence" id="visualize-confidence-no" value="false">
                    No
                  </label>
                </div>
              </fieldset>
              <fieldset class="form-group px-2">
                <label>Hightlight Keywords with Background Color:</label><br>
                <div class="form-check form-check-inline mb-2">
                  <label for="visualize-keywords-yes" class="form-check-label">
                    <input v-model="shouldVisualizeKeywords" class="form-check-input" type="radio" name="visualize-keywords" id="visualize-keywords-yes" value="true">
                    Yes
                  </label>
                </div>
                <div class="form-check form-check-inline mb-2">
                  <label for="visualize-keywords-no" class="form-check-label">
                    <input v-model="shouldVisualizeKeywords" class="form-check-input" type="radio" name="visualize-keywords" id="visualize-keywords-no" value="false">
                    No
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
                <label for="example-number-input">WordCloud Maximum Words:</label><br>
                  <input v-model="wordCloudWords" class="form-control" type="number" id="example-number-input">
              </fieldset>
            </div>
            <!--              END GENERAL SETTINGS -->

            <!--              BEGIN SPEAKER SETTINGS-->
            <div class="tab-pane fade" id="speaker" role="tabpanel" aria-labelledby="speaker-tab">
              <div class="form-group px-2">
                <label for="customRange1"># Speakers: {{speakers}}</label>
                <input v-model="speakerCount" type="range" class="custom-range" min="1" max="4" id="customRange1">
              </div>
              <div v-for="(speaker, id) in speakers" :key="'speaker-settings-'+speaker">
                <div class="form-group px-2">
                  <hr>
                  <label :for="'speaker-' + speaker + '-name-input'">Speaker {{speaker}} Name:</label>
                  <input v-model="speakerName[id]" class="form-control" type="text" id="'speaker-' + speaker + '-name-input'">
                </div>
                <fieldset class="form-group px-2">
                  <label>Speaker {{speaker}} Avatar:</label><br>
                  <div v-for="avatar in avatars" :key="'avatar-speaker-'+speaker+'-'+avatar" class="form-check form-check-inline mb-2">
                    <label :for="'avatar-radios-' + avatar + '-speaker-' + speaker" class="form-check-label">
                      <input v-model="selectedAvatar[id]" class="form-check-input imgradio" type="radio" :name="'avatar-radios-speaker-' + speaker" :id="'avatar-radios-' + avatar + '-speaker-' + speaker" :value="avatar">
                      <img :src="'./avatars/'+avatar" width="100" height="100">
                    </label>
                  </div>
                </fieldset>
              </div>
            </div>
            <!--              END SPEAKER SETTINGS-->

            <!--              BEGIN OTHER SETTINGS-->
            <div class="tab-pane fade" id="other" role="tabpanel" aria-labelledby="other-tab">
              <p>Other Settings coming soon :)</p>
            </div>
            <!--              END OTHER SETTINGS -->
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button v-on:click="revertSettings" type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
          <button v-on:click="saveSettings" type="button" class="btn btn-primary" data-dismiss="modal">Save changes</button>
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

export default {
  name: 'Settings',
  data() {
    return {
      speakerCount: '4',
      speakerName: ['Speaker 1', 'Speaker 2', 'Speaker 3', 'Speaker 4'],
      avatars: ['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png', 'avatar5.png', 'avatar6.png'],
      selectedAvatar: ['avatar1.png', 'avatar1.png', 'avatar1.png', 'avatar1.png'],
      timelineSorting: 'DESC',
      timelineView: 'LINE',
      shouldVisualizeConfidence: 'false',
      shouldVisualizeKeywords: 'true',
      keywordColor: 'rgb(255, 255, 0)',
      wordCloudWords: "10",
      oldSettings: {},
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
    this.saveSettings();
  },
  computed: {
    speakers() {
      return parseInt(this.speakerCount, 10);
    },
  },
  methods: {
    revertSettings() {
      this.speakerCount = "" + this.oldSettings.speaker;
      this.speakerName = this.oldSettings.speakerName;
      this.selectedAvatar = this.oldSettings.selectedAvatar;
      this.timelineSorting = this.oldSettings.timelineSorting;
      this.timelineView = this.oldSettings.timelineView;
      this.showConfidence = this.oldSettings.showConfidence;
      this.showKeywords = this.oldSettings.showKeywords;
      this.keywordColor = this.oldSettings.keywordColor;
      this.wordCloudWords = this.oldSettings.wordCloudWords;
    },
    saveSettings() {
      const settings = {
        speaker: this.speakers,
        speakerName: this.speakerName,
        selectedAvatar: this.selectedAvatar,
        timelineSorting: this.timelineSorting,
        timelineView: this.timelineView,
        showConfidence: this.shouldVisualizeConfidence,
        showKeywords: this.shouldVisualizeKeywords,
        keywordColor: this.keywordColor,
        wordCloudWords: this.wordCloudWords,
      };
      this.oldSettings = this.jsonCopy(settings);
      this.$root.$emit('onSettingsSaved', this.jsonCopy(settings));
    },
    jsonCopy(src) {
      return JSON.parse(JSON.stringify(src));
    },
  },
};
</script>

<style scoped>

</style>
