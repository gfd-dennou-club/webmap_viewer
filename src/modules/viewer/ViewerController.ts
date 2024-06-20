import { WmtsLibIdentifer } from '../utility/wmtsLibIdentifer';
import { Viewer3D } from './lib/viewer3D';
// import { viewerCartesian } from './lib/viewerCartesian';
import { ViewerProjection } from './lib/viewerProjection';

import { ProjCodes } from '../../components/DrawerContents/Drawer-figure/projection_lib';
/**
 * ViewerControllerクラスは、ビューワーの制御を行います。
 */
export class ViewerController {
  private readonly wli: WmtsLibIdentifer;
  private viewer: Viewer3D | ViewerProjection | undefined;
  /**
   * ViewerControllerクラスのコンストラクタ。
   * @param projCode - 投影コード
   * @param zoomNativeLevel - ズームレベルの最小値と最大値
   * @param zoom - ズームレベル
   * @param center - 中心座標
   */
  constructor(
    public projCode: ProjCodes,
    private readonly zoomNativeLevel: { min: number; max: number },
    private readonly zoom: number,
    private readonly center: [number, number]
  ) {
    if (this.projCode !== 'XY' && this.projCode !== '3d Sphere') {
      this.wli = new WmtsLibIdentifer('Projections');
    } else {
      this.wli = new WmtsLibIdentifer(this.projCode);
    }
  }
  /**
   * ビューワーを作成します。
   * @param mapEl - マップ要素
   * @returns ビューワー
   */
  public create = (mapEl: HTMLDivElement) => {
    this.viewer = this.getViewerWithSuitableLib(mapEl);
    return this.get();
  };
  /**
   * ビューワーを取得します。
   * @returns ビューワー
   */
  public get = (): Viewer3D | ViewerProjection | undefined => {
    return this.viewer;
  };
  /**
   * 適切なライブラリを使用してビューワーを取得します。
   * @param mapEl - マップ要素
   * @returns ビューワー
   */
  private getViewerWithSuitableLib = (mapEl: HTMLDivElement) => {
    const prop = [
      mapEl,
      this.projCode,
      this.zoomNativeLevel,
      this.zoom,
      this.center,
    ] as const;
    const xy = () => new ViewerProjection(...prop);
    const sphere = () => new Viewer3D(mapEl, this.center);
    const projections = () => new ViewerProjection(...prop);
    const suitableFunc = this.wli.whichLib(xy, sphere, projections);
    return suitableFunc();
  };
}
