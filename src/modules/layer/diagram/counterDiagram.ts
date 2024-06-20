import * as contour from 'd3-contour';
import { geoPath, geoIdentity } from 'd3-geo';
import { Diagram } from './diagram';

/**
 * ContourDiagramクラスは、数値データに基づいて等高線図を描画します。
 */
export class ContourDiagram extends Diagram {
  public thresholdInterval: number;
  protected readonly mathMethod: (x: number) => number;

  /**
   * ContourDiagramクラスのコンストラクタ。
   * @param thresholdInterval - 等高線の間隔
   * @param mathMethod - 数値データを処理するための関数
   * @param minmax - 数値データの最小値と最大値
   */
  constructor(
    thresholdInterval: number,
    mathMethod: (x: number) => number,
    minmax: [number, number] | undefined
  ) {
    super(minmax);

    this.thresholdInterval = thresholdInterval;
    this.mathMethod = mathMethod;
  }

  /**
   * 数値データに基づいて等高線図を描画します。
   * @param data - 等高線図を描画するための数値データの配列
   * @param canvas - 等高線図を描画するキャンバス
   * @returns 等高線図が描画されたキャンバス
   */
  protected drawVisualizedDiagramBasedONNumData = (
    data: number[][],
    canvas: HTMLCanvasElement
  ): HTMLCanvasElement => {
    const context = canvas.getContext('2d')!;

    const processedData = data[0].map(this.mathMethod);

    const projection = geoIdentity().scale(1);
    const path = geoPath(projection, context);

    const thresholds = new Array<number>(this.thresholdInterval)
      .fill(0)
      .map(
        (_, i) =>
          this.minmax[0] +
          ((this.minmax[1] - this.minmax[0]) / this.thresholdInterval) * i
      );

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 1.5;

    for (const threshold of thresholds) {
      context.beginPath();
      const contours = contour.contours().size([canvas.width, canvas.height]);
      const object = contours.contour(processedData, threshold);
      path(object);
      context.stroke();
      context.closePath();
    }

    return canvas;
  };

  /**
   * 与えられたパラメータに基づいて等高線図を選択します。
   * @param tone - 図を選択するためのパラメータ
   * @param contour - 図を選択するためのパラメータ
   * @param vector - 図を選択するためのパラメータ
   * @returns 選択された図
   */
  // @ts-ignore
  public whichDiagram<T, U, V>(tone: T, contour: U, vector: V): T | U | V {
    return contour;
  }
}
