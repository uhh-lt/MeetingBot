<template xmlns:height="http://www.w3.org/1999/xhtml">
  <footer v-on:click="fakeTick" id="footer" class="bg-light" style="position:relative;">
    <div class="progress absolute-progress">
      <div v-for="a in agenda" class="progress-bar progress-bar-padding progress-bar-bg progress-bar-font" :key="'bg'+a.id" :style="a.style" role="progressbar" aria-valuemin="0" aria-valuemax="100">{{a.title}}</div>
    </div>
    <div class="progress absolute-progress-small" style="background-color: transparent !important;">
      <div v-for="a in finishedOrActiveAgendaPoints"
           :style="'width:'+calcAgendaWidth(a)+'%;'"
           :class="{'finished': a.status === 'finished', 'active': a.status === 'active', 'error': a.status ==='active' && currentTime >= a.planned, 'warning': a.status ==='active' && currentTime >= (a.planned - warnTime)}"
           :key="a.id"
           class="progress-bar progress-bar-padding progress-bar-font"  role="progressbar" aria-valuemin="0" aria-valuemax="100">{{a.title}}</div>
    </div>
    <div class="progress absolute-progress" style="
    border-radius: 0px;
    border-left: 1px solid black;
    border-right: 1px solid black;
    border-bottom: 1px solid black;
    background-color: transparent;">
      <div v-for="index in totalTime" class="progress-bar ruler" :style="'width:'+(100/totalTime)+'%'" :key="'ruler'+index" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
    <div style="
    position: absolute;
    top: 2px;
    left: 20px;
    height: 20px;
    line-height: 20px;
    font-size: 20px;">
      0:00
    </div>
    <div style="
    position: absolute;
    top: 2px;
    right: 20px;
    height: 20px;
    line-height: 20px;
    font-size: 20px;">
      {{totalTime}}:00
    </div>
  </footer>
</template>

<script>
/**
 * This component visualizes the elapsed time per agenda point like a loading bar.
 * Every agenda point is characterized by a title and planned time.
 * The 'loading bar' of each agenda point is colored differently depending on some conditions:
 * - if the current time is less then the planned time everything is fine
 * - if the current time is close to the planned time the loading bar is colored with a warning color
 * - if the current time is larger then the planned time, the loading bar is colored with an error color
 *
 */
export default {
  name: 'Footer',
  data() {
    return {
      currentAgendaPoint: 0,
      agenda: [{
        title: 'Punkt 1',
        id: 'a1',
        status: 'active',
        start: 0,
        end: -1,
        planned: 10,
        style: 'width: 25%',
      }, {
        title: 'Punkt 2',
        id: 'a2',
        status: 'pending',
        start: -1,
        end: -1,
        planned: 20,
        style: 'width: 25%',
      }, {
        title: 'Punkt 3',
        id: 'a3',
        status: 'pending',
        start: -1,
        end: -1,
        planned: 30,
        style: 'width: 25%',
      }, {
        title: 'Punkt 4',
        id: 'a4',
        status: 'pending',
        start: -1,
        end: -1,
        planned: 40,
        style: 'width: 25%',
      }],
      currentTime: 0,
      usedTime: 0,
      warnTime: 5,
    };
  },
  mounted() {
    // Listen to events from other components
    this.$root.$on('onAgendaChanged', this.onAgendaChanged);
    this.$root.$on('onNextAgenda', this.onNextAgenda);
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);
    this.$root.$on('onCompleteUtterance', this.onCompleteUtterance);
    this.$root.$on('onReset', this.onReset);
  },
  computed: {
    startTime() {
      return this.agenda[this.agenda.length - 1].start;
    },
    totalTime() {
      return this.agenda[this.agenda.length - 1].planned;
    },
    finishedOrActiveAgendaPoints() {
      return this.agenda.filter(agenda => agenda.status === 'finished' || agenda.status === 'active');
    },
  },
  methods: {
    /**
     * This function updates the rendered width of the agenda points. The width is dependent on the time.
     */
    calcAgendaWidth(agenda) {
      if (agenda.end === -1) {
        return ((this.currentTime - agenda.start) / this.totalTime) * 100;
      }
      return ((agenda.end - agenda.start) / this.totalTime) * 100;
    },
    /**
     * This method is only used for testing. With this you can manually manipulates the time, so that you can test if everything works.
     */
    fakeTick() {
      this.currentTime += 1;
      if (this.currentTime >= this.totalTime) {
        this.currentTime = this.totalTime;
      }
    },
    // BEGIN methods that react to events
    /**
     * This function updates the time (based on the complete utterances).
     */
    onCompleteUtterance(utterance) {
      this.currentTime = utterance.time / 60;
      if (this.currentTime >= this.totalTime) {
        this.currentTime = this.totalTime;
      }
    },
    /**
     * This function updates the agenda, so that the old agenda point's status is set to finished, and the new agenda point is set to active.
     */
    onNextAgenda() {
      const oldAgenda = this.agenda[this.currentAgendaPoint];
      oldAgenda.end = this.currentTime;
      oldAgenda.status = 'finished';
      this.currentAgendaPoint += 1;
      if (this.currentAgendaPoint < this.agenda.length) {
        const newAgenda = this.agenda[this.currentAgendaPoint];
        newAgenda.start = this.currentTime;
        newAgenda.status = 'active';
        this.usedTime = oldAgenda.end;
        this.agenda.slice();
      }
    },
    onAgendaChanged(newAgenda) {
      console.log('AGENDA HAS CHANGED: ');
      console.log(newAgenda);
    },
    onReset() {
      this.currentAgendaPoint = 0;
      this.agenda = [{
        title: 'Punkt 1',
        id: 'a1',
        status: 'active',
        start: 0,
        end: -1,
        planned: 10,
        style: 'width: 25%',
      }, {
        title: 'Punkt 2',
        id: 'a2',
        status: 'pending',
        start: -1,
        end: -1,
        planned: 20,
        style: 'width: 25%',
      }, {
        title: 'Punkt 3',
        id: 'a3',
        status: 'pending',
        start: -1,
        end: -1,
        planned: 30,
        style: 'width: 25%',
      }, {
        title: 'Punkt 4',
        id: 'a4',
        status: 'pending',
        start: -1,
        end: -1,
        planned: 40,
        style: 'width: 25%',
      }];
      this.currentTime = 0;
      this.usedTime = 0;
    },
    /**
     * This function is called when the settings are saved. This function creates a new agenda based on the settings.
     * @param settings new settings saved by the user
     */
    onSettingsSaved(settings) {
      const totalAgendaTime = settings.agendaTime.slice(0, settings.agendaPoints).map(x => parseInt(x, 10)).reduce((a, b) => a + b, 0);
      const newAgenda = [];
      let plannedSum = 0;
      for (let i = 0; i < settings.agendaPoints; i += 1) {
        const agendaTime = parseInt(settings.agendaTime[i], 10);

        let status = '';
        let start = -1;
        let end = -1;
        if (i < this.agenda.length) {
          // eslint-disable-next-line prefer-destructuring
          start = this.agenda[i].start;
          // eslint-disable-next-line prefer-destructuring
          end = this.agenda[i].end;
        }
        if (i === this.currentAgendaPoint) {
          status = 'active';
          end = -1;
        } else if (i < this.currentAgendaPoint) {
          status = 'finished';
        } else {
          status = 'pending';
          start = -1;
          end = -1;
        }

        const agenda = {
          title: settings.agendaTitel[i],
          id: `a${i}`,
          status,
          start,
          end,
          planned: plannedSum + agendaTime,
          style: `width: ${(agendaTime / totalAgendaTime) * 100}%`,
        };
        plannedSum += agendaTime;
        newAgenda.push(agenda);
      }
      this.agenda = newAgenda;
      this.agenda.slice();
      this.agendaWarnTime = parseInt(settings.agendaWarnTime, 10);
    },
    // END methods that react to events
  },
};
</script>

<style scoped>
  .absolute-progress {
    height: 40px;
    position: absolute;
    left: 15px;
    right: 15px;
    top: 10px;
    bottom: 10px;
  }
  .absolute-progress-small {
    height: 30px;
    position: absolute;
    left: 15px;
    right: 15px;
    top: 15px;
    bottom: 15px;
  }
  .progress-bar-padding {
    padding-left:5px;
    padding-right:5px;
  }
  .progress-bar-font {
    font-weight:500;
    font-size: 1.25em;
    color: #212529;
    overflow: hidden;
  }
  .progress-bar-bg:nth-child(even) {
    background-color: #007bff10;
  }
  .progress-bar-bg:nth-child(odd) {
    background-color: #007bff30;
  }
  .finished:nth-child(even) {
    background-color: #6c757d;
  }
  .finished:nth-child(odd) {
    background-color: #5a6268;
  }
  .active {
    background-color: #28a745;
  }
  .warning {
    background-color: #ffc107;
  }
  .error {
    background-color: #dc3545;
  }

  .ruler {
    background-color: transparent !important;
  }
  .ruler:nth-child(n) {
    border-right: 1px solid black;
    height: 10px;
    margin-top: 30px;
  }
  .ruler:nth-child(5n) {
    border-right: 1px solid black;
    height: 20px;
    margin-top: 20px;
  }
  .ruler:nth-child(10n) {
    border-right: 1px solid black;
    height: 30px;
    margin-top: 10px;
  }
  .ruler:last-child {
    border:none;
  }
</style>
