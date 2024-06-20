<template>
  <v-list subheader tile>
    <v-subheader>描画方法の切り替え</v-subheader>
    <v-list-item
      v-for="projection in projections"
      :key="projection.title"
      @click="onClick(projection)"
    >
      <v-list-item-title>
        {{ projection.title }}
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { DrawingOptions } from '@/dcmwtconfType';
import Vue from 'vue';
import { ProjCodes, Projection, projections } from './projection_lib';

type DrawerFigureDataType = {
  selected: Projection;
};

export default Vue.extend({
  data(): DrawerFigureDataType {
    return {
      selected: projections[0],
    };
  },
  computed: {
    // 利用可能な描画方法のリストを取得します。
    projections: function () {
      return projections;
    },
    // VuexストアからdrawingOptionsを取得し、設定します。
    drawingOptions: {
      get: function (): DrawingOptions {
        return this.$store.getters.drawingOptions;
      },
      set: function (value: DrawingOptions) {
        this.$store.commit('setDrawingOptions', value);
      },
    },
  },
  methods: {
    // 描画方法がクリックされたときの処理を定義します。
    onClick: function (projection: Projection) {
      const codeObj = { projCode: projection.code as ProjCodes };
      const storeObj = this.drawingOptions;
      // 選択された描画方法をdrawingOptionsに設定します。
      this.drawingOptions = { ...storeObj, ...codeObj };
    },
  },
});
</script>
