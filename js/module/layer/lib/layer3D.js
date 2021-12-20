const layer3D = class extends Cesium.UrlTemplateImageryProvider{
    constructor(options){
        super(options);
        this._diagram = options.diagram;
        this._name = options.name;
    }

    // override
    requestImage(x, y, level){
        const urls = [];
        this._resource.forEach((ele) => {
            const url = ele.concat("/", level.toString(), "/", x.toString(), "/", y.toString(), ".png");
            urls.push(url);
        });

        const canvas = document.createElement("canvas");
        [canvas.width, canvas.height] = [this._tileWidth, this._tileHeight];

        const counterFunc = () => {
            return this._diagram.url2tile(urls[0], canvas);
        }

        const vectorFunc = () => {
            return this._diagram.urls2tile(urls, canvas);
        }

        return this._diagram.isCounter(counterFunc, vectorFunc)();
    }

    getName(){ return this._name; }
}