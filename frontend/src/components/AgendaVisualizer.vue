<template>
  <div style="height: 100%;" class="row">
    <div class="col-8 disable-scrollbars" style="height: 100%; overflow-y: scroll;" id="agenda-list">
      <ul class="list-group">
        <li v-for="(title, id) in filteredAgendaTitles" :key="'agendavisualizer-title-'+id" :id="'agendavisualizer-title-'+id" :class="{active: id === currentAgendaPoint, disabled: id < currentAgendaPoint}" class="list-group-item">
          {{title}} <span style="text-align:right;">({{agendaTime[id]}} min)</span>
        </li>
      </ul>
    </div>
    <div class="col-4" style="text-align: right;">
      <button v-on:click="nextAgendaPoint" type="button" class="btn btn-labeled btn-primary">
        <span class="btn-label"><i class="fas fa-forward"></i></span>{{ $t('next') }}</button>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';

/**
 * This component allows to manipulate & visualize the agenda of the meeting.
 */
export default {
  name: 'AgendaVisualizer',
  data() {
    return {
      currentAgendaPoint: 0,
      agendaTitles: ['Punkt 1', 'Punkt 2', 'Punkt 3', 'Punk 4'],
      agendaTime: [10, 10, 10, 10],
      agendaPoints: 4,
    };
  },
  computed: {
    filteredAgendaTitles() {
      return this.agendaTitles.slice(0, this.agendaPoints); // return the first #agendaPoints titles, not more!
    },
  },
  mounted() {
    // listen to events from other components
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);
    this.$root.$on('onReset', this.onReset);
  },
  methods: {
    /**
     * This function increments the current agenda point, updates the visualization & informs other components of the agenda change.
     */
    nextAgendaPoint() {
      // increment agenda
      if (this.currentAgendaPoint < this.agendaPoints) {
        this.currentAgendaPoint += 1;
      }
      // update visualization
      const id = `#agendavisualizer-title-${this.currentAgendaPoint}`;
      const element = $(id);
      if (element[0] !== undefined) {
        $('#agenda-list').scrollTop(element[0].offsetTop);
      }
      // inform other components of agenda change
      this.$root.$emit('onNextAgenda');
    },
    // BEGIN methods that react to events
    onSettingsSaved(settings) {
      this.agendaTitles = settings.agendaTitel;
      this.agendaPoints = settings.agendaPoints;
      this.agendaTime = settings.agendaTime;
    },
    onReset() {
      this.currentAgendaPoint = 0;
      this.agendaTitles = ['Punkt 1', 'Punkt 2', 'Punkt 3', 'Punkt 4'];
      this.agendaTime = ['10', '10', '10', '10'];
      this.agendaPoints = 4;
    },
    // END methods that react to events
  },
};
</script>

<style scoped>
</style>
