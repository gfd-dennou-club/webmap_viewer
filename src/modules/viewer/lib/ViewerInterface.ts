import { LayerTypes } from '@/dcmwtconfType';
import { LayerController } from '../../layer/LayerController';
/**
 * ViewerInterfaceは、ビューワーのインターフェースを定義します。
 * このインターフェースは、ビューワーが持つべき基本的な機能を定義します。
 */
export interface ViewerInterface {
  /**
   * 表示したいレイヤー群の登録
   *
   * @param {LayerController} layerController
   */
  register(layerController: LayerController): void;
  /**
   * レイヤー群の更新
   *
   * @param {LayerTypes[]} layers
   */
  updateLayers(layers: LayerTypes[]): void;
  /**
   * ビューワーの拡大率を取得または設定します。
   */
  zoom: number;
  // 画面の中央座標
  /**
   * ビューワーの画面の中央座標を取得または設定します。
   */
  center: [number, number];
}
