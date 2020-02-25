<template>
  <div id="app">

    <settings></settings>

<!--    <exporter :utterances="utterances"></exporter>-->
    <exporter v-model="utterances"></exporter>

    <importer></importer>

<!--    START NAVBAR-->

    <nav id="navigation" class="justify-content-start navbar sticky-top navbar-dark bg-dark">

      <a class="navbar-brand" href="#">
        <img src="/mbot.svg" width="30" height="30" class="d-inline-block align-top" alt="">
        MoM Bot
      </a>

      <div class="btn-group mr-auto ml-auto" role="group">
        <button v-on:click="utteranceMode = 'FULL'" type="button" :class="utteranceMode === 'FULL' ? 'btn btn-primary': 'btn btn-secondary'">{{ $t('all') }}</button>
        <button v-on:click="utteranceMode = 'MEDIUM'" type="button" :class="utteranceMode === 'MEDIUM' ? 'btn btn-primary': 'btn btn-secondary'">{{ $t('medium') }}</button>
        <button v-on:click="utteranceMode = 'SHORT'" type="button" :class="utteranceMode === 'SHORT' ? 'btn btn-primary': 'btn btn-secondary'">{{ $t('short') }}</button>
      </div>

      <div class="mr-auto ml-auto" style="min-width: 300px; text-align: center;">
        <control-bar></control-bar>
      </div>

      <div class="ml-auto form-inline my-2 my-lg-0">
        <button v-if="settings.controlButtonsStateDependent === 'true'" :disabled="meeting.status !== meeting.enum.BEFORE_MEETING" type="button" class="btn btn-labeled btn-light mr-sm-2" data-toggle="modal" data-target="#importModal">
          <span class="btn-label"><i class="fas fa-upload"></i></span>{{ $t('import') }}</button>
        <button v-if="settings.controlButtonsStateDependent === 'false'" type="button" class="btn btn-labeled btn-light mr-sm-2" data-toggle="modal" data-target="#importModal">
          <span class="btn-label"><i class="fas fa-upload"></i></span>{{ $t('import') }}</button>

        <button type="button" class="btn btn-labeled btn-light mr-sm-2" data-toggle="modal" data-target="#settingsModal">
          <span class="btn-label"><i class="fas fa-cogs"></i></span>{{ $t('settings') }}</button>

        <button v-if="settings.controlButtonsStateDependent === 'false'" v-on:click="sendFakeStream" type="button" class="btn btn-labeled btn-light mr-sm-2">
          <span class="btn-label"><i class="fas fa-print"></i></span>Fake</button>

        <button v-if="settings.controlButtonsStateDependent === 'true'" :disabled="meeting.status !== meeting.enum.AFTER_MEETING" v-on:click="sendOpenExporter" type="button" class="btn btn-labeled btn-light" data-toggle="modal" data-target="#exportModal">
          <span class="btn-label"><i class="fas fa-download"></i></span>{{ $t('export') }}</button>
        <button v-if="settings.controlButtonsStateDependent === 'false'"  v-on:click="sendOpenExporter" type="button" class="btn btn-labeled btn-light" data-toggle="modal" data-target="#exportModal">
          <span class="btn-label"><i class="fas fa-download"></i></span>{{ $t('export') }}</button>
        <!--        <input class="form-control mr-sm-2" type="search" placeholder="Suchen" aria-label="Search">-->
        <!--        <button class="btn btn-outline-success my-2 my-sm-0" type="submit"><i class="fas fa-search"></i></button>-->
      </div>

    </nav>
<!--    END NAVBAR-->

<!--    START CONTENT-->
    <div class="container-fluid">

      <div class="row">

<!--        START TIMELINE-->
        <timeline :utterances="utterances" :utteranceMode="utteranceMode" :utteranceIDMap="utteranceIDMap"></timeline>
<!--        END TIMELINE-->

<!--        START SIDEBAR-->
        <div class="col-4">
          <sidebar :speaker-name="settings.speakerName" :speaker-count="settings.speaker"></sidebar>
        </div>
<!--        END SIDEBAR-->
      </div>
    </div>
    <!--      END CONTENT-->

    <Footer></Footer>

  </div>
</template>

<script>
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { computeKeywords } from './helper/api';
import encodeHTML from './helper/htmlencoder';
import Store from './helper/Store';

import Footer from './components/Footer.vue';
import Sidebar from './components/Sidebar.vue';
import ControlBar from './components/ControlBar.vue';
import Settings from './components/Settings.vue';
import Exporter from './components/Exporter.vue';
import Importer from './components/Importer.vue';
import calculateKeywordnessTokenMap from './helper/keyword';
import Timeline from './components/Timeline.vue';

require('@/assets/css/main.css');
require('@fortawesome/fontawesome-free/css/all.css');

export default {
  name: 'app',
  components: {
    Timeline,
    Importer,
    Exporter,
    Settings,
    ControlBar,
    Sidebar,
    Footer,
  },
  created() {
    // Execute methods on create
    window.addEventListener('resize', this.onResize);
  },
  mounted() {
    // Listen to stream
    const source = new EventSource('http://localhost:5000/stream');
    source.onmessage = this.handleStream;
    source.onerror = () => {
      console.log('STREAM: Error Event!');
      this.sendStreamStatus('ERROR');
    };
    source.onopen = () => {
      console.log('STREAM: Open Event!');
      this.sendStreamStatus('OPEN');
    };

    // listen to vue events
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);
    this.$root.$on('onReset', this.onReset);
    this.$root.$on('onNextAgenda', this.onNextAgenda);
    this.$root.$on('onWheelScroll', this.onWheelScroll);

    // update height
    setTimeout(this.onResize(), 100);
  },
  data() {
    return {
      settings: {
        speaker: 4,
        speakerName: ['Sprecher 1', 'Sprecher 2', 'Sprecher 3', 'Sprecher 4'],
        selectedAvatar: ['avatar1.png', 'avatar1.png', 'avatar1.png', 'avatar1.png'],
        timelineSorting: 'DESC',
        timelineView: 'LINE',
        showConfidence: 'false',
        showKeywords: 'true',
        keywordColor: 'rgb(255, 255, 0)',
        range: 10,
        randomSpeaker: 'false',
        controlButtonsStateDependent: 'false',
      },
      utterances: [],
      utteranceIDMap: new Map(),
      startNewUtt: true,
      utteranceMode: 'FULL', // OR 'MEDIUM' OR 'SHORT'
      lastUtteranceType: 'completeUtterance',
      fakeUtteranceNum: 0,
      currentAgendaPoint: 0,
      fakeTime: 0,
      meeting: Store.meeting,
      newUtteranceID: 0,
      lastRealScroll: 0,
      lastFakeScroll: 0,
      scrollAnimationTime: 100,
      scrollIdleTime: 3000,
    };
  },
  methods: {
    sendOpenExporter() {
      this.$root.$emit('onOpenExporter');
    },
    sendStreamStatus(status) {
      this.$root.$emit('onStreamStatusChanged', status);
    },
    sendCompleteUtterance(fullutterance, utterance, speaker) {
      this.$root.$emit('onCompleteUtterance', fullutterance, utterance, speaker);
    },
    sendRecheckCurrentUtterance(forceUpdateIfTop) {
      this.$root.$emit('onRecheckCurrentUtteranceChange', forceUpdateIfTop);
    },
    sendFakeStream() {
      this.fakeTime += 60;
      const utterances = [
        '<UNK> Hallo zusammen jetzt wird spannend Wir haben noch zwei Wochen und dann stellen wir unser KI Produkt für E Bibliothek bei der Landesverwaltung vor',
        'Ich möchte noch einmal kurz für unsere',
        'Unser Ziel war es ja Machine Learning einzusetzen um Daten einfacher mit Hilfe eines Sprach Interface in der E Bibliothek ausfindig zu machen In den letzen Monaten haben wir einen technischen Prototyp fertiggestelt',
        'Ich möchte noch einmal kurz für unsere',
        'Da wir in zwei Wochen dem Kunden unseren Prototypen zeigen wollen und dem Kunden Sicherheit sehr wichtig ist haben wir heute zwei Experten zum Thema IT Sicherheit und Ethik eingeladen in der Hoffnung dass Sie uns nocheinmal auf die wichtigsten Punkte aufmerksam machen damit wir den Kunden von unserem Produkt überzeugen können',
        'Genau und deshalb überreiche ich jetzt das Wort direkt an Mark weiter der uns über IT Sicherheit berichten wird',
      ];
      const confidences = [
        Array(utterances[0].split(' ').length).fill(Math.random()),
        Array(utterances[1].split(' ').length).fill(Math.random()),
        Array(utterances[2].split(' ').length).fill(Math.random()),
        Array(utterances[3].split(' ').length).fill(Math.random()),
        Array(utterances[4].split(' ').length).fill(Math.random()),
        Array(utterances[5].split(' ').length).fill(Math.random()),
      ];
      // let randomUtterance = Math.floor(Math.random() * utterances.length);
      const randomUtterance = this.fakeUtteranceNum;
      this.fakeUtteranceNum += 1;
      if (this.fakeUtteranceNum >= utterances.length) this.fakeUtteranceNum = 0;
      const fakeEventData = {
        handle: 'completeUtterance',
        utterance: utterances[randomUtterance],
        time: this.fakeTime,
        confidences: confidences[randomUtterance],
        speaker: '01234560',
      };
      const fakeEvent = {
        data: JSON.stringify(fakeEventData),
      };
      this.handleStream(fakeEvent);
    },
    handleStream(event) {
      // console.log(event.data);
      const jsonEvent = JSON.parse(event.data);

      // UTTERANCE COMMANDS
      if ((jsonEvent.handle === 'partialUtterance' || jsonEvent.handle === 'completeUtterance')) {
        // check if utterance is empty
        if (jsonEvent.utterance.length > 0) {
          // PARTIAL UTTERANCE
          if (jsonEvent.handle === 'partialUtterance') {
            if (this.startNewUtt) {
              this.addOrReplaceUtterance(jsonEvent, false, true);
              this.startNewUtt = false;
            } else {
              this.addOrReplaceUtterance(jsonEvent, false, false);
            }

            // COMPLETE UTTERANCE
          } else if (jsonEvent.handle === 'completeUtterance' && this.lastUtteranceType === 'completeUtterance') {
            this.addOrReplaceUtterance(jsonEvent, true, true);
          } else if (jsonEvent.handle === 'completeUtterance') {
            this.addOrReplaceUtterance(jsonEvent, true, false);
            this.startNewUtt = true;
          }

          // scrolling
          if (Date.now() - this.lastRealScroll > this.scrollIdleTime) {
            window.requestAnimationFrame(() => {
              // scroll to bottom if order is ASC
              if (this.settings.timelineSorting === 'ASC') {
                this.getTimeline().stop().animate({ scrollTop: this.getTimeline()[0].scrollHeight }, 500);
              }
              // scroll to bottom if order is DESC
              if (this.settings.timelineSorting === 'DESC') {
                const timelinecontainer = $('.timelinecontainer');
                if (timelinecontainer[0] !== undefined) {
                  if (this.settings.timelineView === 'LINE') {
                    const timeline = $('#timeline');
                    const value = timelinecontainer[0].offsetHeight > timeline[0].offsetHeight ? timelinecontainer[0].offsetHeight - timeline[0].offsetHeight : 0;
                    timeline.stop().animate({ scrollTop: value }, 500);
                  }
                  if (this.settings.timelineView === 'LANES') {
                    const sticky = $('.stickytimelineheader');
                    const timeline = $('#timeline2');
                    const value = timelinecontainer[0].offsetHeight > (timeline[0].offsetHeight - sticky[0].offsetHeight) ? timelinecontainer[0].offsetHeight - (timeline[0].offsetHeight - sticky[0].offsetHeight) : 0;
                    timeline.stop().animate({ scrollTop: value }, 500);
                  }
                }
              }
              this.lastFakeScroll = Date.now();
            });
          }

          // set last utterance type
          this.lastUtteranceType = jsonEvent.handle;
        }

      // RESET COMMAND
      } else if (jsonEvent.handle === 'reset') {
        // this.doSomething();

      // STATUS COMMANDS
      } else if (jsonEvent.handle === 'asr_ready') {
        this.sendStreamStatus('NOT_DECODING');
      } else if (jsonEvent.handle === 'status') {
        if (jsonEvent.shutdown) {
          this.sendStreamStatus('SHUTDOWN');
        } else if (jsonEvent.isDecoding) {
          this.sendStreamStatus('DECODING');
        } else {
          this.sendStreamStatus('NOT_DECODING');
        }

      // UNKOWN COMMANDS
      } else {
        console.log('ERROR STREAM COMMAND UNKNOWN!!');
      }
    },
    getTimeline() {
      if (this.settings.timelineView === 'LINE') {
        return $('#timeline');
      }
      return $('#timeline2');
    },
    getTimeString(time) {
      const timeString = new Date(Math.round(time) * 1000).toISOString();
      const minutes = parseInt(timeString.substr(11, 2), 10) * 60 + parseInt(timeString.substr(14, 2), 10);
      const seconds = parseInt(timeString.substr(17, 2), 10);

      if (minutes > 9 && seconds > 9) {
        return `${minutes}:${seconds}`;
      }
      if (minutes > 9 && seconds <= 9) {
        return `${minutes}:0${seconds}`;
      }
      if (minutes <= 9 && seconds > 9) {
        return `0${minutes}:${seconds}`;
      }
      return `0${minutes}:0${seconds}`;
    },
    addOrReplaceUtterance(jsonEvent, completed, add) {
      let utterance;
      // confidences fix (fill confidences if text length > confidences length)
      let confidences;
      if (completed) {
        // eslint-disable-next-line prefer-destructuring
        confidences = jsonEvent.confidences;
        const text = encodeHTML(jsonEvent.utterance);
        const textLen = text.split(' ').length;
        if (confidences.length < textLen) {
          const filler = new Array(textLen - confidences.length).fill(1.0);
          confidences = confidences.concat(filler);
        }
      } else {
        confidences = [];
      }
      // add utterance
      if (add) {
        let spkr;
        if (this.settings.randomSpeaker === 'true') {
          spkr = Math.floor(Math.random() * this.settings.speaker);
        } else if (this.settings.randomSpeaker === 'false') {
          spkr = parseInt(jsonEvent.speaker.charAt(7), 10);
        }
        const timeString = this.getTimeString(jsonEvent.time);
        const text = encodeHTML(jsonEvent.utterance);
        utterance = {
          completed,
          text,
          speaker: spkr,
          time: jsonEvent.time,
          startTime: timeString,
          endTime: completed ? timeString : 0,
          id: this.newUtteranceID,
          keywordInfo: [],
          keywordnessTokenMap: new Map(),
          confidences,
          agenda: this.currentAgendaPoint,
        };
        this.newUtteranceID += 1;
      // replace utterance
      } else {
        const lastUtterance = this.utterances.pop();
        utterance = {
          completed: completed ? true : lastUtterance.completed,
          text: encodeHTML(jsonEvent.utterance),
          speaker: lastUtterance.speaker,
          time: lastUtterance.time,
          startTime: lastUtterance.startTime,
          endTime: completed ? this.getTimeString(jsonEvent.time) : 0,
          id: lastUtterance.id,
          keywordInfo: [],
          keywordnessTokenMap: new Map(),
          confidences,
          agenda: lastUtterance.agenda,
        };
      }
      this.utterances.push(utterance);
      this.utteranceIDMap.set(utterance.id, utterance);
      if (completed) {
        this.sendCompleteUtterance(utterance, jsonEvent.utterance, utterance.speaker);
        computeKeywords(utterance, this.$i18n.locale).then((keywords) => {
          utterance.keywords = keywords;
          const { keywordnessTokenMap, keywordInfo } = calculateKeywordnessTokenMap(utterance);
          utterance.keywordnessTokenMap = keywordnessTokenMap;
          utterance.keywordInfo = keywordInfo;
          // keywords have changed, therefore, check if new keywords should be sent
          this.sendRecheckCurrentUtterance(true);
        });
      }
    },
    onResize() {
      const navbarHeight = document.getElementById('navigation').clientHeight;
      const footerHeight = document.getElementById('footer').clientHeight;
      const headerHeight = document.getElementsByClassName('card-header')[0].clientHeight + 3;
      this.getTimeline().css({ height: `calc(${window.innerHeight - navbarHeight - footerHeight - headerHeight}px - 2em - 2px)` });
      // this.getTimeline().style.height = ;
    },
    onSettingsSaved(settings) {
      this.settings = settings;
    },
    onReset() {
      this.utterances = [];
      this.utteranceIDMap = new Map();
      this.startNewUtt = true;
      this.lastUtteranceType = 'completeUtterance';
      this.currentAgendaPoint = 0;
      this.fakeTime = 0;
      this.fakeUtteranceNum = 0;
      this.utterances = this.utterances.slice();
      this.newUtteranceID = 0;
      this.lastRealScroll = 0;
      this.lastFakeScroll = 0;
    },
    onNextAgenda() {
      if (this.currentAgendaPoint < this.settings.agendaPoints) {
        this.currentAgendaPoint += 1;
      }
    },
    onWheelScroll(time) {
      this.lastRealScroll = time;
    },
  },
};
</script>

<style>
  /*We host it ourself now!*/
  /*@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.css";*/

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }

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

  /*.row {*/
  /*  padding-top: 2em;*/
  /*  padding-bottom: 2em;*/
  /*}*/
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

  .stickytimelineheader {
    position: sticky;
    top: 0;
    background: white;
    z-index: 2;
  }

  .tlcircle {
    position: absolute;
    width: 58px;
    height: 58px;
    right: 0;
    background-color: white;
    border: 4px solid #28a745;
    border-radius: 50%;
    z-index: 3;
    text-align: center;
    padding-top: 13px;
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

  #timeline2 {
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
    width: 58px;
    height: 58px;
    right: -32px;
    background-color: white;
    border: 4px solid #28a745;
    top: 1px;
    border-radius: 50%;
    z-index: 1;
    text-align:center;
    padding-top:13px;
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
