<script>
  import { HorizontalBar, mixins } from 'vue-chartjs';
  const { reactiveProp } = mixins;

  export default {
    extends: HorizontalBar,
    mixins: [reactiveProp],
    props: ['chartData', 'data'],
    computed: {
      barChartData: function() {
        return this.data;
      }
    },
    mounted () {
      this.renderBarChart();
    },
    watch: {
      data: function() {
        console.log("data changed!!!");
        this.renderBarChart();
      }
    },
    methods: {
      renderBarChart: function() {
        this.renderChart(
          {
            labels: ["Spk 1", "Spk 2", "Spk 3", "Spk 4"],
            datasets: [
              {
                label: 'Redeanteil (in %)',
                backgroundColor: 'rgba(139, 195, 74, 0.2)',
                borderColor: '#8bc34a',
                data: this.barChartData,
                borderWidth: 3,
              },
            ]
          },
          {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              xAxes: [{
                ticks: {
                beginAtZero: true,
                min:0,
                max:100,
                stepSize: 10,
                },
              }]
            }
          },
        )
      }
    }
  }
</script>

<style scoped>
</style>
