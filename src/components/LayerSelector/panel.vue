<template>
  <v-card>
    <v-container>
      <v-row dense>
        <v-col v-for="(layer, index) in layers" :key="index" cols="12">
          <v-card>
            <v-card-text>
              <div style="display: flex">
                <v-switch
                  v-model="layer.show"
                  inset
                  style="float: left; margin: 0; padding: 0"
                />
                {{ layer.name }}
                <div style="margin-left: auto">
                  <v-btn
                    icon
                    x-small
                    v-show="canRaise(index)"
                    @click="raise(index)"
                    color="primary"
                  >
                    ▲
                  </v-btn>
                  <v-btn
                    icon
                    x-small
                    v-show="canLower(index)"
                    @click="lower(index)"
                    color="primary"
                  >
                    ▼
                  </v-btn>
                </div>
              </div>
              opacity = {{ layer.opacity }}
              <v-slider
                min="0"
                max="1"
                step="0.1"
                hide-details
                v-model="layer.opacity"
              />
              <div v-if="layer.type === 'contour'">
                threshold interval = {{ layer.thretholdinterval }}
                <v-slider
                  min="0"
                  max="20"
                  hide-details
                  v-model="layer.thretholdinterval"
                />
              </div>
              <div v-if="layer.type === 'tone'">
                color map
                <v-dialog v-model="dialog" scrollable max-width="500px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      x-small
                      outlined
                      tile
                      color="primary"
                      v-bind="attrs"
                      v-on="on"
                      style="display: flex; margin-left: auto"
                    >
                      Change color map
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title> カラーマップの切り替え </v-card-title>
                    <v-card-text>
                      <DcwmtColormap ref="colormap" />
                    </v-card-text>
                    <v-card-actions>
                      <v-btn color="blue darken-1" text @click="close">
                        Close
                      </v-btn>
                      <v-btn color="blue darken-1" text @click="save(index)">
                        Save
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <div style="text-align: center">
                  <ColorBar
                    :width="200"
                    :height="25"
                    :clrindex="layer.clrindex"
                    :style="colorBarSize"
                  />
                </div>
              </div>
              <div v-if="layer.type === 'vector'">
                vector interval = { x: {{ layer.vecinterval.x }}, y:
                {{ layer.vecinterval.y }} }
                <v-slider
                  min="0"
                  max="10"
                  hide-details
                  v-model="layer.vecinterval.x"
                />
                <v-slider
                  min="0"
                  max="10"
                  hide-details
                  v-model="layer.vecinterval.y"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { LayerTypes } from '@/dcmwtconfType';
import ColorBar from '../DrawerContents/Drawer-colormap/Colorbar.vue';
import DcwmtColormap from '../DrawerContents/Drawer-colormap/Drawer-colormap.vue';
import Vue from 'vue';

export default Vue.extend({
  components: { ColorBar, DcwmtColormap },
  data() {
    return {
      // ダイアログの表示/非表示を管理するデータプロパティ
      dialog: false,
    };
  },
  methods: {
    // レイヤーの順序を上げることができるかどうかを判定するメソッド
    canRaise: function (index: number) {
      return index > 0;
    },
    // レイヤーの順序を下げることができるかどうかを判定するメソッド
    canLower: function (index: number) {
      return index >= 0 && index < this.layers.length - 1;
    },
    // レイヤーの順序を上げるメソッド
    raise: function (index: number) {
      const tmpLayer = this.layers[index];
      this.$set(this.layers, index, this.layers[index - 1]);
      this.$set(this.layers, index - 1, tmpLayer);
    },
    // レイヤーの順序を下げるメソッド
    lower: function (index: number) {
      const tmpLayer = this.layers[index];
      this.$set(this.layers, index, this.layers[index + 1]);
      this.$set(this.layers, index + 1, tmpLayer);
    },
    // ダイアログを閉じるメソッド
    close: function () {
      this.dialog = false;
    },
    // カラーマップの変更を保存するメソッド
    save: function (layerIndex: number) {
      const layer = this.layers[layerIndex];
      //@ts-ignore
      const selected = this.$refs.colormap[0].selected;
      if (layer.type === 'tone' && isFinite(selected)) {
        layer.clrindex = selected;
        this.$set(this.layers, layerIndex, layer);
      }
      this.dialog = false;
    },
  },
  computed: {
    // Vuexストアからレイヤーの情報を取得し、設定します。
    layers: {
      get: function (): LayerTypes[] {
        return this.$store.getters.drawingOptions.layers;
      },
      set: function (value: LayerTypes[]) {
        const drawingOptions = this.$store.getters.drawingOptions;
        const layers = value;
        this.$store.commit('setDrawingOptions', {
          ...drawingOptions,
          layers,
        });
      },
    },
    // カラーバーのサイズを定義します。
    colorBarSize: function () {
      return {
        width: '80%',
        height: '20%',
        marginTop: '10px',
      };
    },
  },
});
</script>

<style scoped>
.v-card {
  background: rgba(255, 255, 255, 0.8) !important;
  border-radius: 4px;
}
</style>
