<template>
  <div id="app">

    <settings></settings>

    <exporter :utterances="utterances"></exporter>

    <importer></importer>

<!--    START NAVBAR-->

    <nav id="navigation" class="justify-content-start navbar sticky-top navbar-dark bg-dark">

      <a class="navbar-brand" href="#">
        <img src="/mbot.svg" width="30" height="30" class="d-inline-block align-top" alt="">
        MoM Bot
      </a>

      <div class="btn-group mr-auto ml-auto" role="group">
        <button v-on:click="utteranceMode = 'FULL'" type="button" :class="utteranceMode === 'FULL' ? 'btn btn-primary': 'btn btn-secondary'">Alles</button>
        <button v-on:click="utteranceMode = 'MEDIUM'" type="button" :class="utteranceMode === 'MEDIUM' ? 'btn btn-primary': 'btn btn-secondary'">Mittel</button>
        <button v-on:click="utteranceMode = 'SHORT'" type="button" :class="utteranceMode === 'SHORT' ? 'btn btn-primary': 'btn btn-secondary'">Kurz</button>
      </div>

      <div class="mr-auto ml-auto" style="min-width: 300px; text-align: center;">
        <control-bar></control-bar>
      </div>

      <div class="ml-auto form-inline my-2 my-lg-0">
        <button v-if="settings.controlButtonsStateDependent === 'true'" :disabled="meeting.status !== meeting.enum.BEFORE_MEETING" type="button" class="btn btn-labeled btn-light mr-sm-2" data-toggle="modal" data-target="#importModal">
          <span class="btn-label"><i class="fas fa-upload"></i></span>Importieren</button>
        <button v-if="settings.controlButtonsStateDependent === 'false'" type="button" class="btn btn-labeled btn-light mr-sm-2" data-toggle="modal" data-target="#importModal">
          <span class="btn-label"><i class="fas fa-upload"></i></span>Importieren</button>
        <button type="button" class="btn btn-labeled btn-light mr-sm-2" data-toggle="modal" data-target="#settingsModal">
          <span class="btn-label"><i class="fas fa-cogs"></i></span>Einstellungen</button>
        <button v-if="settings.controlButtonsStateDependent === 'false'" v-on:click="sendFakeStream" type="button" class="btn btn-labeled btn-light mr-sm-2">
            <span class="btn-label"><i class="fas fa-print"></i></span>Fake</button>
        <button v-if="settings.controlButtonsStateDependent === 'true'" :disabled="meeting.status !== meeting.enum.AFTER_MEETING" v-on:click="sendOpenExporter" type="button" class="btn btn-labeled btn-light" data-toggle="modal" data-target="#exportModal">
          <span class="btn-label"><i class="fas fa-download"></i></span>Exportieren</button>
        <button v-if="settings.controlButtonsStateDependent === 'false'"  v-on:click="sendOpenExporter" type="button" class="btn btn-labeled btn-light" data-toggle="modal" data-target="#exportModal">
          <span class="btn-label"><i class="fas fa-download"></i></span>Exportieren</button>
        <!--        <input class="form-control mr-sm-2" type="search" placeholder="Suchen" aria-label="Search">-->
        <!--        <button class="btn btn-outline-success my-2 my-sm-0" type="submit"><i class="fas fa-search"></i></button>-->
      </div>

    </nav>
<!--    END NAVBAR-->

<!--    START CONTENT-->
    <div class="container-fluid">

      <div class="row">

<!--        START TIMELINE-->
        <div class="col-8">

          <div class="card" style="margin-top: 1em; margin-bottom:1em;">
            <h5 class="card-header" style="height: 50px;"><span>Gesprächs-Verlauf</span></h5>
            <div class="card-body" style="padding:0;">

              <div v-if="settings.timelineView === 'LINE'" id="timeline" ref="timelineRef" class="disable-scrollbars">
                <template v-if="settings.timelineSorting === 'DESC'">
                  <TimelineBox v-for="utt in reversedUtterances" :mode="utteranceMode" :show-confidence="settings.showConfidence" :show-keywords="settings.showKeywords" :keyword-color="settings.keywordColor" :utterance="utt" :name="settings.speakerName[utt[0].speaker]" :img="settings.selectedAvatar[utt[0].speaker]" :key="'line-reversed-' + utt[0].id"></TimelineBox>
                </template>
                <template v-if="settings.timelineSorting === 'ASC'">
                  <TimelineBox v-for="utt in normalUtterances" :mode="utteranceMode" :show-confidence="settings.showConfidence" :show-keywords="settings.showKeywords" :keyword-color="settings.keywordColor" :utterance="utt" :name="settings.speakerName[utt[0].speaker]" :img="settings.selectedAvatar[utt[0].speaker]" :key="'line-normal-' + utt[0].id"></TimelineBox>
                </template>
              </div>

              <div v-if="settings.timelineView === 'LANES'" id="timeline" ref="timelineRef" class="disable-scrollbars">
                <div class="d-flex stickytimelineheader">
                  <div v-for="(n, id) in settings.speaker" :key="'speaker-'+id" class="p-1 flex-even bg-light" style="border-bottom: 1px solid rgba(0,0,0,.125);">
                    <div class="p-1" style="position:relative;">
                      <img :src="'/avatars/' + settings.selectedAvatar[id]" style="position:absolute; margin:auto; left:0; right:0;" class="rounded-circle" alt="speaker-img" width="64" height="64">
                      <h6 style="margin-top:74px; text-align:center;">{{settings.speakerName[id]}}</h6>
                    </div>
                  </div>
                  <div class="p-1 bg-light" style="position:relative; width:66px; border-bottom: 1px solid rgba(0,0,0,.125);">
                    <div class="tlline"></div>
                  </div>
                </div>
                <template v-if="settings.timelineSorting === 'DESC'">
                  <TimelineRow  v-for="utt in reversedUtterances" :speakers="settings.speaker" :mode="utteranceMode" :show-confidence="settings.showConfidence" :show-keywords="settings.showKeywords" :keyword-color="settings.keywordColor" :utterance="utt" :name="settings.speakerName[utt[0].speaker]" :key="'lanes-reversed-' + utt[0].id"></TimelineRow>
                </template>
                <template v-if="settings.timelineSorting === 'ASC'">
                  <TimelineRow  v-for="utt in normalUtterances" :speakers="settings.speaker" :mode="utteranceMode" :show-confidence="settings.showConfidence" :show-keywords="settings.showKeywords" :keyword-color="settings.keywordColor" :utterance="utt" :name="settings.speakerName[utt[0].speaker]" :key="'lanes-reversed-' + utt[0].id"></TimelineRow>
                </template>
              </div>

            </div>
          </div>
        </div>
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

import TimelineBox from './components/TimelineBox.vue';
import TimelineRow from './components/TimelineRow.vue';
import Footer from './components/Footer.vue';
import Sidebar from './components/Sidebar.vue';
import ControlBar from './components/ControlBar.vue';
import Settings from './components/Settings.vue';
import Exporter from './components/Exporter.vue';
import Importer from './components/Importer.vue';

require('@/assets/css/main.css');

export default {
  name: 'app',
  components: {
    Importer,
    Exporter,
    Settings,
    ControlBar,
    Sidebar,
    Footer,
    TimelineBox,
    TimelineRow,
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

    // update height
    setTimeout(this.onResize(), 100);

    // listen to events
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);
    this.$root.$on('onReset', this.onReset);
    this.$root.$on('onNextAgenda', this.onNextAgenda);

    // document.getElementById("timelineContainer").addEventListener('scroll', this.onScroll);

    // this.$refs.timelineContainer.addEventListener('scroll', this.onScroll);
    this.$refs.timelineRef.addEventListener('scroll', () => {
      this.onScroll(false);
    });

    console.log(this.$refs);
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
        range: 5,
        randomSpeaker: 'false',
        controlButtonsStateDependent: 'false',
      },
      utterances: [],
      startNewUtt: true,
      utteranceMode: 'FULL', // OR 'MEDIUM' OR 'SHORT'
      lastUtteranceType: 'completeUtterance',
      fakeUtteranceNum: 0,
      currentAgendaPoint: 0,
      fakeTime: 0,
      meeting: Store.meeting,
      currentUtterance: -1,
      currentBubble: -1,
    };
  },
  computed: {
    normalUtterances() {
      return this.calcGroupedUtterances();
    },
    reversedUtterances() {
      return this.calcGroupedUtterances().reverse();
    },
  },
  watch: {
    timelineSorting(newValue) {
      // scroll to bot if timeline sorting changed to ASC
      if (newValue === 'ASC') $('#timeline').scrollTop($('#timeline')[0].scrollHeight);
    },
  },
  methods: {
    onScroll(forceUpdateIfTop) {
      // force update if scroll is top
      if (forceUpdateIfTop && this.$refs.timelineRef.scrollTop === 0) {
        // force update by setting this.currentUtterance to -1
        this.currentUtterance = -1;
        this.currentBubble = -1;
      }

      const middle = this.$refs.timelineRef.scrollTop + this.$refs.timelineRef.clientHeight / 2 - 100;
      const allContainers = this.$refs.timelineRef.getElementsByClassName('timelinecontainer');

      let container;
      let nearestContainer;
      let distance = -1;
      let minDistance = 10000000;
      for (let id = 0; id < allContainers.length; id += 1) {
        container = allContainers[id];
        container.getElementsByClassName('timelinecontainer2')[0].style.borderColor = '';
        distance = Math.abs(container.offsetTop - middle);
        if (distance < minDistance) {
          minDistance = distance;
          nearestContainer = id;
        }
      }

      allContainers[nearestContainer].getElementsByClassName('timelinecontainer2')[0].style.borderColor = 'grey';

      // BASED ON BUBBLES
      if (this.currentBubble !== nearestContainer) {
        this.currentBubble = nearestContainer;
        console.log('NEW BUBBLE!');

        // collect keywords from utterances around current utterance
        const keywordInfos = [];
        const minRange = Math.max(this.currentBubble - this.settings.range, 0);
        const maxRange = Math.min(this.currentBubble + this.settings.range, allContainers.length - 1);
        console.log(`Min${minRange} Max${maxRange}`);
        for (let i = minRange; i <= maxRange; i += 1) {
          const utteranceID = parseInt(allContainers[i].dataset.utteranceid, 10);
          const numUtterances = parseInt(allContainers[i].dataset.numutterances, 10);

          for (let j = utteranceID; j < utteranceID + numUtterances; j += 1) {
            const { keywordInfo } = this.utterances[j];
            // eslint-disable-next-line no-param-reassign
            keywordInfo.forEach((info) => { info.age = i; });
            keywordInfos.push(keywordInfo);
          }
        }
        this.sendOnCurrentUtteranceChanged(keywordInfos, minRange, this.currentBubble + this.settings.range);
      }
      // BASED ON UTTERANCES
      // const newUtterance = parseInt(allContainers[nearestContainer].dataset.utteranceid, 10);
      // const inBubbleUtterances = parseInt(allContainers[nearestContainer].dataset.numutterances, 10) - 1;
      // if (this.currentUtterance !== newUtterance) {
      //   this.currentUtterance = newUtterance;
      //   console.log('NEW BUBBLE!');
      //
      //   // collect keywords from utterances around current utterance
      //   let keywordInfos = [];
      //   const minRange = Math.max(this.currentUtterance - this.settings.range, 0);
      //   const maxRange = Math.min(this.currentUtterance + this.settings.range + inBubbleUtterances, this.utterances.length - 1);
      //   for (let i = minRange; i <= maxRange; i += 1) {
      //     const utt = this.utterances[i];
      //     keywordInfos = keywordInfos.concat(utt.keywordInfo);
      //   }
      //   this.sendOnCurrentUtteranceChanged(keywordInfos);
      // }
    },
    sendOpenExporter() {
      this.$root.$emit('onOpenExporter');
    },
    onNextAgenda() {
      if (this.currentAgendaPoint < this.settings.agendaPoints) {
        this.currentAgendaPoint += 1;
      }
    },
    sendStreamStatus(status) {
      this.$root.$emit('onStreamStatusChanged', status);
    },
    sendCompleteUtterance(fullutterance, utterance, speaker) {
      this.$root.$emit('onCompleteUtterance', fullutterance, utterance, speaker);
    },
    sendKeywords(keywords) {
      this.$root.$emit('onNewKeywords', keywords);
    },
    sendOnCurrentUtteranceChanged(keywords, minRange, maxRange) {
      this.$root.$emit('onCurrentUtteranceChanged', keywords, minRange, maxRange);
    },
    onReset() {
      this.utterances = [];
      this.startNewUtt = true;
      this.lastUtteranceType = 'completeUtterance';
      this.currentAgendaPoint = 0;
      this.fakeTime = 0;
      this.fakeUtteranceNum = 0;
    },
    calcGroupedUtterances() {
      const groupedUtterances = [];
      let lastSpeaker = -1;
      this.utterances.forEach((utterance) => {
        // same speaker => add to utterance group
        if (utterance.speaker === lastSpeaker) {
          const utteranceGroup = groupedUtterances.pop();
          utteranceGroup.push(utterance);
          groupedUtterances.push(utteranceGroup);

        // other speaker => create new utterance group
        } else {
          groupedUtterances.push([utterance]);
        }
        // update last speaker
        lastSpeaker = utterance.speaker;
      });
      return groupedUtterances;
    },
    sendFakeStream() {
      this.fakeTime += 60;
      const utterances = [
        'Hallo zusammen jetzt wird spannend Wir haben noch zwei Wochen und dann stellen wir unser KI Produkt für E Bibliothek bei der Landesverwaltung vor',
        'Ich möchte noch einmal kurz für unsere Gäste wiederholen',
        'Unser Ziel war es ja Machine Learning einzusetzen um Daten einfacher mit Hilfe eines Sprach Interface in der E Bibliothek ausfindig zu machen In den letzen Monaten haben wir einen technischen Prototyp fertiggestelt',
        'Da wir in zwei Wochen dem Kunden unseren Prototypen zeigen wollen und dem Kunden Sicherheit sehr wichtig ist haben wir heute zwei Experten zum Thema IT Sicherheit und Ethik eingeladen in der Hoffnung dass Sie uns nocheinmal auf die wichtigsten Punkte aufmerksam machen damit wir den Kunden von unserem Produkt überzeugen können',
        'Genau und deshalb überreiche ich jetzt das Wort direkt an Mark weiter der uns über IT Sicherheit berichten wird',
      ];
      const confidences = [
        Array(utterances[0].split(' ').length).fill(Math.random()),
        Array(utterances[1].split(' ').length).fill(Math.random()),
        Array(utterances[2].split(' ').length).fill(Math.random()),
        Array(utterances[3].split(' ').length).fill(Math.random()),
        Array(utterances[4].split(' ').length).fill(Math.random()),
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
              this.addUtterance(jsonEvent, false);
              this.startNewUtt = false;
            } else {
              this.replaceLastUtterance(jsonEvent, false);
            }

            // COMPLETE UTTERANCE
          } else if (jsonEvent.handle === 'completeUtterance' && this.lastUtteranceType === 'completeUtterance') {
            this.addUtterance(jsonEvent, true);
          } else if (jsonEvent.handle === 'completeUtterance') {
            this.replaceLastUtterance(jsonEvent, true);
            this.startNewUtt = true;
          }

          // scroll to bottom if order is DESC
          if (this.timelineSorting === 'ASC') {
            $('#timeline')
              .scrollTop($('#timeline')[0].scrollHeight);
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
    addUtterance(jsonEvent, completed) {
      let utterance;
      let spkr;
      if (this.settings.randomSpeaker === 'true') {
        spkr = Math.floor(Math.random() * this.settings.speaker);
      } else if (this.settings.randomSpeaker === 'false') {
        spkr = parseInt(jsonEvent.speaker.charAt(7), 10);
      }
      if (completed) {
        utterance = {
          completed,
          text: encodeHTML(jsonEvent.utterance),
          speaker: spkr,
          time: jsonEvent.time,
          startTime: new Date(Math.round(jsonEvent.time) * 1000).toISOString().substr(14, 5),
          endTime: new Date(Math.round(jsonEvent.time) * 1000).toISOString().substr(14, 5),
          id: this.utterances.length,
          keywordInfo: [],
          keywordnessTokenMap: new Map(),
          confidences: jsonEvent.confidences,
          agenda: this.currentAgendaPoint,
        };
        this.utterances.push(utterance);
        this.sendCompleteUtterance(utterance, jsonEvent.utterance, utterance.speaker);
        computeKeywords(utterance).then((keywords) => {
          const { keywordnessTokenMap, keywordInfo } = this.calculateKeywordnessTokenMap(utterance, keywords);
          utterance.keywordnessTokenMap = keywordnessTokenMap;
          utterance.keywordInfo = keywordInfo;
          this.sendKeywords(keywordInfo);
          this.onScroll(true);
        });
      } else {
        utterance = {
          completed,
          text: encodeHTML(jsonEvent.utterance),
          speaker: spkr,
          time: jsonEvent.time,
          startTime: new Date(Math.round(jsonEvent.time) * 1000).toISOString().substr(14, 5),
          endTime: 0,
          id: this.utterances.length,
          keywordInfo: [],
          keywordnessTokenMap: new Map(),
          confidences: [],
          agenda: this.currentAgendaPoint,
        };
        this.utterances.push(utterance);
      }
    },
    replaceLastUtterance(jsonEvent, completedUtterance) {
      if (completedUtterance) {
        const lastUtterance = this.utterances.pop();
        const utterance = {
          completed: true,
          text: encodeHTML(jsonEvent.utterance),
          speaker: lastUtterance.speaker,
          time: lastUtterance.time,
          startTime: lastUtterance.startTime,
          endTime: new Date(Math.round(jsonEvent.time) * 1000).toISOString().substr(14, 5),
          id: lastUtterance.id,
          keywordInfo: [],
          keywordnessTokenMap: new Map(),
          confidences: jsonEvent.confidences,
          agenda: lastUtterance.agenda,
        };
        this.utterances.push(utterance);
        this.sendCompleteUtterance(utterance, jsonEvent.utterance, utterance.speaker);
        computeKeywords(utterance).then((keywords) => {
          const { keywordnessTokenMap, keywordInfo } = this.calculateKeywordnessTokenMap(utterance, keywords);
          utterance.keywordnessTokenMap = keywordnessTokenMap;
          utterance.keywordInfo = keywordInfo;
          this.sendKeywords(keywordInfo);
          this.onScroll(true);
        });
      } else {
        const lastUtterance = this.utterances.pop();
        const utterance = {
          completed: lastUtterance.completed,
          text: encodeHTML(jsonEvent.utterance),
          speaker: lastUtterance.speaker,
          time: lastUtterance.time,
          startTime: lastUtterance.startTime,
          endTime: 0,
          id: lastUtterance.id,
          keywordInfo: [],
          keywordnessTokenMap: new Map(),
          confidences: [],
          agenda: lastUtterance.agenda,
        };
        this.utterances.push(utterance);
      }
    },
    onResize() {
      const navbarHeight = document.getElementById('navigation').clientHeight;
      const footerHeight = document.getElementById('footer').clientHeight;
      const headerHeight = document.getElementsByClassName('card-header')[0].clientHeight + 3;
      document.getElementById('timeline').style.height = `calc(${window.innerHeight - navbarHeight - footerHeight - headerHeight}px - 2em - 2px)`;
    },
    onSettingsSaved(settings) {
      console.log('Settings saved!');
      this.settings = settings;
    },
    calculateKeywordnessTokenMap(utterance, keywords) {
      const { confidences } = utterance;
      const { text } = utterance;
      const tokens = utterance.text.split(' ');

      console.log('TL_UTT Text');
      console.log(text);
      console.log('TL_UTT Tokens');
      console.log(tokens);
      console.log('TL_UTT Keywords');
      console.log(keywords);
      console.log('TL_UTT Confidences');
      console.log(confidences);

      // map that stores a keywordScore for each array of involved tokenIndices
      // [
      //   { involved: [1, 2, 3], score: 10, word: "tim ist toll"},
      //   { involved: [6, 7, 8], score: 10, word: "tim ist super"},
      // ]
      let keywordInfo = [];

      // TOKENS:       0   1   2
      // CHAR OFFSET: 0123456789
      // STRING:      Tim ist to
      let offset = 0;
      const characterOffset2TokenID = new Map();
      // build characterOffset2TokenMap
      for (let i = 0; i < tokens.length; i += 1) {
        const token = tokens[i];
        for (let j = 0; j < token.length; j += 1) {
          characterOffset2TokenID.set(offset, i);
          offset += 1;
        }
        offset += 1;
      }
      console.log('TL_UTT Character2TokenID');
      console.log(characterOffset2TokenID);

      // perform regex search for each keyword in the list
      keywords.forEach((keyword) => {
        const numWords = keyword.word.split(' ').length;
        let match;
        const re = new RegExp(`\\b${keyword.word}\\b`, 'gi');
        match = re.exec(text);
        while (match != null) {
          // using match.index to find token index
          const tokenIndex = characterOffset2TokenID.get(match.index);

          // calculate average confidence for the keyword phrase
          // also calculated an array of involved tokenIds in the keyword phrase
          let avgConfidence = 0;
          const confis = [];
          const involvedTokenIDs = [];
          for (let i = 0; i < numWords; i += 1) {
            const realIndex = tokenIndex + i;
            const confidence = confidences[realIndex];
            avgConfidence += confidence;
            confis.push(confidence);
            involvedTokenIDs.push(realIndex);
          }
          avgConfidence /= numWords;

          // save keywordness for keyword phrase (as token ids)
          keywordInfo.push({
            involved: involvedTokenIDs,
            score: keyword.score * avgConfidence * avgConfidence,
            phrase: keyword.word,
            words: keyword.word.split(' '),
            confs: confis,
            avgConf: avgConfidence,
            kwScore: keyword.score,
          });

          match = re.exec(text);
        }
      });

      console.log('TL_UTT keywordInfo');
      console.log(keywordInfo);

      // filter the keywordInfo so that only the "REAL" keywords are processed further
      keywordInfo = keywordInfo.filter(info => info.score > 10.0);

      // remap top keyword phrases as f.e.
      // { involved: [0, 1, 2], score: 10 }
      // to
      // [ { token: 0, score: 10 },
      //   { token: 1, score: 10 },
      //   { token: 2, score: 10 } ]
      const keywordnessTokenMap = new Map();
      keywordInfo.forEach((obj) => {
        obj.involved.forEach((tokenId) => {
          keywordnessTokenMap.set(tokenId, obj.score);
        });
      });

      console.log('TL_UTT ProcessedKeywordScores');
      console.log(keywordnessTokenMap);

      return { keywordnessTokenMap, keywordInfo };
    },
  },
};
</script>

<style>
  @import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.css";

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
    width: 50px;
    height: 50px;
    right: 0;
    background-color: white;
    border: 4px solid #28a745;
    border-radius: 50%;
    z-index: 3;
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
