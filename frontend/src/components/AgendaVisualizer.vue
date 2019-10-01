<template>
  <div style="height: 100%;" class="row">
    <div class="col-8 disable-scrollbars" style="height: 100%; overflow-y: scroll;" id="agenda-list">
      <ul class="list-group">
        <li v-for="(title, id) in agendaTitles" v-if="id < agendaPoints" :key="'agendavisualizer-title-'+id" :id="'agendavisualizer-title-'+id" :class="{active: id === currentAgendaPoint, disabled: id < currentAgendaPoint}" class="list-group-item">
          {{title}} <span style="text-align:right;">({{agendaTime[id]}} min)</span>
        </li>
      </ul>
    </div>
    <div class="col-4" style="text-align: right;">
      <button v-on:click="sendNextAgendaPoint" type="button" class="btn btn-labeled btn-primary">
        <span class="btn-label"><i class="fas fa-forward"></i></span>Weiter</button>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';

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
  mounted() {
    // listen to events
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);
    this.$root.$on('onReset', this.onReset);
  },
  methods: {
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
    sendNextAgendaPoint() {
      if (this.currentAgendaPoint < this.agendaPoints) {
        this.currentAgendaPoint += 1;
      }
      const id = `#agendavisualizer-title-${this.currentAgendaPoint}`;
      const element = $(id);
      if (element[0] !== undefined) {
        $('#agenda-list').scrollTop(element[0].offsetTop);
      }
      this.$root.$emit('onNextAgenda');
    },
  },
};
</script>

<style scoped>
</style>
