<template>
  <!--    START EXPORTEDITOR-->
  <div class="modal fade" id="exportModal" tabindex="-1" role="dialog" aria-labelledby="exportModalLabel" aria-hidden="true">
    <div style="max-width:1200px" class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header text-white bg-dark">
          <h4 class="modal-title" id="exporteModalLabel">{{ $t('exporter_title') }}</h4>
          <button type="button" class="btn btn-danger my-2 my-sm-0" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <h1>{{ $t('exporter_meeting_from') }} {{editorAgendaDate}}</h1>
          <br>
          <h2>{{ $t('exporter_agenda') }}</h2>
          <ol>
            <li v-for="(title, id) in editorAgendaTitles" :key="'editor-agenda-title-'+id"><a :href="'#a'+id">{{title}}</a></li>
          </ol>
          <br>

          <template v-for="(title, agendaID) in editorAgendaTitles">
            <h2 :id="'a'+agendaID" :key="'editor-agenda-headline-'+agendaID">
              <i v-if="!editorAgendaVisibility[agendaID]" v-on:click="toggleEditorAgenda(agendaID)" class="fas fa-chevron-down"></i>
              <i v-if="editorAgendaVisibility[agendaID]" v-on:click="toggleEditorAgenda(agendaID)" class="fas fa-chevron-up"></i>
              {{title}}
            </h2>
            <div :style="editorAgendaVisibility[agendaID] ? '' : 'display:none'" class="form-group" :key="'editor-agenda-container-'+agendaID">
              <template v-for="(utterance, utteranceID) in editorUtterances[agendaID]">
                <div class="row" :key="'editor-agenda-'+agendaID+'-utterance-'+utteranceID">
<!--                  <div class="col-sm-2 col-form-label"><b>{{utterance.showSpeaker ? editorSpeakername[utterance.speaker] : '' }}</b></div>-->
                  <div class="col-sm-2 col-form-label"><b>{{utteranceID === 0 || editorUtterances[agendaID][utteranceID-1].speaker !== utterance.speaker ? editorSpeakername[utterance.speaker] : '' }}</b></div>
                  <EditableUtterance :id="'agenda-'+agendaID+'-utterance-'+utteranceID" v-model="editorUtterances[agendaID][utteranceID]"></EditableUtterance>
<!--                  <div :id="'agenda-'+agendaID+'-utterance-'+utteranceID" class="col-sm-9 form-control-plaintext" contenteditable v-html="utterance.html"></div>-->
                  <div class="col-sm-1 col-form-label" style="text-align: center;">
                    <i style="font-size: 24px; float:left;" class="fas fa-trash" v-on:click="deleteUtterance(agendaID, utteranceID)"></i>
                    <i style="font-size: 24px; float:right;" class="fas"
                       :class="{'fa-poo brown': utterance.score > 0 && utterance.score <= 0.25, 'fa-frown text-danger': utterance.score > 0.25 && utterance.score <= 0.5, 'fa-meh text-warning': utterance.score > 0.5 && utterance.score <= 0.75, 'fa-smile text-success': utterance.score > 0.75}"></i></div>
                </div>
              </template>
            </div>
            <hr :key="'editor-agenda-line-'+agendaID">
          </template>
          <h2>
            <i v-if="!editorAgendaVisibility[editorAgendaTitles.length]" v-on:click="toggleEditorAgenda(editorAgendaTitles.length)" class="fas fa-chevron-down"></i>
            <i v-if="editorAgendaVisibility[editorAgendaTitles.length]" v-on:click="toggleEditorAgenda(editorAgendaTitles.length)" class="fas fa-chevron-up"></i>
            {{ $t('exporter_other') }}
          </h2>
          <div :style="editorAgendaVisibility[editorAgendaTitles.length] ? '' : 'display:none'" class="form-group">
            <template v-for="(utterance, uID) in editorUtterances[editorAgendaTitles.length]">
              <div class="row" :key="'editor-agenda-sonstige-'+uID">
                <div class="col-sm-2 col-form-label"><b>{{utterance.showSpeaker ? editorSpeakername[utterance.speaker] : '' }}</b></div>
                <div :id="'agenda-'+(editorAgendaTitles.length)+'-utterance-'+uID" class="col-sm-9 form-control-plaintext" contenteditable v-html="utterance.html"></div>
                <div class="col-sm-1 col-form-label">
                  <i style="font-size: 24px; float:left;" class="fas fa-trash"></i>
                  <i style="font-size: 24px; float:right" class="fas"
                     :class="{'fa-poo brown': utterance.score > 0 && utterance.score <= 0.25, 'fa-frown text-danger': utterance.score > 0.25 && utterance.score <= 0.5, 'fa-meh text-warning': utterance.score > 0.5 && utterance.score <= 0.75, 'fa-smile text-success': utterance.score > 0.75}"></i></div>
              </div>
            </template>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button v-on:click="applyChanges" type="button" class="btn btn-primary mr-auto" :title="$t('exporter_refresh_warning')">{{ $t('exporter_refresh') }}</button>
          <button type="button" class="btn btn-danger" data-dismiss="modal">{{ $t('close') }}</button>
          <a class="btn btn-primary" :href="mailto">{{ $t('exporter_write_email') }}</a>
          <button v-on:click="createPDF" type="button" class="btn btn-success" data-dismiss="modal">{{ $t('exporter_download_pdf') }}</button>
        </div>
      </div>
    </div>
  </div>
  <!--    END EXPORTEDITOR -->
</template>

<script>
import JSPDF from 'jspdf';
import calculateKeywordnessTokenMap from '../helper/keyword';
import EditableUtterance from './EditableUtterance.vue';

export default {
  name: 'Exporter',
  components: { EditableUtterance },
  props: ['value'],
  data() {
    return {
      settings: {},
      editorAgendaPoints: 4,
      editorAgendaTitles: ['Punkt 1', 'Punkt 2', 'Punkt 3', 'Punkt 4'],
      editorAgendaVisibility: [true, true, true, true],
      editorUtterances: [],
      editorSpeakername: [],
      firstTime: true,
      mailto: '',
    };
  },
  computed: {
    utterances() {
      return this.value;
    },
    editorAgendaDate() {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      const yyyy = today.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    },
  },
  mounted() {
    // listen to events
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);
    this.$root.$on('onOpenExporter', this.onOpenExporter);
    this.$root.$on('onReset', this.onReset);
  },
  methods: {
    updateValue(newValue) {
      this.$emit('input', newValue);
    },
    onReset() {
      this.firstTime = true;
      this.editorAgendaPoints = 4;
      this.editorAgendaTitles = ['Punkt 1', 'Punkt 2', 'Punkt 3', 'Punkt 4'];
      this.editorAgendaVisibility = [true, true, true, true];
      this.editorUtterances = [];
      this.editorSpeakername = [];
      this.firstTime = true;
      this.mailto = '';
    },
    onSettingsSaved(settings) {
      this.settings = settings;
      this.editorSpeakername = this.settings.speakerName;
      this.editorSpeakername = this.editorSpeakername.slice();
      this.calculateMailto();
    },
    onOpenExporter() {
      if (this.firstTime) {
        this.initEditorUtterances();
      }
      this.firstTime = false;
    },
    calculateMailto() {
      let mailto = 'mailto:';
      let firstCC = true;
      if (this.settings.speakerMail !== undefined) {
        for (let i = 0; i < this.settings.speaker; i += 1) {
          const email = this.settings.speakerMail[i];
          if (i === 0) {
            mailto += email;
          } else {
            if (firstCC) {
              mailto += '?cc=';
              firstCC = false;
            }
            if (i === this.settings.speakerMail.length - 1) {
              mailto += email;
            } else {
              mailto += `${email};`;
            }
          }
        }
        mailto += `&subject=Meeting%20vom%20${this.editorAgendaDate}`;
        mailto += `&body=Hallo%20alle%20Zusammen${escape(',')}${escape('\r\n')}${escape('\r\n')}Unter%20folgendem%20Link%20findet%20Ihr%20die%20automatisch%20generierte%20Zusammenfassung%20unseres%20Meetings${escape('.')}${escape('\r\n')}${escape('\r\n')}https://speech.tools/mombot/Meeting_${this.editorAgendaDate}.pdf${escape('\r\n')}${escape('\r\n')}Gruß${escape('\r\n')}MoM%20Bot`;
        this.mailto = mailto;
      } else {
        this.mailto = '';
      }
    },
    toggleEditorAgenda(element) {
      this.editorAgendaVisibility[element] = !this.editorAgendaVisibility[element];
      this.editorAgendaVisibility = this.editorAgendaVisibility.slice(0);
    },
    getEditedUtteranceText(agendaID, utteranceID) {
      return document.getElementById(`agenda-${agendaID}-utterance-${utteranceID}`).textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    deleteUtterance(agendaId, utteranceID) {
      this.editorUtterances[agendaId].splice(utteranceID, 1);
    },
    applyChanges() {
      const result = [];
      for (let agendaID = 0; agendaID < this.editorAgendaPoints + 1; agendaID += 1) {
        const utterances = this.editorUtterances[agendaID];
        let utterance;
        for (let uID = 0; uID < utterances.length; uID += 1) {
          utterance = utterances[uID];
          utterance.text = this.getEditedUtteranceText(agendaID, uID);
          console.log(utterance.text);
          utterance.confidences = new Array(utterance.text.split(' ').length).fill(1); // PROBLEM: CONFIDENCES ARE LOST!!!
          const { keywordnessTokenMap, keywordInfo } = calculateKeywordnessTokenMap(utterance);
          utterance.keywordnessTokenMap = keywordnessTokenMap;
          utterance.keywordInfo = keywordInfo;
          result.push(utterance);
        }
      }
      console.log(result);
      this.updateValue(this.jsonCopy(result));
    },
    initEditorUtterances() {
      console.log('UPDATE EDITOR!');
      this.editorSpeakername = this.settings.speakerName;

      this.editorAgendaPoints = this.settings.agendaPoints;
      this.editorAgendaTitles = [];
      this.editorAgendaVisibility = [];
      for (let i = 0; i < this.settings.agendaPoints; i += 1) {
        this.editorAgendaTitles.push(this.settings.agendaTitel[i]);
        this.editorAgendaVisibility.push(true);
      }
      this.editorAgendaVisibility.push(true);

      this.editorUtterances = [];
      for (let i = 0; i < this.editorAgendaPoints + 1; i += 1) {
        const utterances = this.jsonCopy(this.utterances.filter(value => value.agenda === i));

        let numConfidences = 0;
        for (let j = 0; j < utterances.length; j += 1) {
          const utterance = utterances[j];
          numConfidences = utterance.confidences.length;
          utterance.score = utterance.confidences.reduce((a, b) => a + b) / numConfidences;
        }
        this.editorUtterances.push(utterances);
      }

      this.editorSpeakername = this.editorSpeakername.slice();
      this.editorAgendaTitles = this.editorAgendaTitles.slice();
      this.editorAgendaVisibility = this.editorAgendaVisibility.slice();
      this.editorUtterances = this.editorUtterances.slice();

      this.calculateMailto();
    },
    createPDF() {
      const pdf = new JSPDF('p', 'pt', 'letter');
      // source can be HTML-formatted string, or a reference
      // to an actual DOM element from which the text will be scraped.

      let html = `${''
          + '<h1>Meeting vom '}${this.editorAgendaDate}</h1>`
          + '<h2>Agenda</h2>';

      html += '<ol>';
      for (let i = 0; i < this.editorAgendaPoints; i += 1) {
        html += `<li>${this.editorAgendaTitles[i]}</li>`;
      }
      html += '</ol>';

      for (let i = 0; i < this.editorAgendaPoints + 1; i += 1) {
        const agendaTitle = i < this.editorAgendaPoints ? this.editorAgendaTitles[i] : 'Sonstiges';
        html += `<h2>${agendaTitle}</h2>`;

        let start = true;
        let lastSpeaker = -1337;
        const utterances = this.editorUtterances[i];
        let utterance;
        for (let uID = 0; uID < utterances.length; uID += 1) {
          utterance = utterances[uID];
          if (utterance.speaker !== lastSpeaker) {
            if (start) {
              html += `<p><b>${this.editorSpeakername[utterance.speaker]} (${utterance.startTime}):</b> ${this.getEditedUtteranceText(i, uID)}`;
            } else {
              html += `</p><p><b>${this.editorSpeakername[utterance.speaker]} (${utterance.startTime}):</b> ${this.getEditedUtteranceText(i, uID)}`;
            }
          } else {
            html += ` ${this.getEditedUtteranceText(i, uID)}`;
          }
          start = false;
          lastSpeaker = utterance.speaker;
        }
        html = html.trim();
        html += '</p>';
      }

      const margins = {
        top: 30,
        bottom: 40,
        left: 40,
        width: 522,
      };
        // all coords and widths are in JSPDF instance's declared units
        // 'inches' in this case

      const filename = `Meeting_${this.editorAgendaDate.replace(/\./g, '-')}.pdf`;
      pdf.fromHTML(
        html, // HTML string or DOM elem ref.
        margins.left, // x coord
        margins.top, { // y coord
          width: margins.width, // max width of content on PDF
        },
        () => {
          // dispose: object with X, Y of the last line add to the PDF
          //          this allow the insertion of new lines after html
          pdf.save(filename);
        }, margins,
      );
    },
    jsonCopy(src) {
      return JSON.parse(JSON.stringify(src));
    },
  },
};
</script>

<style scoped>
</style>
