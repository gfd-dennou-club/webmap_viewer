<template>
  <div>
    <div id="dropzone">drop zone</div>
    <div style="text-align: center; padding-top: 10px">
      <v-btn outlined rounded color="primary" @click="loading">load</v-btn>
    </div>
    <div v-if="loadedData" style="white-space: pre-wrap; word-wrap: break-word">
      {{ droppedInfo }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DefinedOptions, DrawingOptions } from '../../../dcmwtconfType';
import { v4 as uuid } from 'uuid';
// ConfDataは、定義オプションと描画オプションを保持します。
type ConfData = {
  definedOptions: DefinedOptions;
  drawingOptions: DrawingOptions;
};
// DataTypeは、ロードされたデータを保持します。
type DataType = {
  loadedData: ConfData | undefined;
};

export default Vue.extend({
  data(): DataType {
    return {
      loadedData: undefined,
    };
  },
  computed: {
    // ドロップされた情報を文字列として取得します。
    droppedInfo: function () {
      if (!this.loadedData) {
        return '';
      } else {
        let str = '';
        const title = 'Dropped Data Info\n';
        str += title;
        const mapTitle = `Title: ${this.loadedData.drawingOptions.title}\n`;
        str += mapTitle;
        const layerTitle = 'Layers:\n';
        str += layerTitle;
        this.loadedData.drawingOptions.layers.forEach((layer, index) => {
          str += `\t${index + 1}. ${layer.name}\n`;
        });
        return str;
      }
    },
    // VuexストアからdrawingOptionsを取得し、設定します。
    drawingOptions: {
      get: function () {
        return this.$store.getters.drawingOptions;
      },
      set: function (value: DrawingOptions) {
        this.$store.commit('setDrawingOptions', value);
      },
    },
    // VuexストアからdefinedOptionsを取得し、設定します。
    definedOptions: {
      get: function () {
        return this.$store.getters.definedOptions;
      },
      set: function (value: DefinedOptions) {
        this.$store.commit('setDefinedOptions', value);
      },
    },
  },
  methods: {
    // ロードボタンがクリックされたときの処理を定義します。
    loading: function () {
      if (!this.loadedData) {
        throw new Error('Dropped an unexpected JSON Data');
      }
      this.loadedData.drawingOptions.id = uuid();
      for (let i = 0; i < this.loadedData.drawingOptions.layers.length; i++) {
        this.loadedData.drawingOptions.layers[i].id = uuid();
      }
      this.definedOptions = this.loadedData.definedOptions;
      this.drawingOptions = this.loadedData.drawingOptions;
      this.loadedData = undefined;
    },
  },
  mounted: function () {
    // ドロップゾーンに対するイベントリスナーを設定します。
    const dropzone = this.$el;

    // JSONファイルがドラッグされた際に, 無駄な処理を防ぐ
    [
      'drag',
      'dragstart',
      'dragend',
      'dragover',
      'dragenter',
      'dragleave',
    ].forEach((keyword) => {
      //@ts-ignore
      dropzone.addEventListener(keyword, (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
      });
    });

    //@ts-ignore
    dropzone.addEventListener('drop', (event: DragEvent) => {
      event.preventDefault();

      if (!event.dataTransfer) {
        throw new Error('Dropped data is unexpected.');
      }

      if (event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        const fileReader = new FileReader();
        fileReader.readAsText(file);
        fileReader.onload = () => {
          if (!fileReader.result) {
            throw new Error('Dropped an unexpected JSON Data');
          }
          this.loadedData = JSON.parse(fileReader.result as string);
        };
      } else {
        const data = event.dataTransfer?.getData('text/plain');
        if (!data) {
          throw new Error('Dropped an unexpected JSON Data');
        }
        this.loadedData = JSON.parse(data);
      }
    });
  },
});
</script>

<style scoped>
div#dropzone {
  width: 100%;
  height: 256px;
  background-color: gainsboro;
  border-color: black;
  border-width: 10px;
}
</style>
