<template>
  <div class="tl-container tl-left">
    <div class="tl-content">
      <div class="d-flex">
        <div class="p-2" style="position:relative;">
          <img src="../assets/avatar_scholar_128.png" style="position:absolute; margin:auto; left:0; right:0;" class="rounded-circle" alt="speaker-img" width="64" height="64">
          <h6 style="margin-top:74px; white-space: nowrap;">{{name}}</h6>
        </div>
        <div class="p-2 flex-grow-1">
          <div style="display:table; height:100%;">
            <div style="display:table-cell; vertical-align:middle;" v-html="message">
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="timelinecircle">
      {{time}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimelineBox',
  props: ['name', 'message', 'time'],
};
</script>

<style scoped>

</style>
