<template>
  <div></div>
</template>

<script>
// TODO: There is a bug that I cannot start the recording again, after i have stopped it! :(
export default {
  name: 'Recorder',
  data() {
    return {
      recorder: null,
      loadedRecordRTC: false,
    };
  },
  mounted() {
    // init recorder
    this.$loadScript('/js/RecordRTC.js')
      .then(() => {
        this.loadedRecordRTC = true;
      })
      .catch(() => {
        console.log('ERROR: Could not load RecordRTC!');
      });

    // listen to events from other components
    this.$root.$on('onRecorder', this.onRecorder);
  },
  methods: {
    createRecorder(callback) {
      navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      }).then(async (stream) => {
        const toBase64 = this.blobToBase64;
        const sendSocketIO = this.sendWithSocketIO;
        // eslint-disable-next-line no-undef
        this.recorder = RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/wav',
          // eslint-disable-next-line no-undef
          recorderType: StereoAudioRecorder,
          disableLogs: true, // disable logs
          timeSlice: 1000, // get intervals based blobs, value in milliseconds
          ondataavailable(blob) { // requires timeSlice above returns blob via callback function
            console.log('BLOB!');
            toBase64(blob, (dataURL, base64) => {
              sendSocketIO('data_available', { blob, base64, mime: 'wav' });
            });
          },
          audioBitsPerSecond: 128000,
          // sampleRate: 96000, // used by StereoAudioRecorder the range 22050 to 96000
          desiredSampRate: 16000, // used by StereoAudioRecorder let us force 16khz recording
          bufferSize: 1024, // used by StereoAudioRecorder Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384).
          numberOfAudioChannels: 1, // used by StereoAudioRecorder 1 or 2
        });
        callback();
      });
    },
    /**
     * This method instructs App.vue to send a message via Socket IO to the event_server.py
     * @param event any event like 'recording_started' etc
     * @param data any data object
     */
    sendWithSocketIO(event, data) {
      if (data) {
        this.$root.$emit('onSocketIO', event, data);
      } else {
        this.$root.$emit('onSocketIO', event);
      }
    },
    blobToBase64(blob, callback) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result;
        const base64 = dataURL.split(',')[1];
        callback(dataURL, base64);
      };
      reader.readAsDataURL(blob);
    },
    onRecorder(command) {
      switch (command) {
        case 'start':
          this.startRecording();
          break;
        case 'stop':
          this.stopRecording();
          break;
        case 'resume':
          this.resumeRecording();
          break;
        case 'pause':
          this.pauseRecording();
          break;
        default:
          console.log('ERROR: Unknown recorder command!');
          break;
      }
    },
    startRecording() {
      if (this.loadedRecordRTC) {
        this.createRecorder(() => {
          this.recorder.startRecording();
          this.sendWithSocketIO('recording_started');
        });
      } else {
        console.log('ERROR: Record RTC is not loaded yet!');
      }
    },
    stopRecording() {
      this.recorder.stopRecording(() => {
        console.log('Stopped recording :)');
        const blob = this.recorder.getBlob();
        this.blobToBase64(blob, (dataURL, base64) => {
          const au = new Audio(dataURL);
          au.controls = true;
          document.body.appendChild(au);
          this.sendWithSocketIO('recording_stopped', { blob, base64, mime: 'wav' });
        });
      });
    },
    pauseRecording() {
      this.recorder.pauseRecording();
    },
    resumeRecording() {
      this.recorder.resumeRecording();
    },
  },
};
</script>

<style scoped>

</style>
