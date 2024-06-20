import { View, Map } from 'ol';
// import { createXYZ } from 'ol/tilegrid';

// import { ViewerInterface } from './ViewerInterface';
import { LayerController } from '@/modules/layer/LayerController';
import { LayerCartesian } from '@/modules/layer/lib/layerCartesian';
import { LayerTypes } from '@/dcmwtconfType';
import { Coordinate } from 'ol/coordinate';
// import { getCenter } from 'ol/extent';
// import { get } from 'ol/proj';
import { Projection } from 'ol/proj';
import { ViewOptions } from 'ol/View';
import { getCenter } from 'ol/extent';
/**
 * viewerCartesianクラスは、Cartesianビューワーを管理します。
 */
export class viewerCartesian extends Map /*implements ViewerInterface*/ {
  /**
   * viewerCartesianクラスのコンストラクタ。
   * @param mapEl - マップ要素
   * @param zoomNativeLevel - ズームレベルの最小値と最大値
   * @param zoom - ズームレベル
   * @param center - 中心座標
   */
  constructor(
    mapEl: HTMLDivElement,
    zoomNativeLevel: { min: number; max: number },
    // @ts-ignore
    zoom: number,
    // @ts-ignore
    center: [number, number]
  ) {
    super({ target: mapEl, layers: new Array<LayerCartesian>() });

    const extent = [0, 0, 18200, 18200];
    const projection = new Projection({
      code: 'Cartesian',
      units: 'm',
      //extent,
    });

    const size = 18200 / 240;

    const resolutions = new Array<number>(
      zoomNativeLevel.max - zoomNativeLevel.min
    )
      .fill(0)
      .map((_, i) => size / Math.pow(2, i));
    //console.log(resolutions);
    const viewOption: ViewOptions = {
      projection: projection,
      resolutions: resolutions,
      resolution: size,
      center: getCenter(extent), //|| getCenter(projection.getExtent()),
      multiWorld: true,
    };

    const view = new View(viewOption);

    this.setView(view);
  }
  /**
   * レイヤーコントローラを登録します。
   * @param layerController - レイヤーコントローラ
   */
  public register = (layerController: LayerController) => {
    const layerAry = layerController.get() as LayerCartesian[];
    for (const layer of layerAry) {
      this.addLayer(layer);
    }
  };
  /**
   * レンダリング完了時のイベントリスナーを設定します。
   * @param eventListener - イベントリスナー
   */
  public set renderingCompleted(eventListener: () => void) {
    this.on('rendercomplete', eventListener);
  }
  /**
   * レイヤーを更新します。
   * @param layers - レイヤーの配列
   */
  public updateLayers = (layers: LayerTypes[]) => {
    //@ts-ignore
    const baseLayers: LayerProjection[] = this.getLayers().getArray();
    if (baseLayers.length !== layers.length) {
      return;
    }
    for (let i = 0; i < baseLayers.length; i++) {
      const layer = layers[i];
      if (baseLayers[i].name === layer.name) {
        if (baseLayers[i].show !== layer.show) {
          baseLayers[i].show = layer.show;
          break;
        }
        if (baseLayers[i].opacity !== layer.opacity) {
          baseLayers[i].opacity = layer.opacity;
          break;
        }
        if (layer.type === 'tone') {
          if (baseLayers[i].colorIndex !== layer.clrindex) {
            baseLayers[i].colorIndex = layer.clrindex;
            break;
          }
        } else if (layer.type === 'contour') {
          if (baseLayers[i].thresholdInterval !== layer.thretholdinterval) {
            baseLayers[i].thresholdInterval = layer.thretholdinterval;
            break;
          }
        } else if (layer.type === 'vector') {
          if (
            baseLayers[i].vectorInterval.x !== layer.vecinterval.x ||
            baseLayers[i].vectorInterval.y !== layer.vecinterval.y
          ) {
            baseLayers[i].vectorInterval = layer.vecinterval;
            break;
          }
        }
      } else {
        const j = baseLayers.map((l) => l.name).indexOf(layer.name);
        const updateLayer = baseLayers[i];
        if (i < j) {
          this.raise(updateLayer);
        } else {
          this.lower(updateLayer);
        }
        break;
      }
    }
  };

  /**
   * レイヤーの順序を下げます。
   * @param layer - レイヤー
   */
  private lower(layer: LayerCartesian) {
    const layers = this.getLayers();
    const layersAry = layers.getArray();
    for (let i = 0; i < layers.getLength(); i++) {
      if (i > 0 && (layersAry[i] as LayerCartesian).name === layer.name) {
        layers.remove(layer);
        layers.insertAt(i - 1, layer);
        break;
      }
    }
    this.setLayers(layers);
  }
  /**
   * レイヤーの順序を上げます。
   * @param layer - レイヤー
   */
  private raise(layer: LayerCartesian) {
    const layers = this.getLayers();
    const layersAry = layers.getArray();
    const maxIndex = layers.getLength() - 1;
    for (let i = 0; i < layers.getLength(); i++) {
      if (
        i < maxIndex &&
        (layersAry[i] as LayerCartesian).name === layer.name
      ) {
        layers.remove(layer);
        layers.insertAt(i + 1, layer);
        break;
      }
    }
    this.setLayers(layers);
  }
  /**
   * ズームレベルを取得します。
   * @returns ズームレベル
   */
  get zoom(): number {
    const zoom = this.getView().getZoom();
    if (zoom === undefined) {
      throw new Error('zoom is undefined');
    }
    return zoom;
  }
  /**
   * ズームレベルを取得します。
   * @returns ズームレベル
   */
  set zoom(value: number) {
    this.getView().setZoom(value);
  }
  /**
   * 中心座標を取得します。
   * @returns 中心座標
   */
  get center(): [number, number] {
    const center = this.getView().getCenter();
    if (!center) {
      throw new Error('center is undefined');
    }
    return center as [number, number];
  }
  /**
   * 中心座標を設定します。
   * @param value - 中心座標
   */
  set center(value: [number, number]) {
    this.getView().setCenter(value as Coordinate);
  }
}
