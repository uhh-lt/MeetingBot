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
                  <div class="col-sm-2 col-form-label"><b>{{utteranceID === 0 || editorUtterances[agendaID][utteranceID-1].speaker !== utterance.speaker ? editorSpeakername[utterance.speaker] : '' }}</b></div>
                  <EditableUtterance :id="'agenda-'+agendaID+'-utterance-'+utteranceID" v-model="editorUtterances[agendaID][utteranceID]"></EditableUtterance>
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
            <template v-for="(utterance, utteranceID) in editorUtterances[editorAgendaTitles.length]">
              <div class="row" :key="'editor-agenda-sonstige-'+utteranceID">
                <div class="col-sm-2 col-form-label"><b>{{utteranceID === 0 || editorUtterances[editorAgendaTitles.length][utteranceID-1].speaker !== utterance.speaker ? editorSpeakername[utterance.speaker] : '' }}</b></div>
                <EditableUtterance :id="'agenda-'+editorAgendaTitles.length+'-utterance-'+utteranceID" v-model="editorUtterances[editorAgendaTitles.length][utteranceID]"></EditableUtterance>
                <div class="col-sm-1 col-form-label" style="text-align: center;">
                  <i style="font-size: 24px; float:left;" class="fas fa-trash" v-on:click="deleteUtterance(editorAgendaTitles.length, utteranceID)"></i>
                  <i style="font-size: 24px; float:right;" class="fas"
                     :class="{'fa-poo brown': utterance.score > 0 && utterance.score <= 0.25, 'fa-frown text-danger': utterance.score > 0.25 && utterance.score <= 0.5, 'fa-meh text-warning': utterance.score > 0.5 && utterance.score <= 0.75, 'fa-smile text-success': utterance.score > 0.75}"></i></div>
              </div>
            </template>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button v-on:click="applyChanges" type="button" class="btn btn-primary mr-auto" :title="$t('exporter_refresh_warning')">{{ $t('exporter_refresh') }}</button>
          <button type="button" class="btn btn-danger" data-dismiss="modal">{{ $t('close') }}</button>
          <a class="btn btn-primary" :href="mailto">{{ $t('exporter_write_email') }}</a>
          <button :disabled="creatingPDF" v-on:click="createPDF" type="button" class="btn btn-success" data-dismiss="modal">{{ $t('exporter_download_pdf') }}</button>
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
import { computeSummary } from '../helper/api';

/**
 * This component offers two main functionalities:
 * - An editor that allows to edit the utterances and gives visual feedback that indicates the ASR confidence.
 * - An PDF exporter that allows to export the edited transcript. The exported transcript will contain a summary as well as the edited transcript for each agenda point of the meeting.
 */
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
      creatingPDF: false,
    };
  },
  computed: {
    utterances() { // this is just an alias, but more understandable than 'value'
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
    // listen to events from other components
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);
    this.$root.$on('onOpenExporter', this.onOpenExporter);
    this.$root.$on('onReset', this.onReset);
  },
  methods: {
    updateValue(newValue) {
      this.$emit('input', newValue);
    },
    /**
     * This function initializes the editor. Basically it creates a copy of each original utterance and saves them as 'editorUtterance'.
     * This way, there are now two version of each utterance: the original and the editor utterance.
     * This has several advantages: If we want to revert all editor changes, just do not change the original utterances! If we want to apply all editor changes, just replace the original utterances with the editor utterances.
     */
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
    /**
     * This function generates a HTML mailto: string. Clicking on this mailto link will open the users e-mail program with a standard text generated by this function.
     */
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
    getEditedUtteranceText(agendaID, utteranceID) {
      return document.getElementById(`agenda-${agendaID}-utterance-${utteranceID}`).textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    deleteUtterance(agendaId, utteranceID) {
      this.editorUtterances[agendaId].splice(utteranceID, 1);
    },
    /**
     * This function gets all the user edited utterances and then updates the original utterances.
     * This has the effect that the conversation history shows the edited utterances (as the original utterances are replaced by the edited utterances).
     */
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
    /**
     * This function first groups all utterances by agenda point (in the end there is one text segment per agenda point containing all utterances regarding this agenda point)
     * and then utilizes the summarization micro services to generate a summary per agenda point.
     */
    async createSummaries() {
      const agendaContent = [];
      for (let i = 0; i < this.editorAgendaPoints + 1; i += 1) {
        agendaContent[i] = {
          text: '',
          sentences: 0,
        };
        let start = true;
        const utterances = this.editorUtterances[i];
        for (let uID = 0; uID < utterances.length; uID += 1) {
          if (start) {
            agendaContent[i].text += `${this.getEditedUtteranceText(i, uID)}.`;
          } else {
            agendaContent[i].text += ` ${this.getEditedUtteranceText(i, uID)}.`;
          }
          agendaContent[i].sentences += 1;
          start = false;
        }
        agendaContent[i].text = agendaContent[i].text.trim();
      }
      return computeSummary(agendaContent, this.$i18n.locale, this.settings.summarymethod);
    },
    /**
     * This function takes the edited utterances, generates summaries with the 'createSummaries' function and then renders both as a PDF using jspdf.
     */
    async createPDF() {
      this.creatingPDF = true;
      const summaries = await this.createSummaries();
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
        if (summaries[i] !== '') {
          html += `<p><b>${this.$t('exporter_summary')}:</b> ${summaries[i]}</p>`;
        }
        let start = true;
        let lastSpeaker = -1337;
        const utterances = this.editorUtterances[i];
        let utterance;
        for (let uID = 0; uID < utterances.length; uID += 1) {
          utterance = utterances[uID];
          if (utterance.speaker !== lastSpeaker) {
            if (start) {
              html += `<p><b>${this.editorSpeakername[utterance.speaker]} (${utterance.startTime}):</b> ${this.getEditedUtteranceText(i, uID)}.`;
            } else {
              html += `</p><p><b>${this.editorSpeakername[utterance.speaker]} (${utterance.startTime}):</b> ${this.getEditedUtteranceText(i, uID)}.`;
            }
          } else {
            html += ` ${this.getEditedUtteranceText(i, uID)}.`;
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
      this.creatingPDF = false;
    },
    // BEGIN UI functions
    /**
     * This function opens / closes
     */
    toggleEditorAgenda(element) {
      this.editorAgendaVisibility[element] = !this.editorAgendaVisibility[element];
      this.editorAgendaVisibility = this.editorAgendaVisibility.slice(0);
    },
    // END UI functions
    // BEGIN utility functions
    /**
     * This is a utility function that creates a deep copy of any object
     * @param src object to clone
     * @returns {any} cloned object
     */
    jsonCopy(src) {
      return JSON.parse(JSON.stringify(src));
    },
    // END utility functions
    // BEGIN methods that react to events
    onOpenExporter() {
      if (this.firstTime) {
        this.initEditorUtterances();
      }
      this.firstTime = false;
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
    // END methods that react to events
  },
};
</script>

<style scoped>
</style>
