<template>
  <div class="d-flex">
    <div v-for="n in parseInt(speakers)" class="flex-even">
      <div v-if="n === parseInt(speaker)" class="tl-container2 tl-left2">
        <div class="tl-content" style="position:relative;">
          <div style="display:table; height:100%;">
            <div style="display:table-cell; vertical-align:middle;" v-html="message"></div>
          </div>
        </div>
        <div class="tl-left-line" :style="'width:calc(' + ((parseInt(speakers) - n) * 100) + '% + 2px);'"></div>
      </div>
    </div>
    <div class="p-1" style="position:relative; width:66px;">
      <div class="tlline"></div>
      <div class="tlcircle">{{time}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimelineRow',
  props: ['speakers', 'speaker', 'message', 'time'],
};
</script>

<style scoped>

</style>
