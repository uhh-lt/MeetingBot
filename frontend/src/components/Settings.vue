<template>
  <!--    START SETTINGS-->
  <div class="modal fade" id="settingsModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header text-white bg-dark">
          <h4 class="modal-title" id="exampleModalLabel">Einstellungen</h4>
          <button v-on:click="revertSettings" type="button" class="btn btn-danger my-2 my-sm-0" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <ul class="nav nav-tabs" id="myTab" role="tablist" style="margin-bottom: 10px;">
            <li class="nav-item">
              <a class="nav-link active" id="general-tab" data-toggle="tab" href="#general" role="tab" aria-controls="general" aria-selected="true">Allgemein</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" id="speaker-tab" data-toggle="tab" href="#speaker" role="tab" aria-controls="speaker" aria-selected="false">Sprecher</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" id="agenda-tab" data-toggle="tab" href="#agenda" role="tab" aria-controls="agenda" aria-selected="false">Agenda</a>
            </li>
          </ul>
          <div class="tab-content" id="myTabContent">
            <!--              BEGIN GENERAL SETTINGS-->
            <div class="tab-pane fade show active" id="general" role="tabpanel" aria-labelledby="general-tab">
              <fieldset class="form-group px-2">
                <label>Sortierung der Zeitleiste:</label><br>
                <div class="form-check form-check-inline mb-2">
                  <label for="timeline-sorting-asc" class="form-check-label">
                    <input v-model="timelineSorting" class="form-check-input" type="radio" name="timeline-sorting" id="timeline-sorting-asc" value="ASC">
                    AUFsteigend
                  </label>
                </div>
                <div class="form-check form-check-inline mb-2">
                  <label for="timeline-sorting-desc" class="form-check-label">
                    <input v-model="timelineSorting" class="form-check-input" type="radio" name="timeline-sorting" id="timeline-sorting-desc" value="DESC">
                    ABsteigend
                  </label>
                </div>
              </fieldset>
              <hr>
              <fieldset class="form-group px-2">
                <label>Zeitleisten Ansicht:</label><br>
                <div class="form-check ">
                  <label for="timeline-view-line" class="form-check-label">
                    <input v-model="timelineView" class="form-check-input" type="radio" name="timeline-view" id="timeline-view-line" value="LINE">
                    Visualisiere den Gesprächsverlauf als eine einzige Linie
                  </label>
                </div>
                <div class="form-check">
                  <label for="timeline-view-lanes" class="form-check-label">
                    <input v-model="timelineView" class="form-check-input" type="radio" name="timeline-view" id="timeline-view-lanes" value="LANES">
                    Visualisiere den Gesprächsverlauf mit einer Linie pro Sprecher
                  </label>
                </div>
              </fieldset>
              <hr>
              <fieldset class="form-group px-2">
                <label>Visualisiere die Konfidenzen mit Graustufen:</label><br>
                <div class="form-check form-check-inline">
                  <label for="visualize-confidence-yes" class="form-check-label">
                    <input v-model="shouldVisualizeConfidence" class="form-check-input" type="radio" name="visualize-confidence" id="visualize-confidence-yes" value="true">
                    Ja
                  </label>
                </div>
                <div class="form-check form-check-inline">
                  <label for="visualize-confidence-no" class="form-check-label">
                    <input v-model="shouldVisualizeConfidence" class="form-check-input" type="radio" name="visualize-confidence" id="visualize-confidence-no" value="false">
                    Nein
                  </label>
                </div>
              </fieldset>
              <fieldset class="form-group px-2">
                <label>Hebe Schlüsselwörter mit einer Hintergrundfarbe hervor:</label><br>
                <div class="form-check form-check-inline mb-2">
                  <label for="visualize-keywords-yes" class="form-check-label">
                    <input v-model="shouldVisualizeKeywords" class="form-check-input" type="radio" name="visualize-keywords" id="visualize-keywords-yes" value="true">
                    Ja
                  </label>
                </div>
                <div class="form-check form-check-inline mb-2">
                  <label for="visualize-keywords-no" class="form-check-label">
                    <input v-model="shouldVisualizeKeywords" class="form-check-input" type="radio" name="visualize-keywords" id="visualize-keywords-no" value="false">
                    Nein
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
                <label for="example-number-input">Maximale Wörter in der Wort Wolke:</label><br>
                  <input v-model="wordCloudWords" class="form-control" type="number" id="example-number-input">
              </fieldset>
            </div>
            <!--              END GENERAL SETTINGS -->

            <!--              BEGIN SPEAKER SETTINGS-->
            <div class="tab-pane fade" id="speaker" role="tabpanel" aria-labelledby="speaker-tab">
              <div class="form-group px-2">
                <label v-if="meeting.status === meeting.enum.BEFORE_MEETING" for="customRange1"># Sprecher: {{speakers}}</label>
                <label v-if="meeting.status !== meeting.enum.BEFORE_MEETING" for="customRange1"># Sprecher: {{speakers}} <span class="text-danger">(Kann nur vor dem Meeting geändert werden)</span></label>
                <input :disabled="meeting.status !== meeting.enum.BEFORE_MEETING" v-model="speakerCount" type="range" class="custom-range" min="1" max="4" id="customRange1">
              </div>
              <div v-for="(speaker, id) in speakers" :key="'speaker-settings-'+speaker">
                <hr>
                <div class="row" style="padding: 0 1rem;">
                  <div class="col-sm-4 form-group px-2">
                    <label :for="'speaker-' + speaker + '-name-input'">Sprecher {{speaker}} Name:</label>
                    <input v-model="speakerName[id]" class="form-control" type="text" :id="'speaker-' + speaker + '-name-input'">
                  </div>
                  <div class="col-sm-8 form-group px-2">
                    <label :for="'speaker-' + speaker + '-email-input'">Sprecher {{speaker}} E-Mail:</label>
                    <input v-model="speakerMail[id]" class="form-control" type="text" :id="'speaker-' + speaker + '-email-input'">
                  </div>
                </div>
                <fieldset class="form-group px-2">
                  <label>Sprecher {{speaker}} Avatar:</label><br>
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

            <!--              BEGIN AGENDA SETTINGS-->
            <div class="tab-pane fade" id="agenda" role="tabpanel" aria-labelledby="agenda-tab">
              <div class="form-group px-2">
                <label v-if="meeting.status === meeting.enum.BEFORE_MEETING" for="customRange1"># Agendapunkte: {{agendas}}</label>
                <label v-if="meeting.status !== meeting.enum.BEFORE_MEETING" for="customRange1"># Agendapunkte: {{agendas}} <span class="text-danger">(Kann nur vor dem Meeting geändert werden)</span></label>
                <input :disabled="meeting.status !== meeting.enum.BEFORE_MEETING" v-model="agendaPoints" type="range" class="custom-range" min="1" max="10" id="customRange2">
              </div>
              <fieldset class="form-group px-2">
                <label for="agenda-warn-time-input">Warn Zeit (Wie viele Minuten vor Ende eines Agendapunkts soll gewarnt werden?):</label><br>
                <input v-model="agendaWarnTime" class="form-control" type="number" id="agenda-warn-time-input">
              </fieldset>
              <div v-for="(index, id) in agendas" :key="'agenda-settings-'+index">
                <div class="form-group px-2">
                  <hr>
                  <label :for="'agenda-' + index + '-titel-input'">{{index}}. Agendapunkt Titel:</label>
                  <input v-model="agendaTitel[id]" class="form-control" type="text" :id="'agenda-' + index + '-titel-input'">
                </div>
                <fieldset class="form-group px-2">
                  <label :for="'agenda-' + index + '-time-input'">Geplante Zeit (in Minuten):</label><br>
                  <input v-model="agendaTime[id]" class="form-control" type="number" :id="'agenda-' + index + '-time-input'">
                </fieldset>
              </div>
            </div>
            <!--              END AGENDA SETTINGS -->
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button v-on:click="revertSettings" type="button" class="btn btn-danger" data-dismiss="modal">Schließen</button>
          <button v-on:click="saveSettings" type="button" class="btn btn-primary" data-dismiss="modal">Änderungen speichern</button>
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

export default {
  name: 'Settings',
  data() {
    return {
      speakerCount: '4',
      speakerName: ['Sprecher 1', 'Sprecher 2', 'Sprecher 3', 'Sprecher 4'],
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
      agendaTitel: ['Punkt 1', 'Punkt 2', 'Punkt 3', 'Punkt 4', '', '', '', '', '', ''],
      agendaTime: ['10', '10', '10', '10', '10', '10', '10', '10', '10', '10'],
      agendaWarnTime: '5',
      meeting: Store.meeting,
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
    setTimeout(this.saveSettings, 100);

    // listen to events
    this.$root.$on('onImport', this.onImport);
  },
  computed: {
    speakers() {
      return parseInt(this.speakerCount, 10);
    },
    agendas() {
      return parseInt(this.agendaPoints, 10);
    },
  },
  methods: {
    onImport(e) {
      const event = this.jsonCopy(e);
      this.agendaPoints = event.agenda.agendaPoints;

      for (let i = 0; i < Math.min(event.agenda.agendaTitle.length, 10); i++) {
        this.agendaTitel[i] = event.agenda.agendaTitle[i];
      }
      for (let i = 0; i < Math.min(event.agenda.agendaTime.length, 10); i++) {
        this.agendaTime[i] = event.agenda.agendaTime[i];
      }
      for (let i = 0; i < Math.min(event.selectedAttendents, 4); i++) {
        this.speakerName[i] = event.attendants[i].name;
        this.speakerMail[i] = event.attendants[i].email;
      }
      this.speakerCount = Math.min(event.selectedAttendents, 4);
      this.saveSettings();
    },
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
    },
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
