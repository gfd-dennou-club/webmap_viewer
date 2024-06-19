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
   * Fetch Numerical Data Tile from specificated urls.
   *
   * @param urls - An Array of url to localtion stored Numerical Data Tile.
   * @param canvas - A canvases to drawing Numerical Data Tile.
   *
   * @returns A canvases to drawing Numerical Data Tile(same tile of param canvas).
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
          img.src = `https://dcw.kijiharu3112.workers.dev?path=${urls[i]}`;
        } catch (err) {
          reject(err);
        }
      });

      promises.push(promise);
    }

    return await Promise.all(promises);
  }

  /**
   * Get an array of Numerical Data from canvases drawn Numerical Data Tile.
   *
   * @param canvas - A canvas to drawing final data.
   *
   * @returns an array of Numerical Data.
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
   *
   * Draw specific diagram to the canvas passed the second parameter based on datas that the first parameter,
   *
   * @param datas - an array of Numerical Data to drawing specific diagram. specifical diagram is drawn based on this data.
   * @param canvas - a HTML Canvas Element to drawing specifical diagram.
   *
   * @returns A HTML Canvas Element drawn specifical diagram
   * */
  protected abstract drawVisualizedDiagramBasedONNumData(
    datas: number[][],
    canvas: HTMLCanvasElement
  ): HTMLCanvasElement;

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

  public abstract whichDiagram<T, U, V>(
    tone: T,
    contour: U,
    vector: V
  ): T | U | V;
}
