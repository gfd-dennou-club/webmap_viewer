<template>
  <div>
    {{ name }}
    <div v-for="(slider, i) in sliders" :key="i">
      <div style="display: flex">
        <v-subheader>
          {{ slider.title + '=' + slider.tick_label[slider.value] }}
        </v-subheader>
        <v-btn
          outlined
          color="red"
          style="margin: 0 0 0 auto"
          @click="replay(i)"
        >
          {{ slider.clicked ? '▶︎' : '■' }}
        </v-btn>
      </div>
      <v-slider
        v-model="slider.value"
        :tick-size="slider.step"
        :step="slider.step"
        :min="slider.min"
        :max="slider.max"
        ticks="always"
        @mouseup="changeURL(i)"
        dense
      ></v-slider>
    </div>
  </div>
</template>

<script lang="ts">
import { DefinedOptions, DrawingOptions, LayerTypes } from '@/dcmwtconfType';
import Vue from 'vue';

type Slider = {
  title: string;
  value: number;
  tick_label: string[];
  step: number;
  min: number;
  max: number;
  clicked: boolean;
};

type DataType = {
  sliders: Slider[];
  intervalID: number | undefined;
  sec_per_frame: number;
  name: string;
  length: number;
  defaultSliderValue: {
    value: number;
    min: number;
    max: number;
    step: number;
    clicked: boolean;
  };
  oldLayers: LayerTypes[] | undefined;
  fixedIndex: number;
};

export default Vue.extend({
  // コンポーネントのデータを定義
  data(): DataType {
    return {
      sliders: new Array<Slider>(),
      intervalID: 0,
      sec_per_frame: 2,
      name: '',
      length: 0,
      defaultSliderValue: { value: 0, min: 0, max: 0, step: 1, clicked: false },
      oldLayers: undefined,
      fixedIndex: 0,
    };
  },
  computed: {
    // VuexストアからdrawingOptionsを取得し、設定します。
    drawingOptions: {
      get: function (): DrawingOptions {
        return this.$store.getters.drawingOptions;
      },
      set: function (value: DrawingOptions) {
        this.$store.commit('setDrawingOptions', value);
      },
    },
    // VuexストアからlayersIDを取得します。
    layersID: function (): string | undefined {
      return this.$store.getters.drawingOptions?.layers
        .map((v: LayerTypes) => v.id)
        .reduce((pValue: string, cValue: string) => pValue + cValue);
    },
    // VuexストアからdefinedOptionsを取得します。
    definedOptions: function (): DefinedOptions | undefined {
      return this.$store.getters.definedOptions;
    },
  },
  methods: {
    // URLを変更するメソッド
    changeURL: function (sliderIndex: number, hasIncrement: boolean = false) {
      const slider = this.sliders[sliderIndex];
      const newFixed = `${slider.title}=${slider.tick_label[slider.value]}`;
      const lenOfLayers = this.drawingOptions.layers.length;
      const lastLayer = this.drawingOptions.layers[lenOfLayers - 1];
      const fixed = this.definedOptions?.variables[lastLayer.varindex].fixed;
      if (!fixed) throw Error("Can't get fixed");
      const shapedFixed = fixed.map((v) => v.split('/'));
      let fixedIndex = Infinity;
      if (shapedFixed[0].length === 1) {
        fixedIndex = fixed.findIndex((v) => v === newFixed);
      } else {
        const fixedNames = shapedFixed[0].map((v) => v.split('=')[0]);
        const fixedNamesIndex = fixedNames.findIndex((v) => v === slider.title);
        console.log(shapedFixed);
        fixedIndex = shapedFixed.findIndex(
          (v) => v[fixedNamesIndex] === newFixed  
        );
        console.log(fixedIndex);
      }
      if (fixedIndex === undefined) {
        throw new Error("Can't use URL");
      }

      if (hasIncrement) {
        const value = lastLayer.fixedindex + 1;
        const lenOfFixedVariables =
          this.definedOptions?.variables[lastLayer.varindex].fixed.length;
        if (lenOfFixedVariables && value < lenOfFixedVariables) {
          lastLayer.fixedindex = value;
          this.sliders[sliderIndex].value = value;
        } else {
          lastLayer.fixedindex = 0;
          this.sliders[sliderIndex].value = 0;
        }
      } else {
        lastLayer.fixedindex = fixedIndex;
      }

      this.$set(this.drawingOptions.layers, lenOfLayers - 1, lastLayer);
    },
    // 再生/停止を切り替えるメソッド
    replay: function (sliderIndex: number) {
      this.sliders[sliderIndex].clicked = !this.sliders[sliderIndex].clicked;

      if (this.sliders[sliderIndex].clicked) {
        const delay = this.sec_per_frame * 1000;
        this.intervalID = setInterval(
          () => {
            this.changeURL(sliderIndex, true);
          },
          delay,
          sliderIndex
        );
      } else {
        clearInterval(this.intervalID);
        this.intervalID = undefined;
      }
    },
  },
  watch: {
    // layersIDの変更を監視
    layersID: {
      handler: function (newID: string, oldID: string | undefined) {
        if (oldID && newID === oldID) {
          return;
        }
        this.sliders.splice(0);
        if (!this.definedOptions) {
          throw new Error("Couldn't initialize definedOptions");
        }
        const layers = this.drawingOptions.layers;
        const layer = layers[layers.length - 1];
        this.name = layer.name;
        const variable = this.definedOptions.variables[layer.varindex];
        const fixed = variable.fixed;
        const dims = fixed.map((v) => v.split('/')).flat();
        for (const dim of dims) {
          const [dName, dValue] = dim.split('=');
          const pIndex = this.sliders.findIndex((v) => v.title === dName);
          if (pIndex === -1) {
            this.sliders.push({
              ...this.defaultSliderValue,
              title: dName,
              tick_label: [dValue],
            });
          } else if (
            !this.sliders[pIndex].tick_label.find((v) => v === dValue)
          ) {
            this.sliders[pIndex].max += 1;
            this.sliders[pIndex].tick_label.push(dValue);
          }
        }
      },
    },
  },
});
</script>

<style scoped>
</style>
