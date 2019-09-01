<template>
  <div id="app">

    <!-- Modal -->
    <div class="modal fade" id="settingsModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header text-white bg-dark">
            <h4 class="modal-title" id="exampleModalLabel">Settings</h4>
            <button type="button" class="btn btn-danger my-2 my-sm-0" data-dismiss="modal" aria-label="Close">
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
                  <div class="form-check">
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
              </div>
<!--              END GENERAL SETTINGS -->

<!--              BEGIN SPEAKER SETTINGS-->
              <div class="tab-pane fade" id="speaker" role="tabpanel" aria-labelledby="speaker-tab">
                <div class="form-group px-2">
                  <label for="customRange1"># Speakers: {{speakers}}</label>
                  <input v-model="speakerCount" type="range" class="custom-range" min="1" max="4" id="customRange1">
                </div>
                <div v-for="(speaker, id) in speakers">
                  <div class="form-group px-2">
                    <hr>
                    <label :for="'speaker-' + speaker + '-name-input'">Speaker {{speaker}} Name:</label>
                    <input v-model="speakerName[id]" class="form-control" type="text" id="'speaker-' + speaker + '-name-input'">
                  </div>
                  <fieldset class="form-group px-2">
                    <label>Speaker {{speaker}} Avatar:</label><br>
                    <div v-for="avatar in avatars" class="form-check form-check-inline mb-2">
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
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary">Save changes</button>
          </div>
        </div>
      </div>
    </div>

<!--    START NAVBAR-->
    <nav id="navigation" class="navbar sticky-top navbar-dark bg-dark">
      <a class="navbar-brand" href="#">
        <img src="/mbot.svg" width="30" height="30" class="d-inline-block align-top" alt="">
        MeetingBot
      </a>

      <div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-secondary">Full</button>
        <button type="button" class="btn btn-secondary">Medium</button>
        <button type="button" class="btn btn-secondary">Short</button>
      </div>

      <div class="form-inline">
        <button type="button" class="btn btn-labeled btn-success mr-sm-2">
          <span class="btn-label"><i class="fas fa-play"></i></span>Play</button>
        <button type="button" class="btn btn-labeled btn-danger">
          <span class="btn-label"><i class="fas fa-pause"></i></span>Pause</button>
      </div>

      <div class="form-inline my-2 my-lg-0">
        <button type="button" class="btn btn-labeled btn-light mr-sm-2" data-toggle="modal" data-target="#settingsModal">
          <span class="btn-label"><i class="fas fa-cogs"></i></span>Settings</button>
        <button type="button" class="btn btn-labeled btn-light mr-sm-2">
          <span class="btn-label"><i class="fas fa-print"></i></span>Print</button>
        <button type="button" class="btn btn-labeled btn-light mr-sm-2">
          <span class="btn-label"><i class="fas fa-download"></i></span>Export</button>
        <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success my-2 my-sm-0" type="submit"><i class="fas fa-search"></i></button>
      </div>
    </nav>
<!--    END NAVBAR-->

<!--    START CONTENT-->
    <div class="container-fluid">

      <div class="row">
        <div class="col-8">
          <div>

            <div v-if="timelineView === 'LINE'" id="timeline" class="disable-scrollbars">
<!--              <TimelineBox name="Tim Fischer" time="15:01" message="Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam."></TimelineBox>-->
              <TimelineBox v-if="timelineSorting === 'DESC'" v-for="(utt, id) in reversedUtterances" :name="speakerName[utt.speaker]" :img="selectedAvatar[utt.speaker]" :time="utt.startTime" :message="utt.html" :key="'line-reversed-' + id"></TimelineBox>
              <TimelineBox v-if="timelineSorting === 'ASC'" v-for="(utt, id) in normalUtterances" :name="speakerName[utt.speaker]" :img="selectedAvatar[utt.speaker]" :time="utt.startTime" :message="utt.html" :key="'line-normal-' + id"></TimelineBox>
            </div>

            <div v-if="timelineView === 'LANES'" id="timeline" class="disable-scrollbars">
              <div class="d-flex">
                <div v-for="(n, id) in speakers" class="p-1 flex-even" style="border-bottom: 4px solid darkgrey;">
                  <div class="p-1" style="position:relative;">
                    <img :src="'/avatars/' + selectedAvatar[id]" style="position:absolute; margin:auto; left:0; right:0;" class="rounded-circle" alt="speaker-img" width="64" height="64">
                    <h6 style="margin-top:74px; text-align:center;">{{speakerName[id]}}</h6>
                  </div>
                </div>
                <div class="p-1" style="position:relative; width:66px;">
                  <div class="tlline"></div>
<!--                  <div class="tlcircle">15:00</div>-->
                </div>
              </div>
<!--              <TimelineRow message="Tim ist toll" speaker="1" speakers="4" time="15:00"></TimelineRow>-->
              <TimelineRow v-if="timelineSorting === 'DESC'" v-for="(utt, id) in reversedUtterances" :message="utt.html" :key="'lanes-reversed-' + id" :speaker="utt.speaker + 1" :speakers="speakers" :time="utt.startTime"></TimelineRow>
              <TimelineRow v-if="timelineSorting === 'ASC'" v-for="(utt, id) in normalUtterances" :message="utt.html" :key="'lanes-normal-' + id" :speaker="utt.speaker + 1" :speakers="speakers" :time="utt.startTime"></TimelineRow>
            </div>

          </div>
        </div>
        <div class="col-4">
          <div style="max-height:400px;">
            <bar-chart :speaker-names="speakerName" :speaker-count="speakerCount"></bar-chart>
          </div>
        </div>
      </div>
    </div>
    <!--      END CONTENT-->

    <Footer></Footer>

  </div>
</template>

<script>
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import TimelineBox from './components/TimelineBox';
import TimelineRow from './components/TimelineRow';
import SummarizationInput from './components/SummarizationInput.vue';
import NamedEntityVisualizer from './components/NamedEntityVisualizer.vue';
import SummarizationVisualizer from './components/SummarizationVisualizer.vue';
import KeywordVisualizer from './components/KeywordVisualizer';
import Footer from './components/Footer.vue';
import BarChart from './components/BarChart';

require('@/assets/css/main.css');

export default {
  name: 'app',
  components: {
    SummarizationInput,
    NamedEntityVisualizer,
    SummarizationVisualizer,
    KeywordVisualizer,
    Footer,
    TimelineBox,
    TimelineRow,
    BarChart,
  },
  created() {
    // Execute methods on create
    window.addEventListener('resize', this.onResize);
  },
  mounted() {
    // Listen to stream
    const source = new EventSource('http://localhost:5000/stream');
    source.onmessage = this.handleStream;

    // update height
    this.onResize();
  },
  data() {
    return {
      speakerCount: "4",
      speakerName: ["Speaker 1", "Speaker 2", "Speaker 3", "Speaker 4"],
      avatars: ["avatar1.png", "avatar2.png", "avatar3.png", "avatar4.png", "avatar5.png", "avatar6.png"],
      selectedAvatar: ["avatar1.png", "avatar1.png", "avatar1.png", "avatar1.png"],
      utterances: [],
      startNewUtt: true,
      timelineSorting: 'DESC',
      timelineView: 'LINE'
    };
  },
  computed: {
    speakers() {
      return parseInt(this.speakerCount);
    },
    normalUtterances() {
      return this.utterances.slice();
    },
    reversedUtterances() {
      return this.utterances.slice().reverse();
    },
  },
  methods: {
    sendCompleteUtterance(utterance, speaker) {
      this.$root.$emit('onCompleteUtterance', utterance, speaker);
    },
    handleStream(event) {
      console.log(event.data);
      const jsonEvent = JSON.parse(event.data);
      if (jsonEvent.handle === 'partialUtterance') {
        if (this.startNewUtt) {
          this.addUtterance(jsonEvent);
          this.startNewUtt = false;
        } else {
          this.replaceLastUtterance(jsonEvent, false);
        }
      } else if (jsonEvent.handle === 'completeUtterance') {
        this.replaceLastUtterance(jsonEvent, true);
        this.startNewUtt = true;
      } else if (jsonEvent.handle === 'reset') {
        // this.doSomething();
      }
    },
    renderUtterance(jsonEvent) {
      return `${jsonEvent.utterance}`;
    },
    renderUtteranceWithConfidence(jsonEvent) {
      let result = ``;
      const text = jsonEvent.utterance.split(' ');
      for (let i = 0; i < text.length; i++) {
        const word = text[i];
        const conf = jsonEvent.confidences[i];
        result += `<span style="color:rgba(0,0,0,${Math.max(conf * conf, 0.1)});">${word}</span> `;
      }
      return result.trim();
    },
    addUtterance(jsonEvent) {
      console.log("TIME" + jsonEvent.time);
      let utterance = {
        html: this.renderUtterance(jsonEvent),
        speaker: Math.floor(Math.random() * this.speakers), // later on: jsonEvent.speaker
        startTime: jsonEvent.time.toFixed(2),
        endTime: 0,
      };
      this.utterances.push(utterance);
    },
    replaceLastUtterance(jsonEvent, completedUtterance) {
      if (completedUtterance) {
        let lastUtterance = this.utterances.pop();
        let utterance = {
          html: this.renderUtteranceWithConfidence(jsonEvent),
          speaker: lastUtterance.speaker,
          startTime: lastUtterance.startTime,
          endTime: jsonEvent.time.toFixed(2),
        };
        this.utterances.push(utterance);
        this.sendCompleteUtterance(jsonEvent.utterance, utterance.speaker);
        console.log("COMPLETED UTTERANCE :D");
        console.log(this.utterances);
      } else {
        let lastUtterance = this.utterances.pop();
        let utterance = {
          html: this.renderUtterance(jsonEvent),
          speaker: lastUtterance.speaker,
          startTime: lastUtterance.startTime,
          endTime: 0,
        };
        this.utterances.push(utterance);
      }
    },
    onResize() {
      let navbarHeight = document.getElementById("navigation").clientHeight;
      let footerHeight = document.getElementById("footer").clientHeight;
      console.log("HEIGHTS:" + navbarHeight + " " + footerHeight);
      document.getElementById("timeline").style.height = "calc(" + (window.innerHeight - navbarHeight - footerHeight) + "px - 4em - 2px)";
    },
  },
};
</script>

<style>
  @import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.css";


  /*STYLE FOR SETTINGS IMAGES*/
  /* HIDE RADIO */
  .imgradio[type=radio] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* IMAGE STYLES */
  .imgradio[type=radio] + img {
    cursor: pointer;
  }

  /* CHECKED STYLES */
  .imgradio[type=radio]:checked + img {
    outline: 2px solid #f00;
  }
  /*END STYLE FOR SETTINGS IMAGES*/

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }
  .row {
    padding-top: 2em;
    padding-bottom: 2em;
  }
  #footer {
    width: 100%;
    height: 60px;
    line-height: 60px;
  }

  .btn-label {position: relative;left: -12px;display: inline-block;padding: 6px 12px;background: rgba(0,0,0,0.15);border-radius: 3px 0 0 3px;}
  .btn-labeled {padding-top: 0;padding-bottom: 0;}


  .flex-even {
    flex: 1;
  }

  .tlcircle {
    position: absolute;
    width: 50px;
    height: 50px;
    right: 0;
    background-color: white;
    border: 4px solid #28a745;
    border-radius: 50%;
    z-index: 1;
    text-align: center;
    padding-top: 10px;
    left: 0;
    margin: auto;
    top: 0;
    bottom: 0;
  }

  .tlline {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 6px;
    left: 0;
    right: 0;
    margin: 0 auto;
    background-color: lightgrey;
  }

  /* The actual timeline (the vertical ruler) */
  #timeline {
    position: relative;
    margin: 0 auto;
    overflow-y: scroll;
  }

  /* The actual timeline (the vertical ruler) */
  /*#timeline::after {*/
  /*  content: '';*/
  /*  position: absolute;*/
  /*  width: 6px;*/
  /*  background-color: lightgrey;*/
  /*  top: 0;*/
  /*  bottom: 0;*/
  /*  left: calc(100% - 36px);*/
  /*}*/

  /* Container around content */
  .tl-container {
    padding: 10px 40px 10px 10px;
    position: relative;
    background-color: inherit;
    width: calc(100% - 33px);
    border-right: 6px solid lightgrey;
  }

  /* Container around content */
  .tl-container2 {
    padding: 10px;
    position: relative;
    background-color: inherit;
  }

  /* The circles on the timeline */
  .timelinecircle {
    position: absolute;
    width: 50px;
    height: 50px;
    right: -28px;
    background-color: white;
    border: 4px solid #28a745;
    top: 5px;
    border-radius: 50%;
    z-index: 1;
    text-align:center;
    padding-top:10px;
  }

  /* Place the container to the left */
  .tl-left {
    left: 0;
  }

  /* Place the container to the left */
  .tl-left2 {
    left: 0;
  }

  /* Place the container to the right */
  .tl-right {
    left: 50%;
  }

  /* Add arrows to the left container (pointing right) */
  .tl-left::before {
    content: " ";
    height: 0;
    position: absolute;
    top: 22px;
    width: 0;
    z-index: 1;
    right: 30px;
    border: medium solid lightgrey;
    border-width: 10px 0 10px 10px;
    border-color: transparent transparent transparent lightgrey;
  }

  /* Add arrows to the left container (pointing right) */
  .tl-left2::before {
    content: " ";
    height: 0;
    position: absolute;
    /*top: 22px;*/
    width: 0;
    z-index: 1;
    right: 0px;
    border: medium solid lightgrey;
    border-width: 10px 0 10px 10px;
    border-color: transparent transparent transparent lightgrey;
    bottom: calc(50% - 10px)
  }

  .tl-left-line {
    position: absolute;
    z-index: 1;
    left: calc(100% + 2px);
    border: none;
    border-top: 3px dotted black;
    height: 50%;
    bottom: 1px;
  }

  /* Add arrows to the right container (pointing left) */
  .tl-right::before {
    content: " ";
    height: 0;
    position: absolute;
    top: 22px;
    width: 0;
    z-index: 1;
    left: 30px;
    border: medium solid white;
    border-width: 10px 10px 10px 0;
    border-color: transparent white transparent transparent;
  }

  /* Fix the circle for containers on the right side */
  .tl-right::after {
    left: -16px;
  }

  /* The actual content */
  .tl-content {
    padding: 10px;
    background-color: white;
    position: relative;
    border-radius: 6px;
    border: 4px solid lightgrey;
    box-shadow: black 1px 1px 6px 0;
  }

  /* Media queries - Responsive timeline on screens less than 600px wide */
  @media screen and (max-width: 600px) {
    /* Place the timelime to the left */
    .timeline::after {
      left: 31px;
    }

    /* Full-width containers */
    .tl-container {
      width: 100%;
      padding-left: 70px;
      padding-right: 25px;
    }

    /* Make sure that all arrows are pointing leftwards */
    .tl-container::before {
      left: 60px;
      border: medium solid white;
      border-width: 10px 10px 10px 0;
      border-color: transparent white transparent transparent;
    }

    /* Make sure that all arrows are pointing leftwards */
    .tl-container2::before {
      left: 60px;
      border: medium solid white;
      border-width: 10px 10px 10px 0;
      border-color: transparent white transparent transparent;
    }

    /* Make sure all circles are at the same spot */
    .tl-left::after, .tl-right::after {
      left: 15px;
    }

    /* Make all right containers behave like the left ones */
    .tl-right {
      left: 0%;
    }
  }
</style>
