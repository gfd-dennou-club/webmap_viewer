<template>
  <div class="fab-button">
    <v-dialog
      v-model="fab"
      transition="scroll-x-reverse-transition"
      max-width="500"
      content-class="my-dialog-style"
      hide-overlay
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn elevation="2" fab tile v-bind="attrs" v-on="on" />
      </template>
      <Panel />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Panel from './panel.vue';

export default Vue.extend({
  components: {
    Panel,
  },
  data: () => ({
    // fabボタンがクリックされたかどうかを管理するデータプロパティ
    fab: false,
  }),
});
</script>

<style>
.fab-button {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 2;
}
.my-dialog-style {
  position: absolute;
  left: 0;
}
.v-speed-dial {
  position: absolute !important;
}
#toolbar {
  background: rgba(255, 255, 255, 0.8);
  padding: 4px;
  border-radius: 4px;
}
#toolbar input {
  vertical-align: middle;
  padding-top: 2px;
  padding-bottom: 2px;
}
#toolbar table tr {
  transform: translateY(0);
  transition: transform 0.4s ease-out;
}
</style>
