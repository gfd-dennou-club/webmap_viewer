import { Diagram } from './diagram';
import { Clrmap, ColorMap } from '../../utility/colormap/colormap';
/**
 * ToneDiagramクラスは、数値データに基づいて色調図を描画します。
 */
export class ToneDiagram extends Diagram {
  public colorIndex: number;
  private colormap: Clrmap[];
  private readonly mathMethod: (x: number) => number;

  /**
   * ToneDiagramクラスのコンストラクタ。
   * @param colorIndex - 色調図の色インデックス
   * @param mathMethod - 数値データを処理するための関数
   * @param minmax - 数値データの最小値と最大値
   */
  constructor(
    colorIndex: number,
    mathMethod: (x: number) => number,
    minmax?: [number, number]
  ) {
    super(minmax);

    this.colorIndex = colorIndex;
    this.colormap = new ColorMap(colorIndex).getClrmap();
    this.mathMethod = mathMethod;
  }

  /**
   * 色調図の色マップを変更します。
   * @param colorIndex - 新しい色インデックス
   */
  public changeColorMap(colorIndex: number) {
    this.colorIndex = colorIndex;
    this.colormap = new ColorMap(colorIndex).getClrmap();
  }

  /**
   * 数値データに基づいて色調図を描画します。
   * @param datas - 色調図を描画するための数値データの配列
   * @param canvas - 色調図を描画するキャンバス
   * @returns 色調図が描画されたキャンバス
   */
  protected drawVisualizedDiagramBasedONNumData = (
    datas: number[][],
    canvas: HTMLCanvasElement
  ): HTMLCanvasElement => {
    let imageData = new ImageData(canvas.width, canvas.height);

    for (let i = 0; i < canvas.height * canvas.width; i++) {
      const bias_index = i * 4;
      const data = this.mathMethod(datas[0][i]);
      const clrmap = this.getClrMap(data);
      imageData.data[bias_index + 0] = clrmap.r;
      imageData.data[bias_index + 1] = clrmap.g;
      imageData.data[bias_index + 2] = clrmap.b;
      imageData.data[bias_index + 3] = 255;
    }

    const context = canvas.getContext('2d')!;
    context.putImageData(imageData, 0, 0);

    return canvas;
  };

  /**
   * 数値データに対応する色マップを取得します。
   * @param data - 色マップを取得するための数値データ
   * @returns 対応する色マップ
   */
  private getClrMap = (data: number): Clrmap => {
    const colormap_per_scalardata =
      this.colormap.length / (this.minmax[1] - this.minmax[0]);
    const colormap_index = Math.round(
      colormap_per_scalardata * (data - this.minmax[0])
    );

    // 読み込み失敗時は白を返す
    if (data === 0.0) {
      return { r: 255, g: 255, b: 255 };
    } else if (this.colormap.length <= colormap_index) {
      return this.colormap[this.colormap.length - 1];
    } else if (0 > colormap_index) {
      return this.colormap[0];
    } else {
      return this.colormap[colormap_index]; // それ以外は対応する色を返す
    }
  };

  /**
   * 与えられたパラメータに基づいて色調図を選択します。
   * @param tone - 図を選択するためのパラメータ
   * @param contour - 図を選択するためのパラメータ
   * @param vector - 図を選択するためのパラメータ
   * @returns 選択された図
   */
  //@ts-ignore
  public whichDiagram<T, U, V>(tone: T, contour: U, vector: V): T | U | V {
    return tone;
  }
}
