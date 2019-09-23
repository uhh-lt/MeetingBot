<template>
  <!--    START EXPORTEDITOR-->
  <div class="modal fade" id="exportModal" tabindex="-1" role="dialog" aria-labelledby="exportModalLabel" aria-hidden="true">
    <div style="max-width:1200px" class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header text-white bg-dark">
          <h4 class="modal-title" id="exporteModalLabel">Meeting Exportieren</h4>
          <button type="button" class="btn btn-danger my-2 my-sm-0" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <h1>Meeting vom {{editorAgendaDate}}</h1>
          <br>
          <h2>Agenda</h2>
          <ol>
            <li v-for="(title, id) in editorAgendaTitles"><a :href="'#a'+id">{{title}}</a></li>
          </ol>
          <br>

          <template v-for="(title, id) in editorAgendaTitles">
            <h2 :id="'a'+id">
              <i v-if="!editorAgendaVisibility[id]" v-on:click="toggleEditorAgenda(id)" class="fas fa-chevron-down"></i>
              <i v-if="editorAgendaVisibility[id]" v-on:click="toggleEditorAgenda(id)" class="fas fa-chevron-up"></i>
              {{title}}
            </h2>
            <div :style="editorAgendaVisibility[id] ? '' : 'display:none'" class="form-group">
              <template v-for="(utterance, uID) in editorUtterances[id]">
                <div class="row">
                  <div class="col-sm-2 col-form-label"><b>{{utterance.showSpeaker ? editorSpeakername[utterance.speaker] : '' }}</b></div>
                  <div :id="'agenda-'+id+'-utterance-'+uID" class="col-sm-9 form-control-plaintext" contenteditable v-html="utterance.html"></div>
                  <div class="col-sm-1 col-form-label" style="text-align: center;">
                    <i style="font-size: 24px;" class="fas"
                       :class="{'fa-poo brown': utterance.score > 0 && utterance.score <= 0.25, 'fa-frown text-danger': utterance.score > 0.25 && utterance.score <= 0.5, 'fa-meh text-warning': utterance.score > 0.5 && utterance.score <= 0.75, 'fa-smile text-success': utterance.score > 0.75}"></i></div>
                </div>
              </template>
            </div>
            <hr>
          </template>
          <h2>
            <i v-if="!editorAgendaVisibility[editorAgendaTitles.length]" v-on:click="toggleEditorAgenda(editorAgendaTitles.length)" class="fas fa-chevron-down"></i>
            <i v-if="editorAgendaVisibility[editorAgendaTitles.length]" v-on:click="toggleEditorAgenda(editorAgendaTitles.length)" class="fas fa-chevron-up"></i>
            Sonstiges
          </h2>
          <div :style="editorAgendaVisibility[editorAgendaTitles.length] ? '' : 'display:none'" class="form-group">
            <template v-for="(utterance, uID) in editorUtterances[editorAgendaTitles.length]">
              <div class="row">
                <div class="col-sm-2 col-form-label"><b>{{utterance.showSpeaker ? editorSpeakername[utterance.speaker] : '' }}</b></div>
                <div :id="'agenda-'+(editorAgendaTitles.length)+'-utterance-'+uID" class="col-sm-9 form-control-plaintext" contenteditable v-html="utterance.html"></div>
                <div class="col-sm-1 col-form-label" style="text-align: center;">
                  <i style="font-size: 24px;" class="fas"
                     :class="{'fa-poo brown': utterance.score > 0 && utterance.score <= 0.25, 'fa-frown text-danger': utterance.score > 0.25 && utterance.score <= 0.5, 'fa-meh text-warning': utterance.score > 0.5 && utterance.score <= 0.75, 'fa-smile text-success': utterance.score > 0.75}"></i></div>
              </div>
            </template>
          </div>
        </div>
        <div class="modal-footer bg-light">
          <button v-on:click="updateEditorUtterances" type="button" class="btn btn-primary mr-auto">Aussagen aktualisieren</button>
          <button type="button" class="btn btn-danger" data-dismiss="modal">Schließen</button>
          <a class="btn btn-primary" :href="mailto">E-Mail schreiben</a>
          <button v-on:click="createPDF" type="button" class="btn btn-success" data-dismiss="modal">PDF herunterladen</button>
        </div>
      </div>
    </div>
  </div>
  <!--    END EXPORTEDITOR -->
</template>

<script>
import jsPDF from 'jspdf';

export default {
  name: 'Exporter',
  props: ['utterances'],
  data() {
    return {
      setttings: {},
      editorAgendaDate: 'XX.XX.XXXX',
      editorAgendaPoints: 4,
      editorAgendaTitles: ['Punkt 1', 'Punkt 2', 'Punkt 3', 'Punkt 4'],
      editorAgendaVisibility: [true, true, true, true],
      editorUtterances: [],
      editorSpeakername: [],
      firstTime: true,
    };
  },
  computed: {
    mailto() {
      let mailto = 'mailto:';
      let firstCC = true;
      let i = 0;
      this.settings.speakerMail.forEach(email => {
        if(i === 0) {
          mailto += email;
        } else {
          if(firstCC) {
            mailto += '?cc=';
            firstCC = false;
          }
          if(i === this.settings.speakerMail.length -1) {
            mailto += email;
          } else {
            mailto += email + ";";
          }
        }
        i += 1;
      });
      mailto += '&subject=Meeting%20vom%20' + this.editorAgendaDate;
      mailto += '&body=Hallo%20alle%20Zusammen'+escape(',')+escape('\r\n')+escape('\r\n')+'Unter%20folgendem%20Link%20findet%20Ihr%20die%20automatisch%20generierte%20Zusammenfassung%20unseres%20Meetings'+escape('.')+escape('\r\n')+escape('\r\n')+'http://example.com/'+escape('\r\n')+escape('\r\n')+'Gruß'+escape('\r\n')+'MoM%20Bot';
      return mailto;
    },
  },
  mounted() {
    // listen to events
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);
    this.$root.$on('onOpenExporter', this.onOpenExporter);
  },
  methods: {
    onSettingsSaved(settings) {
      this.settings = settings;
    },
    onOpenExporter() {
      if (this.firstTime) {
        this.updateEditorUtterances();
      }
      this.firstTime = false;
    },
    toggleEditorAgenda(element) {
      this.editorAgendaVisibility[element] = !this.editorAgendaVisibility[element];
      this.editorAgendaVisibility = this.editorAgendaVisibility.slice(0);
    },
    getEditedUtteranceText(agendaID, utteranceID) {
      const elementID = `agenda-${agendaID}-utterance-${utteranceID}`;
      const text = document.getElementById(elementID).innerHTML;
      return text;
    },
    updateEditorUtterances() {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      const yyyy = today.getFullYear();
      this.editorAgendaDate = `${dd}.${mm}.${yyyy}`;

      this.editorSpeakername = this.settings.speakerName;

      this.editorAgendaPoints = this.settings.agendaPoints;
      this.editorAgendaTitles = [];
      this.editorAgendaVisibility = [];
      for (let i = 0; i < this.settings.agendaPoints; i++) {
        this.editorAgendaTitles.push(this.settings.agendaTitel[i]);
        this.editorAgendaVisibility.push(true);
      }
      this.editorAgendaVisibility.push(true);

      this.editorUtterances = [];
      for (let i = 0; i < this.editorAgendaPoints + 1; i++) {
        let utterances = this.utterances.filter(value => value.agenda === i);
        utterances = this.jsonCopy(utterances);

        let lastSpeaker = -1337;
        let numConfidences = 0;
        utterances.forEach((utterance) => {
          utterance.showSpeaker = utterance.speaker !== lastSpeaker;
          numConfidences = utterance.confidences.length;
          utterance.score = utterance.confidences.reduce((a, b) => a + b) / numConfidences;
          lastSpeaker = utterance.speaker;
          utterance.html = this.visualizeUtterance(utterance);
        });

        this.editorUtterances.push(utterances);
      }

      this.editorSpeakername = this.editorSpeakername.slice();
      this.editorAgendaTitles = this.editorAgendaTitles.slice();
      this.editorAgendaVisibility = this.editorAgendaVisibility.slice();
      this.editorUtterances = this.editorUtterances.slice();
    },
    visualizeUtterance(utterance) {
      let html = '';
      const tokens = utterance.text.split(' ');
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const confidence = utterance.confidences[i];
        html += confidence > 0.25 ? `${token} ` : `<span class="confword">${token}</span> `;
      }
      return html.trim();
    },
    createPDF() {
      const pdf = new jsPDF('p', 'pt', 'letter');
      // source can be HTML-formatted string, or a reference
      // to an actual DOM element from which the text will be scraped.

      let html = `${''
          + '<h1>Meeting vom '}${this.editorAgendaDate}</h1>`
          + '<h2>Agenda</h2>';

      html += '<ol>';
      for (let i = 0; i < this.editorAgendaPoints; i++) {
        html += `<li>${this.editorAgendaTitles[i]}</li>`;
      }
      html += '</ol>';

      for (let i = 0; i < this.editorAgendaPoints + 1; i++) {
        const agendaTitle = i < this.editorAgendaPoints ? this.editorAgendaTitles[i] : 'Sonstiges';
        html += `<h2>${agendaTitle}</h2>`;

        let start = true;
        let lastSpeaker = -1337;
        const utterances = this.editorUtterances[i];
        let utterance;
        for (let uID = 0; uID < utterances.length; uID++) {
          utterance = utterances[uID];
          if (utterance.speaker !== lastSpeaker) {
            if (start) {
              html += `<p><b>${this.editorSpeakername[utterance.speaker]} (${utterance.startTime}):</b> ${this.getEditedUtteranceText(i, uID)}`;
            } else {
              html += `</p><p><b>${this.editorSpeakername[utterance.speaker]} (${utterance.startTime}):</b> ${this.getEditedUtteranceText(i, uID)}`;
            }
          } else {
            html += this.getEditedUtteranceText(i, uID);
          }
          start = false;
          lastSpeaker = utterance.speaker;
        }
        html += '</p>';
      }

      // we support special element handlers. Register them with jQuery-style
      // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
      // There is no support for any other type of selectors
      // (class, of compound) at this time.
      const specialElementHandlers = {
        // element with id of "bypass" - jQuery style selector
        '#bypassme': function (element, renderer) {
          // true = "handled elsewhere, bypass text extraction"
          return true;
        },
      };
      const margins = {
        top: 30,
        bottom: 40,
        left: 40,
        width: 522,
      };
        // all coords and widths are in jsPDF instance's declared units
        // 'inches' in this case

      const filename = `Meeting_${this.editorAgendaDate.replace(/\./g, '-')}.pdf`;
      pdf.fromHTML(
        html, // HTML string or DOM elem ref.
        margins.left, // x coord
        margins.top, { // y coord
          width: margins.width, // max width of content on PDF
          elementHandlers: specialElementHandlers,
        },
        (dispose) => {
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
