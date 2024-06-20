import { DefinedOptions, DrawingOptions } from "@/dcmwtconfType";
// ConfFileReaderクラスは、設定ファイルを読み込むためのクラスです。
export class ConfFileReader {
    constructor(
        private readonly path: string,
    ){}
  // readメソッドは、設定ファイルを非同期に読み込みます。
  public read = async() => {
       const promise = new Promise<{
        definedOptions: DefinedOptions;
        drawingOptions: DrawingOptions;
      }>((resolve, reject) => {
        try {
          // XMLHttpRequestを使用して設定ファイルを読み込みます。
          const request = new XMLHttpRequest();
          request.open('GET', this.path);
          request.responseType = 'json';
          request.send();
          request.onload = () => {
            // 読み込んだ設定ファイルの内容を解析し、定義オプションと描画オプションを取得します。
            resolve({
              definedOptions: request.response.definedOptions as DefinedOptions,
              drawingOptions: request.response.drawingOptions as DrawingOptions,
            });
          };
        } catch (err) {
          // エラーが発生した場合は、エラーを投げます。
          reject(new Error(err as string));
        }
      });

      return await promise; 
    }
}