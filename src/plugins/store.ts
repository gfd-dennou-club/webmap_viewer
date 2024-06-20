import Vue from 'vue';
import Vuex from 'vuex';

import { DrawingOptions, DefinedOptions } from '../dcmwtconfType';
import { ViewerController } from '@/modules/viewer/ViewerController';

Vue.use(Vuex);
// ステートの型を定義します。
type State = {
  drawingOptions: DrawingOptions | undefined;
  definedOptions: DefinedOptions | undefined;
  viewerController: ViewerController | undefined;
};
// ステートの初期値を設定します。
const state: State = {
  drawingOptions: undefined,
  definedOptions: undefined,
  viewerController: undefined,
};
// ゲッターを定義します。これらはステートの値を取得するための関数です。
const getters = {
  drawingOptions: (state: State) => state.drawingOptions,
  definedOptions: (state: State) => state.definedOptions,
  viewerController: (state: State) => state.viewerController,
};
// ミューテーションを定義します。これらはステートの値を変更するための関数です。
const mutations = {
  // drawingOptionsの値を設定します。
  setDrawingOptions: (state: State, drawingOptions: DrawingOptions) => {
    state.drawingOptions = drawingOptions;
  },
  // definedOptionsの値を設定します。
  setDefinedOptions: (state: State, definedOptions: DefinedOptions) => {
    state.definedOptions = definedOptions;
  },
  // viewerControllerの値を設定します。
  setViewerController: (state: State, viewerController: ViewerController) => {
    state.viewerController = viewerController;
  },
};

const actions = {};
// Vuexストアを作成し、エクスポートします。
export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
});
