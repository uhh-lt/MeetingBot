<template>
  <div class="form-inline">

    <template v-if="status === StatusEnum.CONNECTING">
      <button type="button" class="btn btn-outline-light disabled">CONNECTING TO ASR...</button>
    </template>

    <template v-else-if="status === StatusEnum.NOT_READY">
      <button type="button" class="btn btn-outline-light disabled">WAITING FOR ASR TO LOAD...</button>
    </template>

    <template v-else-if="status === StatusEnum.STOPPED">
      <button v-on:click="handleClick('START')" type="button" class="btn btn-labeled btn-success" :disabled="buttonStatus.start">
        <span class="btn-label"><i class="fas fa-play"></i></span>Start</button>
    </template>

    <template v-else-if="status === StatusEnum.STARTED">
      <button v-on:click="handleClick('PAUSE')" type="button" class="btn btn-labeled btn-warning mr-sm-2" :disabled="buttonStatus.pause">
        <span class="btn-label"><i class="fas fa-pause"></i></span>Pause</button>
      <button v-on:click="handleClick('STOP')" type="button" class="btn btn-labeled btn-danger" :disabled="buttonStatus.stop">
        <span class="btn-label"><i class="fas fa-stop"></i></span>Stop</button>
    </template>

    <template v-else-if="status === StatusEnum.PAUSED">
      <button v-on:click="handleClick('RESUME')" type="button" class="btn btn-labeled btn-success mr-sm-2" :disabled="buttonStatus.resume">
        <span class="btn-label"><i class="fas fa-play"></i></span>Resume</button>
      <button v-on:click="handleClick('STOP')" type="button" class="btn btn-labeled btn-danger" :disabled="buttonStatus.stop">
        <span class="btn-label"><i class="fas fa-stop"></i></span>Stop</button>
    </template>
  </div>
</template>

<script>
import { sendCommand } from '../helper/api';

export default {
  name: 'ControlBar',
  data() {
    return {
      StatusEnum: {
        CONNECTING: 1,
        NOT_READY: 2,
        STOPPED: 3,
        STARTED: 4,
        PAUSED: 5,
      },
      status: 4,
      buttonStatus: {
        start: false,
        pause: false,
        stop: false,
        resume: false,
      },
      inMeeting: false,
    };
  },
  mounted() {
    this.$root.$on('onStreamStatusChanged', this.onStreamStatusChanged);
  },
  methods: {
    sendReset() {
      this.$root.$emit('onReset');
    },
    onStreamStatusChanged(streamStatus) {
      console.log(`Stream Status has changed to ${streamStatus}`);
      if (streamStatus === 'ERROR') {
        this.status = this.StatusEnum.CONNECTING;
      } else if (streamStatus === 'OPEN') {
        this.status = this.StatusEnum.NOT_READY;
      } else if (streamStatus === 'DECODING') {
        this.status = this.StatusEnum.STARTED;
      } else if (streamStatus === 'NOT_DECODING') {
        if (this.inMeeting) {
          this.status = this.StatusEnum.PAUSED;
        } else {
          this.status = this.StatusEnum.STOPPED;
        }
      } else if (streamStatus === 'SHUTDOWN') {
        this.status = this.StatusEnum.NOT_READY;
      } else {
        console.log('STREAM STATUS UNKOWN!!!');
      }
    },
    handleClick(buttonType) {
      switch (buttonType) {
        case 'START':
          console.log('START clicked');
          this.sendReset();
          this.sendButtonCommand('start', 'start');
          this.inMeeting = true;
          break;
        case 'PAUSE':
          console.log('PAUSE clicked');
          this.sendButtonCommand('stop', 'stop');
          this.inMeeting = true;
          break;
        case 'STOP':
          console.log('STOP clicked');
          this.sendButtonCommand('stop', 'stop');
          this.inMeeting = false;
          break;
        case 'RESUME':
          console.log('RESUME clicked');
          this.sendButtonCommand('start', 'start');
          this.inMeeting = true;
          break;
        default:
          console.log(`ERROR: Button does not exist - ${buttonType}`);
          break;
      }
    },
    sendButtonCommand(button, command) {
      this.buttonStatus[button] = true; // disable button
      sendCommand(command)
        .catch((error) => {
          console.log(`ERROR while sending button command: ${error}`);
        })
        .finally(() => {
          this.buttonStatus[button] = false; // enable button
        });
    },
  },
};
</script>

<style scoped>

</style>
