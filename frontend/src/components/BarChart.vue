<script>
import { HorizontalBar, mixins } from 'vue-chartjs';

const { reactiveProp } = mixins;

export default {
  extends: HorizontalBar,
  mixins: [reactiveProp],
  props: ['chartData', 'speakerCount', 'speakerNames'],
  data() {
    return {
      redeanteil: [0, 0, 0, 0],
      redeanteilInProzent: [0, 0, 0, 0],
      data: [0, 0, 0, 0],
    };
  },
  computed: {
    barChartData() {
      return this.data;
    },
    speakers() {
      return parseInt(this.speakerCount, 10);
    },
  },
  mounted() {
    this.renderBarChart();
    this.$root.$on('onCompleteUtterance', this.onCompleteUtterance);
    this.$root.$on('onReset', this.onReset);
  },
  watch: {
    data() {
      console.log('data changed!!!');
      this.renderBarChart();
    },
    speakerNames() {
      this.renderBarChart();
    },
    speakerCount() {
      this.renderBarChart();
    },
  },
  methods: {
    onReset() {
      this.redeanteil = [0, 0, 0, 0];
      this.redeanteilInProzent = [0, 0, 0, 0];
      this.data = [0, 0, 0, 0];
    },
    onCompleteUtterance(utterance, data, speaker) {
      console.log(`recieved utterance:${data}`);

      // update redeanteil
      this.redeanteil[speaker] += data.length;

      // compute redeanteil in percent
      const totalRedeanteil = this.redeanteil.reduce((total, num) => total + num);
      for (let spkr = 0; spkr < this.redeanteil.length; spkr += 1) {
        this.redeanteilInProzent[spkr] = (this.redeanteil[spkr] / totalRedeanteil) * 100;
      }

      // visualize redeanteile in percent
      this.data = [0, 0, 0, 0];
      this.data = this.redeanteilInProzent;
      this.data = this.data.slice(0);
    },
    renderBarChart() {
      this.renderChart(
        {
          labels: this.speakerNames.slice(0, this.speakers),
          datasets: [
            {
              label: 'Redeanteil (in %)',
              backgroundColor: 'rgba(40, 167, 69, 0.2)',
              borderColor: '#28a745',
              data: this.barChartData.slice(0, this.speakers),
              borderWidth: 3,
            },
          ],
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                min: 0,
                max: 100,
                stepSize: 10,
              },
            }],
          },
          legend: {
            display: false,
          },
        },
      );
    },
  },
};
</script>

<style scoped>
</style>
