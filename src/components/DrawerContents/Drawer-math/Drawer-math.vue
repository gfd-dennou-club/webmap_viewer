<template>
  <div>
    <v-list subheader>
      <v-subheader>数学的操作</v-subheader>
      <v-list-item-group>
        <v-list-item
          v-for="mathmaticalMethod in mathmaticalMethods"
          :key="mathmaticalMethod.name"
          @click="
            () => {
              math_method = mathmaticalMethod;
            }
          "
        >
          <v-list-item-title>
            {{ mathmaticalMethod.name }}
          </v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      mathmaticalMethods: [
        { name: '通常', method: (x: number) => x },
        { name: 'log10', method: (x: number) => Math.log10(x) },
        { name: 'sqrt', method: (x: number) => Math.sqrt(x) },
      ],
    };
  },
  computed: {
    // VuexストアからdrawingOptionsを取得し、設定します。
    drawinOptions: {
      get: function () {
        return this.$store.getters.drawingOptions;
      },
      // 選択された数学的操作をdrawingOptionsに設定します。
      set: function (value: { name: string; method: (x: number) => number }) {
        const props = { mathMethod: value.method };
        this.$store.commit('setDrawingOptions', props);
      },
    },
  },
});
</script>
