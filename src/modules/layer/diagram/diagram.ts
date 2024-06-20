export abstract class Diagram {
  protected minmax: [number, number];
  public colorIndex?: number;
  public thresholdInterval?: number;
  public vectorInterval?: { x: number; y: number };

  constructor(minmax?: [number, number]) {
    if (!minmax || (minmax[0] === 0 && minmax[1] === 0)) {
      this.minmax = [Infinity, -Infinity];
    } else {
      this.minmax = minmax;
    }
  }

  /**
   * 画像を取得し、それぞれの画像をキャンバスに描画します。
   * @param urls - 取得する画像のURLの配列
   * @param size - 描画するキャンバスのサイズ
   * @returns 描画されたキャンバスの配列
   */
  private async fetchImages(
    urls: string[],
    size: { width: number; height: number }
  ): Promise<HTMLCanvasElement[]> {
    const canvases = new Array<HTMLCanvasElement>(urls.length);
    const promises = new Array<Promise<HTMLCanvasElement>>();

    for (let i = 0; i < urls.length; i++) {
      canvases[i] = document.createElement('canvas');
      canvases[i].width = size.width;
      canvases[i].height = size.height;
      const context = canvases[i].getContext('2d')!;

      const promise = new Promise<HTMLCanvasElement>((resolve, reject) => {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.width = size.width;
          img.height = size.height;
          img.onload = () => {
            context.drawImage(img, 0, 0);
            resolve(canvases[i]);
          };
          // CROS対策に、別の所を噛ませている
          img.src = `https://dcw.kijiharu3112.workers.dev/?path=${urls[i]}`;
        } catch (err) {
          reject(err);
        }
      });

      promises.push(promise);
    }

    return await Promise.all(promises);
  }

  /**
   * キャンバスから数値データを取得します。
   * @param canvas - 数値データを取得するキャンバス
   * @returns 数値データの配列
   */
  private getNumData(canvas: HTMLCanvasElement): number[] {
    const context = canvas.getContext('2d')!;

    const rgba = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const dataView = new DataView(new ArrayBuffer(32));
    const datas = new Array<number>();
    const isCalcMinMax = !isFinite(this.minmax[0]);

    for (let i = 0; i < canvas.width * canvas.height; i++) {
      // Get RGB value of each pixel from Numerical Data Tile
      const bias_index = i * 4;
      const red = rgba[bias_index] << 24;
      const green = rgba[bias_index + 1] << 16;
      const blue = rgba[bias_index + 2] << 8;
      dataView.setUint32(0, red + green + blue);
      const data = dataView.getFloat32(0);

      // Calculate minmax, if this.range is not specified.
      if (isCalcMinMax) {
        if (data < this.minmax[0]) {
          this.minmax[0] = data;
        }
        if (data > this.minmax[1]) {
          this.minmax[1] = data;
        }
      }

      datas.push(data);
    }

    return datas;
  }

  /**
   * 数値データに基づいて特定の図を描画します。
   * @param datas - 図を描画するための数値データの配列
   * @param canvas - 図を描画するキャンバス
   * @returns 図が描画されたキャンバス
   */
  protected abstract drawVisualizedDiagramBasedONNumData(
    datas: number[][],
    canvas: HTMLCanvasElement
  ): HTMLCanvasElement;

  /**
   * 画像を取得し、それぞれの画像から数値データを取得し、その数値データに基づいて図を描画します。
   * @param urls - 取得する画像のURLの配列
   * @param canvas - 図を描画するキャンバス
   * @returns 図が描画されたキャンバス
   */
  public async draw(
    urls: string[],
    canvas: HTMLCanvasElement
  ): Promise<HTMLCanvasElement> {
    const size = { width: canvas.width, height: canvas.height };
    const imgs = await this.fetchImages(urls, size);

    const datas = imgs.map((img) => this.getNumData(img));

    const visualizedDiagram = this.drawVisualizedDiagramBasedONNumData(
      datas,
      canvas
    );

    return visualizedDiagram;
  }

  /**
   * 画像を取得し、それぞれの画像から数値データを取得し、その数値データの最小値と最大値を計算します。
   * @param urls - 取得する画像のURLの配列
   * @param canvas - 数値データを取得するキャンバス
   * @returns 数値データの最小値と最大値
   */
  public calcMinMax = async (
    urls: string[],
    canvas: HTMLCanvasElement
  ): Promise<[number, number]> => {
    if (isFinite(this.minmax[0])) {
      return new Promise((resolve) => resolve(this.minmax));
    }
    const size = { width: canvas.width, height: canvas.height };
    const imgs = await this.fetchImages(urls, size);

    imgs.map((img) => this.getNumData(img));
    return new Promise((resolve) => resolve(this.minmax));
  };

  /**
   * 与えられたパラメータに基づいて特定の図を選択します。
   * @param tone - 図を選択するためのパラメータ
   * @param contour - 図を選択するためのパラメータ
   * @param vector - 図を選択するためのパラメータ
   * @returns 選択された図
   */
  public abstract whichDiagram<T, U, V>(
    tone: T,
    contour: U,
    vector: V
  ): T | U | V;
}
