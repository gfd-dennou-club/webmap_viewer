import TileLayer from 'ol/layer/Tile';
import XYZ, { Options } from 'ol/source/XYZ';
import { get } from 'ol/proj';
import { createXYZ } from 'ol/tilegrid';
import { Diagram } from '../diagram/diagram';
import { TileCoord } from 'ol/tilecoord';
import Tile, { LoadFunction, UrlFunction } from 'ol/Tile';
import { ImageTile } from 'ol';
import { LayerInterface } from './LayerInterface';
/**
 * LayerProjectionクラスは、XYZソースを使用してタイルレイヤーを作成します。
 */
export class LayerProjection extends TileLayer<XYZ> implements LayerInterface {
  public minmax: [number, number] | undefined;
  /**
   * LayerProjectionクラスのコンストラクタ。
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
    private readonly tileSize: { x: number; y: number },
    zoomLevel: { min: number; max: number },
    show: boolean,
    opacity: number,
    private readonly diagram: Diagram
  ) {
    super({
      visible: show,
      opacity: opacity,
    });

    const projection = get('EPSG:3857');

    if (!projection) {
      throw new Error('projection is null');
    }

    const defaultTileGrid = createXYZ({
      extent: projection.getExtent(),
      minZoom: zoomLevel.min,
      maxZoom: zoomLevel.max,
      //@ts-ignore
      tileSize: this.tileSize,
    });

    const xyz_options: Options = {
      url: '',
      tileUrlFunction: this.tileUrlFunction,
      tileLoadFunction: this.tileLoadFunction,
      tileGrid: defaultTileGrid,
      crossOrigin: 'Anonymous',
      wrapX: true,
    };
    const xyz = new XYZ(xyz_options);

    this.setExtent(projection.getExtent());
    this.setSource(xyz);
  }
  /**
   * タイルのURLを生成します。
   * @param coord - タイル座標
   * @returns タイルのURL
   */
  private tileUrlFunction: UrlFunction = (coord: TileCoord) => {
    const [Z, X, Y] = [0, 1, 2];
    return `/${this.fixed}/${coord[Z]}/${coord[X]}/${coord[Y]}.png`;
  };
  /**
   * タイルをロードします。
   * @param imageTile - イメージタイル
   * @param url - タイルのURL
   */
  private tileLoadFunction: LoadFunction = async (
    imageTile: Tile,
    url: string
  ) => {
    const canvas = document.createElement('canvas');
    // @ts-ignore
    [canvas.width, canvas.height] = this.tileSize;

    const url_ary = this.urls.map((v) => v.concat(url));
    const drawnCanvas = await this.diagram.draw(url_ary, canvas);
    const image = (imageTile as ImageTile).getImage() as HTMLImageElement;
    image.src = drawnCanvas.toDataURL();
  };
  /**
   * 透明度を設定します。
   * @param value - 透明度
   */
  set opacity(value: number) {
    this.setOpacity(value);
  }
  /**
   * 透明度を取得します。
   * @returns 透明度
   */
  get opacity(): number {
    return this.getOpacity();
  }
  /**
   * 表示状態を設定します。
   * @param value - 表示状態
   */
  set show(value: boolean) {
    this.setVisible(value);
  }
  /**
   * 表示状態を取得します。
   * @returns 表示状態
   */
  get show(): boolean {
    return this.getVisible();
  }
  /**
   * 色インデックスを設定します。
   * @param value - 色インデックス
   */
  set colorIndex(value: number) {
    if (!this.diagram.colorIndex) {
      throw new Error("Shouldn't adapt to this layer");
    }
    //@ts-ignore
    this.diagram.changeColorMap(value);
    const source = this.getSource();
    source?.refresh();
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
    if (!this.diagram.thresholdInterval) {
      throw new Error("Shouldn't call to this layer");
    }
    this.diagram.thresholdInterval = value;
    const source = this.getSource();
    source?.refresh();
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
    if (!this.diagram.vectorInterval) {
      throw new Error("Shouldn't call to this layer");
    }
    this.diagram.vectorInterval = value;
    const source = this.getSource();
    source?.refresh();
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
