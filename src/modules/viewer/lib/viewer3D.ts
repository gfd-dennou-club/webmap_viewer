import { LayerTypes } from '@/dcmwtconfType';
import { Viewer, TileCoordinatesImageryProvider, Color } from 'cesium';
import Cartesian2 from 'cesium/Source/Core/Cartesian2';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Ellipsoid from 'cesium/Source/Core/Ellipsoid';
import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';
import { Layer3D } from '../../layer/lib/layer3D';
import { LayerController } from '../../layer/LayerController';
import { ViewerInterface } from './ViewerInterface';

export type ReturnedTypeIn3D = Viewer;
/**
 * Viewer3Dクラスは、3Dビューワーを管理します。
 */
export class Viewer3D extends Viewer implements ViewerInterface {
  /**
   * Viewer3Dクラスのコンストラクタ。
   * @param mapEl - マップ要素
   * @param center - 中心座標
   */
  constructor(mapEl: HTMLDivElement, center: [number, number]) {
    super(mapEl, {
      imageryProvider: new TileCoordinatesImageryProvider(),
      baseLayerPicker: false,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      timeline: false,
      animation: false,
      homeButton: false,
      vrButton: false,
      geocoder: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      skyBox: false,
      skyAtmosphere: false,
    });
    this.scene.backgroundColor = Color.WHITE;
    this.scene.globe.showGroundAtmosphere = false;
    this.center = center;
  }
  /**
   * レイヤーコントローラを登録します。
   * @param layerController - レイヤーコントローラ
   */
  public register = (layerController: LayerController) => {
    const imageryLayers = this.imageryLayers;
    const defaultLayer = imageryLayers.get(0);
    imageryLayers.remove(defaultLayer, false);

    const layerAry = layerController.get() as Layer3D[];
    for (const layer of layerAry) {
      const imageryLayer = new ImageryLayer(layer);
      imageryLayer.alpha = layer.opacity;
      imageryLayer.show = layer.show;
      imageryLayers.add(imageryLayer);
    }
  };
  /**
   * レイヤーを更新します。
   * @param layers - レイヤーの配列
   */
  public updateLayers = (layers: LayerTypes[]) => {
    const baseLayers = this.imageryLayers;
    if (baseLayers.length !== layers.length) {
      return;
    }
    for (let i = 0; i < baseLayers.length; i++) {
      const baseLayer = baseLayers.get(i).imageryProvider as Layer3D;
      if (baseLayer.name === layers[i].name) {
        const purposeLayer = baseLayers.get(i);
        const layer = layers[i];
        // updating show props
        if (purposeLayer.show !== layer.show) {
          baseLayers.remove(purposeLayer, false);
          purposeLayer.show = layer.show;
          baseLayers.add(purposeLayer, i);
          break;
        }
        // updating opacity props
        if (purposeLayer.alpha !== layer.opacity) {
          baseLayers.remove(purposeLayer, false);
          purposeLayer.alpha = layer.opacity;
          baseLayers.add(purposeLayer, i);
          break;
        }
        if (layer.type === 'tone') {
          if (
            (purposeLayer.imageryProvider as Layer3D).colorIndex !==
            layer.clrindex
          ) {
            baseLayers.remove(purposeLayer, false);
            (purposeLayer.imageryProvider as Layer3D).colorIndex =
              layer.opacity;
            baseLayers.add(purposeLayer, i);
            break;
          }
        } else if (layer.type === 'contour') {
          if (
            (purposeLayer.imageryProvider as Layer3D).thresholdInterval !==
            layer.thretholdinterval
          ) {
            baseLayers.remove(purposeLayer, false);
            (purposeLayer.imageryProvider as Layer3D).thresholdInterval =
              layer.thretholdinterval;
            baseLayers.add(purposeLayer, i);
            break;
          }
        } else if (layer.type === 'vector') {
          if (
            (purposeLayer.imageryProvider as Layer3D).vectorInterval.x !==
            layer.vecinterval.x ||
            (purposeLayer.imageryProvider as Layer3D).vectorInterval.y !==
            layer.vecinterval.y
          ) {
            baseLayers.remove(purposeLayer, false);
            (purposeLayer.imageryProvider as Layer3D).vectorInterval =
              layer.vecinterval;
            baseLayers.add(purposeLayer, i);
            break;
          }
        }
      } else {
        // swapping layers.
        const j = layers.map((l) => l.name).indexOf(baseLayer.name);
        const upLayer = baseLayers.get(i);
        if (i < j) {
          baseLayers.raise(upLayer);
        } else {
          baseLayers.lower(upLayer);
        }
        break;
      }
    }
    this.render();
  };
  /**
   * 固定値を変更します。
   * @param fixed - 固定値
   */
  public changeFixed = (fixed: string) => {
    const baseLayers = this.imageryLayers;
    const lenOfLayers = baseLayers.length;
    const lastLayer = baseLayers.get(lenOfLayers - 1);
    baseLayers.remove(lastLayer, false);
    (lastLayer.imageryProvider as Layer3D).fixed = fixed;
    baseLayers.add(lastLayer, lenOfLayers - 1);
    this.render();
  };
  /**
   * ズームレベルを取得します。
   * @returns ズームレベル
   */
  get zoom(): number {
    return 0;
  }
  /**
   * ズームレベルを設定します。
   * @param value - ズームレベル
   */
  set zoom(value: number) {
    value;
  }
  /**
   * 中心座標を取得します。
   * @returns 中心座標
   */
  get center(): [number, number] {
    const windowCenter = new Cartesian2(
      this.container.clientWidth / 2,
      this.container.clientHeight / 2
    );
    const pickRay = this.scene.camera.getPickRay(windowCenter)!;
    const pickPosition = this.scene.globe.pick(pickRay, this.scene)!;
    const pickPositionCartographic =
      this.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);
    const coord: [number, number] = [
      pickPositionCartographic.longitude * (180 / Math.PI),
      pickPositionCartographic.latitude * (180 / Math.PI),
    ];
    return coord;
  }
  /**
   * 中心座標を設定します。
   * @param value - 中心座標
   */
  set center(value: [number, number]) {
    this.camera.setView({
      destination: Cartesian3.fromDegrees(
        value[0],
        value[1],
        Ellipsoid.WGS84.cartesianToCartographic(this.camera.position).height
      ),
    });
  }
}
