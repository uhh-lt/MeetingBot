<template>
  <div>

    <template v-if="settings.controlButtonsStateDependent === 'false'">
      <button v-on:click="handleClick('NEWMEETING')" type="button" class="btn btn-success mr-sm-2" :disabled="buttonStatus.newmeeting">
        {{ $t('new_meeting') }}</button>
      <button v-on:click="handleClick('START')" type="button" class="btn btn-labeled btn-success mr-sm-2" :disabled="buttonStatus.start">
        <span class="btn-label"><i class="fas fa-play"></i></span>{{ $t('start') }}</button>
      <button v-on:click="handleClick('RESUME')" type="button" class="btn btn-labeled btn-success mr-sm-2" :disabled="buttonStatus.resume">
        <span class="btn-label"><i class="fas fa-play"></i></span>{{ $t('resume') }}</button>
      <button v-on:click="handleClick('PAUSE')" type="button" class="btn btn-labeled btn-warning mr-sm-2" :disabled="buttonStatus.pause">
        <span class="btn-label"><i class="fas fa-pause"></i></span>{{ $t('pause') }}</button>
      <button v-on:click="handleClick('STOP')" type="button" class="btn btn-labeled btn-danger" :disabled="buttonStatus.stop">
        <span class="btn-label"><i class="fas fa-stop"></i></span>{{ $t('stop') }}</button>
    </template>
    <template v-if="settings.controlButtonsStateDependent === 'true'">
      <template v-if="status === StatusEnum.CONNECTING">
        <button type="button" class="btn btn-outline-light disabled">CONNECTING TO ASR...</button>
      </template>
      <template v-else-if="status === StatusEnum.NOT_READY">
        <button type="button" class="btn btn-outline-light disabled">WAITING FOR ASR TO LOAD...</button>
      </template>
      <template v-else-if="status === StatusEnum.STOPPED && meeting.status === meeting.enum.BEFORE_MEETING">
        <button v-on:click="handleClick('START')" type="button" class="btn btn-labeled btn-success" :disabled="buttonStatus.start">
          <span class="btn-label"><i class="fas fa-play"></i></span>{{ $t('start') }}</button>
      </template>
      <template v-else-if="status === StatusEnum.STOPPED && meeting.status === meeting.enum.AFTER_MEETING">
        <button v-on:click="handleClick('NEWMEETING')" type="button" class="btn btn-success" :disabled="buttonStatus.newmeeting">
          {{ $t('new_meeting') }}</button>
      </template>
      <template v-else-if="status === StatusEnum.STARTED">
        <button v-on:click="handleClick('PAUSE')" type="button" class="btn btn-labeled btn-warning mr-sm-2" :disabled="buttonStatus.pause">
          <span class="btn-label"><i class="fas fa-pause"></i></span>{{ $t('pause') }}</button>
        <button v-on:click="handleClick('STOP')" type="button" class="btn btn-labeled btn-danger" :disabled="buttonStatus.stop">
          <span class="btn-label"><i class="fas fa-stop"></i></span>{{ $t('stop') }}</button>
      </template>
      <template v-else-if="status === StatusEnum.PAUSED">
        <button v-on:click="handleClick('RESUME')" type="button" class="btn btn-labeled btn-success mr-sm-2" :disabled="buttonStatus.resume">
          <span class="btn-label"><i class="fas fa-play"></i></span>{{ $t('resume') }}</button>
        <button v-on:click="handleClick('STOP')" type="button" class="btn btn-labeled btn-danger" :disabled="buttonStatus.stop">
          <span class="btn-label"><i class="fas fa-stop"></i></span>{{ $t('stop') }}</button>
      </template>
      <template v-else>
        <button type="button" class="btn btn-outline-light disabled">AN ERROR OCCURED :(</button>
      </template>
    </template>
  </div>
</template>

<script>
import { sendCommand } from '../helper/api';
import Store from '../helper/Store';

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
        newmeeting: false,
      },
      meeting: Store.meeting,
      settings: {},
    };
  },
  mounted() {
    // listen to events
    this.$root.$on('onSettingsSaved', this.onSettingsSaved);
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
        this.meeting.status = this.meeting.enum.IN_MEETING;
      } else if (streamStatus === 'NOT_DECODING') {
        if (this.meeting.status === this.meeting.enum.IN_MEETING) {
          this.status = this.StatusEnum.PAUSED;
        } else if (this.meeting.status === this.meeting.enum.BEFORE_MEETING || this.meeting.status === this.meeting.enum.AFTER_MEETING) {
          this.status = this.StatusEnum.STOPPED;
        }
      } else if (streamStatus === 'SHUTDOWN') {
        this.status = this.StatusEnum.NOT_READY;
      } else {
        console.log('STREAM STATUS UNKOWN!!!');
      }
    },
    onSettingsSaved(settings) {
      this.settings = settings;
    },
    handleClick(buttonType) {
      switch (buttonType) {
        case 'START':
          console.log('START clicked');
          this.sendButtonCommand('start', 'start');
          this.meeting.status = this.meeting.enum.IN_MEETING;
          sendCommand('reset_timer')
            .catch((error) => {
              console.log(`ERROR while sending button command: ${error}`);
            });
          break;
        case 'PAUSE':
          console.log('PAUSE clicked');
          this.sendButtonCommand('stop', 'stop');
          this.meeting.status = this.meeting.enum.IN_MEETING;
          break;
        case 'STOP':
          console.log('STOP clicked');
          this.sendButtonCommand('stop', 'stop');
          this.meeting.status = this.meeting.enum.AFTER_MEETING;
          break;
        case 'RESUME':
          console.log('RESUME clicked');
          this.sendButtonCommand('start', 'start');
          this.meeting.status = this.meeting.enum.IN_MEETING;
          break;
        case 'NEWMEETING':
          console.log('New Meeting clicked');
          this.sendReset();
          this.meeting.status = this.meeting.enum.BEFORE_MEETING;
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
