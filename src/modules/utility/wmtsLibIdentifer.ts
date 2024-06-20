const wmtsLibTypes = ['XY', '3d Sphere', 'Projections'] as const;
export type WMTSLibType = typeof wmtsLibTypes[number];
/**
 * WmtsLibIdentiferクラスは、WMTSライブラリのタイプを識別します。
 */
export class WmtsLibIdentifer {
  /**
   * WmtsLibIdentiferクラスのコンストラクタ。
   * @param libtype - WMTSライブラリのタイプ
   */
  constructor(private readonly libtype: WMTSLibType) {}

  /**
   * ライブラリタイプに基づいて適切なライブラリを選択します。
   * @param xy - XYライブラリ
   * @param sphere - 3d Sphereライブラリ
   * @param projection - Projectionsライブラリ
   * @returns 選択されたライブラリ
   */
  whichLib = <T, U, V>(xy: T, sphere: U, projection: V): T | U | V => {
    switch (this.libtype) {
      case 'XY':
        return xy;
      case '3d Sphere':
        return sphere;
      case 'Projections':
        return projection;
    }
  };
}
