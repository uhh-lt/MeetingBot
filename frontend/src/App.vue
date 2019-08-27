<template>
  <div id="app">

    <nav class="navbar sticky-top navbar-light bg-light">
      <a class="navbar-brand" href="#">
        <img src="https://getbootstrap.com/docs/4.0/assets/brand/bootstrap-solid.svg" width="30" height="30" class="d-inline-block align-top" alt="">
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
        <button type="button" class="btn btn-labeled btn-dark mr-sm-2">
          <span class="btn-label"><i class="fas fa-print"></i></span>Print</button>
        <button type="button" class="btn btn-labeled btn-dark mr-sm-2">
          <span class="btn-label"><i class="fas fa-download"></i></span>Export</button>
        <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success my-2 my-sm-0" type="submit"><i class="fas fa-search"></i></button>
      </div>
    </nav>

    <div class="container-fluid">

      <div class="row">
        <div class="col-8">
          <MessageVisualizer></MessageVisualizer>
        </div>
        <div class="col-4">
          <div style="max-height:400px;">
            <bar-chart :data="barChartData"></bar-chart>
          </div>
        </div>
      </div>

<!--      <div style="padding: 0" class="row">-->
<!--        <div class="col">-->
<!--          <h1 style="float:left;">Minute Meeting Bot</h1>-->
<!--          <img style="float: right;" alt="LT logo" src="./assets/lt.png" width="128" height="128">-->
<!--        </div>-->
<!--      </div>-->

<!--      <SummarizationInput></SummarizationInput>-->
<!--      <NamedEntityVisualizer></NamedEntityVisualizer>-->
<!--      <KeywordVisualizer></KeywordVisualizer>-->
<!--      <SummarizationVisualizer></SummarizationVisualizer>-->
      <Footer></Footer>
    </div>
  </div>
</template>

<script>
import TimelineBox from './components/TimelineBox';
import MessageVisualizer from './components/MessageVisualizer';
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
    MessageVisualizer,
    SummarizationInput,
    NamedEntityVisualizer,
    SummarizationVisualizer,
    KeywordVisualizer,
    Footer,
    TimelineBox,
    BarChart,
  },
  mounted() {
    this.$root.$on("onCompleteUtterance", (data, speaker) => {
      console.log("recieved utterance:" + data);

      // update redeanteil
      this.redeanteil[speaker] += data.length;

      // compute redeanteil in percent
      let totalRedeanteil = this.redeanteil.reduce((total, num) => total + num);
      for(let speaker = 0; speaker < this.redeanteil.length; speaker++) {
        this.redeanteilInProzent[speaker] = (this.redeanteil[speaker] / totalRedeanteil) * 100;
      }

      // visualize redeanteile in percent
      this.barChartData = [0, 0, 0, 0];
      this.barChartData = this.redeanteilInProzent;
      this.barChartData = this.barChartData.slice(0);
    });
  },
  data: function() {
    return {
      redeanteil: [0, 0, 0, 0],
      redeanteilInProzent: [0, 0, 0, 0],
      barChartData: [0, 0, 0, 0],
    }
  }
};
</script>

<style>
  @import "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css";
  @import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.css";
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

  .btn-label {position: relative;left: -12px;display: inline-block;padding: 6px 12px;background: rgba(0,0,0,0.15);border-radius: 3px 0 0 3px;}
  .btn-labeled {padding-top: 0;padding-bottom: 0;}
</style>
