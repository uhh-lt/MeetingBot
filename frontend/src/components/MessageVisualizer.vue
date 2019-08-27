<template>
  <div>
<!--    <div class="timeline">-->
<!--      <TimelineBox name="Tim Fischer" time="15:01" message="Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam."></TimelineBox>-->
<!--      <TimelineBox v-for="(utt, id) in renderedUtterances" name="Speaker" time="15:01" :message="utt" :key="id"></TimelineBox>-->
<!--    </div>-->

<!--    <br>-->
<!--    <br>-->
<!--    <br>-->
    <div class="timeline" style="overflow-y: scroll; height:400px;">

      <div class="d-flex">
        <div v-for="n in speakers" class="p-1 flex-fill">
          <div class="p-1" style="position:relative;">
            <img src="../assets/avatar_scholar_128.png" style="position:absolute; margin:auto; left:0; right:0;" class="rounded-circle" alt="speaker-img" width="64" height="64">
            <h6 style="margin-top:74px; white-space: nowrap; text-align:center;">Speaker {{n}}</h6>
          </div>
        </div>
        <div class="p-1" style="position:relative; width:66px;">
          <div class="tlcircle">15:00</div>
        </div>
      </div>

      <TimelineRow message="Tim ist toll" speaker="1" speakers="4" time="15:00"></TimelineRow>
      <TimelineRow v-for="(utt, id) in renderedUtterances" :message="utt" :key="id" :speaker="(id%4) + 1" speakers="4" time="15:00"></TimelineRow>

    </div>

    <div id="bottom-bar" class="row">
      <div id="speech-input" class="col-sm-12">
        <h2 class="lang_de">Spracheingabe</h2>
        <h2 class="lang_en">Speech Input</h2>
        <div id="chat-area">
          <p><span class="speaker">Computer: </span><i>Hi! I'm listening</i></p>
          <p v-for="utt in renderedUtterances" v-html="utt"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TimelineBox from '../components/TimelineBox';
import TimelineRow from '../components/TimelineRow';

export default {
  name: 'SummarizationInput',
  components: {
    TimelineBox,
    TimelineRow
  },
  data: function () {
    return {
      scrollChatAreaBottom: true,
      utts: [],
      renderedUtterances: [],
      startNewUtt: true,
      speakers: 4,
    }
  },
  methods: {
    sendCompleteUtteranceToParent: function(utterance, speaker) {
      this.$root.$emit("onCompleteUtterance", utterance, speaker)
    },
    handleStream: function(event) {
      console.log(event.data);
      let jsonEvent = JSON.parse(event.data);

      if (jsonEvent.handle === 'partialUtterance') {
        if (this.startNewUtt) {
          this.utts.push(jsonEvent.utterance);
          this.addUtterance(jsonEvent);
          this.startNewUtt = false;
        } else {
          this.utts.pop();
          this.utts.push(jsonEvent.utterance);
          this.replaceLastUtterance(jsonEvent, false);
        }
      } else if (jsonEvent.handle === 'completeUtterance') {
        this.utts.pop();
        this.utts.push(jsonEvent.utterance);
        this.sendCompleteUtteranceToParent(jsonEvent.utterance, Math.floor(Math.random() * 4));
        this.replaceLastUtterance(jsonEvent, true);
        this.startNewUtt = true;
      } else if (jsonEvent.handle === 'reset') {
        this.reset();
      }
    },
    renderUtterance: function(jsonEvent) {
      return '<span class="speaker">' + jsonEvent.speaker + ':</span> ' + jsonEvent.utterance;
    },
    renderUtteranceWithConfidence: function(jsonEvent) {
      let result = '<span class="speaker">' + jsonEvent.speaker + ':</span> ';
      const text = jsonEvent.utterance.split(" ");

      for(let i = 0; i < text.length; i++) {
        let word = text[i];
        let conf = jsonEvent.confidences[i];
        result += '<span style="color:rgba(0,0,0,' + Math.max(conf * conf, 0.1) + ');">' + word + '</span> '
      }

      console.log(result);
      return result.trim();
    },
    addUtterance: function(jsonEvent) {
      this.renderedUtterances.push(this.renderUtterance(jsonEvent));
      if (this.scrollChatAreaBottom)
        document.getElementById('chat-area').scrollTop = document.getElementById('chat-area').scrollHeight;
    },
    replaceLastUtterance: function(jsonEvent, renderConfidence) {
      if(renderConfidence) {
        this.renderedUtterances.pop();
        this.renderedUtterances.push(this.renderUtteranceWithConfidence(jsonEvent));
      } else {
        this.renderedUtterances.pop();
        this.renderedUtterances.push(this.renderUtterance(jsonEvent));
      }
      if (this.scrollChatAreaBottom) {
        document.getElementById('chat-area').scrollTop = document.getElementById('chat-area').scrollHeight;
      }
    },
  },
  mounted() {
    const source = new EventSource('http://localhost:5000/stream');
    source.onmessage = this.handleStream;
  },
};
</script>

<style>

  .flex-even {
    flex: 1;
  }

  .tlcircle {
    position: absolute;
    width: 50px;
    height: 50px;
    right: 0;
    background-color: white;
    border: 4px solid #FF9F55;
    border-radius: 50%;
    z-index: 1;
    text-align: center;
    padding-top: 10px;
    left: 0;
    margin: auto;
    top: 0;
    bottom: 0;
  }

  /* The actual timeline (the vertical ruler) */
  .timeline {
    position: relative;
    margin: 0 auto;
    background-color:red;
  }

  /* The actual timeline (the vertical ruler) */
  .timeline::after {
    content: '';
    position: absolute;
    width: 6px;
    background-color: white;
    top: 0;
    bottom: 0;
    left: calc(100% - 36px);
  }

  /* Container around content */
  .tl-container {
    padding: 10px 40px 10px 10px;
    position: relative;
    background-color: inherit;
    width: calc(100% - 33px);
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
    right: -25.5px;
    background-color: white;
    border: 4px solid #FF9F55;
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
    border: medium solid white;
    border-width: 10px 0 10px 10px;
    border-color: transparent transparent transparent white;
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
    border: medium solid white;
    border-width: 10px 0 10px 10px;
    border-color: transparent transparent transparent white;
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
