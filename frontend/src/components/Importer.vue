<template>
  <div class="modal fade" id="importModal" tabindex="-1" role="dialog" aria-labelledby="importModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">

        <div class="modal-header text-white bg-dark">
          <h4 class="modal-title" id="exampleModalLabel">{{ $t('importer_import') }}</h4>
          <button v-on:click="onReset" type="button" class="btn btn-danger my-2 my-sm-0" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div class="modal-body">


          <div class="input-group">
            <div class="custom-file">
              <input ref="fileInputImport" v-on:change="loadFile" type="file" class="custom-file-input" id="inputGroupFile01" aria-describedby="inputGroupFileAddon01">
              <label ref="labelFileImport" class="custom-file-label" for="inputGroupFile01">{{ $t('importer_select_file') }}</label>
            </div>
          </div>
          <br>
          <div style="text-align: center; width:100%">
            <h5 v-if="fileImported && successfulImport" class="text-success">{{ $t('importer_import_success') }}</h5>
            <hr v-if="fileImported && successfulImport">
            <h5 v-if="fileImported && !successfulImport" class="text-danger">{{ $t('importer_import_fail') }}</h5>
          </div>

          <template v-if="successfulImport">

            <ul class="nav nav-tabs" id="myTab" role="tablist" style="margin-bottom: 10px;">
              <li v-for="(event, id) in events"  class="nav-item" :key="'successfulImport-'+id">
                <a v-on:click="selectTab(id)" class="nav-link" :class="{'show': id === 0, 'active': id === 0}" :id="'importer-tab-'+id" data-toggle="tab" :href="'#importer2-tab-'+id" role="tab" :aria-controls="'importer2-tab-'+id" aria-selected="false">{{event.title}}</a>
              </li>
            </ul>

            <div class="tab-content">

              <template v-for="(event, id) in events">

                <div class="tab-pane fade" :class="{'show': id === 0, 'active': id === 0}" :id="'importer2-tab-'+id" role="tabpanel" :aria-labelledby="'importer-tab-'+id" :key="'event-content-'+id">

                  <div class="form-group px-2">
                    <label :for="'numAttendants-'+id"># {{ $t('importer_participants') }}: {{event.selectedAttendents}}</label>
                    <input v-model="event.selectedAttendents" type="range" class="custom-range" min="1" :max="event.attendants.length" :id="'numAttendants-'+id">
                  </div>
                  <div v-for="(attendant, attendantID) in event.attendants" :key="'event-' + id + 'attendant-settings-'+attendantID">
                    <template v-if="attendantID < event.selectedAttendents">
                      <div class="row" style="padding: 0 1rem;">
                        <div class="col-sm-4 form-group px-2">
                          <label :for="'event-' + id + 'attendant-' + attendantID + '-name-input'">Name:</label>
                          <input v-model="attendant.name" class="form-control" type="text" :id="'event-' + id + 'attendant-' + attendantID + '-name-input'">
                        </div>
                        <div class="col-sm-8 form-group px-2">
                          <label :for="'event-' + id + 'attendant-' + attendantID + '-email-input'">E-Mail:</label>
                          <input v-model="attendant.email" class="form-control" type="text" :id="'event-' + id + 'attendant-' + attendantID + '-email-input'">
                        </div>
                      </div>
                    </template>
                  </div>

                  <hr>
                  <div class="form-group px-2">
                    <label :for="'numAgendas-'+id"># {{ $t('importer_agendapoints') }}: {{event.agenda.agendaPoints}}</label>
                    <input v-model="event.agenda.agendaPoints" type="range" class="custom-range" min="1" max="10" :id="'numAgendas-'+id">
                  </div>
                  <div v-for="agendaID in parseInt(event.agenda.agendaPoints, 10)" :key="'event-' + id + 'agenda-importsettings-'+agendaID">
                    <div class="row" style="padding: 0 1rem;">
                      <div class="col-sm-8 form-group px-2">
                        <label :for="'event-' + id + 'agenda2-' + agendaID + '-titel-input'">{{agendaID}}. {{ $t('importer_agendapoint') }} {{ $t('importer_title') }}:</label>
                        <input v-model="event.agenda.agendaTitle[agendaID-1]" class="form-control" type="text" :id="'event-' + id + 'agenda2-' + agendaID + '-titel-input'">
                      </div>
                      <div class="col-sm-4 form-group px-2">
                        <label :for="'event-' + id + 'agenda2-' + agendaID + '-time-input'">{{ $t('importer_planned_time_in_minutes') }}:</label><br>
                        <input v-model="event.agenda.agendaTime[agendaID-1]" class="form-control" type="number" :id="'event-' + id + 'agenda2-' + agendaID + '-time-input'">
                      </div>
                    </div>
                  </div>

                </div>
              </template>
            </div>
          </template>
        </div>

        <div class="modal-footer bg-light">
          <button v-on:click="onReset" type="button" class="btn btn-danger" data-dismiss="modal">{{ $t('close') }}</button>
          <button v-if="successfulImport" v-on:click="save" type="button" class="btn btn-primary" data-dismiss="modal">{{ $t('importer_save_selected_data') }}</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import ICAL from 'ical.js';

/**
 * This component allows to import .ics files.
 * It offers the user a UI to import .ics files, edit the imported settings and then save these settings.
 */
export default {
  name: 'Importer',
  data() {
    return {
      currentTab: 0,
      fileImported: false,
      successfulImport: false,
      events: [{
        title: 'Ein Titel',
        agenda: {
          agendaPoints: '4',
          agendaTitle: ['Punkt1', 'Punkt1', 'Punkt1', 'Punkt1'],
          agendaTime: ['10', '10', '10', '10'],
        },
        attendants: [{
          name: 'Tim',
          email: 'tim@ist.toll',
        }],
        selectedAttendents: 1,
      }],
    };
  },
  mounted() {
    // Listen to events from other components
    this.$root.$on('onReset', this.onReset);
  },
  methods: {
    // BEGIN methods to trigger events for other components
    save() {
      this.$root.$emit('onImport', this.events[this.currentTab]);
      setTimeout(() => {
        this.onReset();
      }, 100);
    },
    // END methods to trigger events for other components
    /**
     * This function reads the passed file and then tries to parse the data.
     * @param e file to load & parse
     */
    loadFile(e) {
      const file = e.target.files[0];
      console.log(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.importICSData(reader.result);
      };
      reader.readAsText(file);
      this.$refs.fileInputImport.value = '';
      this.$refs.labelFileImport.innerHTML = file.name;
    },
    /**
     * This function parses data that is in .ics format.
     * All parsed information are stored in this components data variables.
     * @param iCalendarData
     */
    importICSData(iCalendarData) {
      this.fileImported = true;
      const events = [];
      let jcalData = null;
      try {
        jcalData = ICAL.parse(iCalendarData);
      } catch (e) {
        console.log('CANNOT PARSE PROVIDED FILE :(');
      }
      if (jcalData !== null) {
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');
        vevents.forEach((vevent) => {
          events.push(this.parseEvent(vevent));
        });
        this.events = events;
      }
      this.successfulImport = jcalData !== null;
    },
    /**
     * A utility function that parses event information from ics formatted data.
     * @param vevent event data
     * @returns {{attendants: *, title: *, agenda: *, selectedAttendents: *}}
     */
    parseEvent(vevent) {
      const event = new ICAL.Event(vevent);
      const title = event.summary;
      const agenda = this.parseAgendaFromDescription(event.description);
      const attendants = this.parseAttendantsFromEvent(event);
      return {
        title,
        agenda,
        attendants,
        selectedAttendents: attendants.length,
      };
    },
    /**
     * A utility function that parses attendant information from ics formatted data.
     * @param event event data (ics format)
     * @returns {[]} list of attendees
     */
    parseAttendantsFromEvent(event) {
      const attendants = [];
      event.attendees.forEach((attend) => {
        const name = attend.jCal[1].cn;
        const email = attend.getFirstValue().replace('mailto:', '');
        if (name && email) {
          attendants.push({
            name,
            email,
          });
        }
      });
      return attendants;
    },
    /**
     * A utility function that parses agenda information a description string.
     * @param description string that contains agenda information
     * @returns {{agendaPoints: *, agendaTitle: *, agendaTime: *}}
     */
    parseAgendaFromDescription(description) {
      let agendaPoints = '0';
      const agendaTitle = [];
      const agendaTime = [];

      const re = new RegExp('\\[(.*)]');

      const agendasplit = description.split(';');
      agendasplit.forEach((a) => {
        let agenda = a.trim();
        const match = re.exec(agenda);
        const time = match[1];
        agenda = agenda.slice(0, match.index).trim();
        agendaTitle.push(agenda);
        agendaTime.push(time);
      });

      agendaPoints = `${agendaTitle.length}`;
      return {
        agendaPoints,
        agendaTitle,
        agendaTime,
      };
    },
    selectTab(id) {
      this.currentTab = id;
    },
    // BEGIN methods that react to events
    onReset() {
      this.currentTab = 0;
      this.fileImported = false;
      this.successfulImport = false;
      this.events = [];
      this.$refs.labelFileImport.innerHTML = this.$t('importer_select_file');
    },
    // END methods that react to events
  },
};
</script>

<style scoped>

</style>
