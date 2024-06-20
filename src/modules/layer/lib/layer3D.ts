import { UrlTemplateImageryProvider } from 'cesium';
import { Diagram } from '../diagram/diagram';
import { LayerInterface } from './LayerInterface';

/**
 * Layer3Dクラスは、3Dレイヤーを提供します。
 * UrlTemplateImageryProviderとLayerInterfaceを拡張します。
 */
export class Layer3D
  extends UrlTemplateImageryProvider
  implements LayerInterface
{
  public minmax: [number, number] | undefined;
  /**
   * Layer3Dクラスのコンストラクタ。
   * @param name - レイヤーの名前
   * @param urls - レイヤーのURLの配列
   * @param fixed - 固定値
   * @param tileSize - タイルのサイズ
   * @param zoomLevel - ズームレベルの最小値と最大値
   * @param show - レイヤーの表示状態
   * @param opacity - レイヤーの透明度
   * @param diagram - ダイアグラムオブジェクト
   */
  constructor(
    public readonly name: string,
    private readonly urls: string[],
    public fixed: string,
    tileSize: { x: number; y: number },
    zoomLevel: { min: number; max: number },
    public show: boolean,
    opacity: number,
    private readonly diagram: Diagram
  ) {
    const options: UrlTemplateImageryProvider.ConstructorOptions = {
      url: '',
      tileWidth: tileSize.x,
      tileHeight: tileSize.y,
      maximumLevel: zoomLevel.max,
      minimumLevel: zoomLevel.min,
    };
    super(options);

    this.opacity = opacity;
  }

  /**
   * 画像をリクエストします。
   * @param x - x座標
   * @param y - y座標
   * @param level - レベル
   * @returns 描画されたキャンバス
   */
  public requestImage(x: number, y: number, level: number) {
    const urls = new Array<string>();
    for (const url of this.urls) {
      console.log(this.fixed);
      urls.push(url.concat(`/${this.fixed}/${level}/${x}/${y}.png`));
    }

    const canvas = document.createElement('canvas');
    [canvas.width, canvas.height] = [this.tileWidth, super.tileHeight];

    const drawnCanvas = this.diagram.draw(urls, canvas);
    return drawnCanvas;
  }
  /**
   * 透明度を設定します。
   * @param value - 透明度
   */
  set opacity(value: number) {
    this.defaultAlpha = value;
  }
  /**
   * 透明度を取得します。
   * @returns 透明度
   */
  get opacity(): number {
    if (!this.defaultAlpha) {
      throw new Error("Don't has alpha channel this layer");
    }
    return this.defaultAlpha;
  }
  /**
   * 色インデックスを設定します。
   * @param value - 色インデックス
   */
  set colorIndex(value: number) {
    //@ts-ignore
    this.diagram.changeColorMap(value);
  }
  /**
   * 色インデックスを取得します。
   * @returns 色インデックス
   */
  get colorIndex() {
    if (!this.diagram.colorIndex) {
      throw new Error("Shouldn't call to this layer");
    }
    return this.diagram.colorIndex;
  }
  /**
   * 閾値間隔を設定します。
   * @param value - 閾値間隔
   */
  set thresholdInterval(value: number) {
    this.diagram.thresholdInterval = value;
  }
  /**
   * 閾値間隔を取得します。
   * @returns 閾値間隔
   */
  get thresholdInterval() {
    if (!this.diagram.thresholdInterval) {
      throw new Error("Shouldn't call to this layer");
    }
    return this.diagram.thresholdInterval;
  }
  /**
   * ベクトル間隔を設定します。
   * @param value - ベクトル間隔
   */
  set vectorInterval(value: { x: number; y: number }) {
    this.diagram.vectorInterval = value;
  }
  /**
   * ベクトル間隔を取得します。
   * @returns ベクトル間隔
   */
  get vectorInterval() {
    if (!this.diagram.vectorInterval) {
      throw new Error("Shouldn't call to this layer");
    }
    return this.diagram.vectorInterval;
  }
}
