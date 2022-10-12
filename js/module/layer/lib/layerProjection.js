const layerProjection = class extends ol.layer.Tile{
    constructor(options){
        super({});
        this.options = options;

        const xyz_options = {
            tileUrlFunction: this._tileUrlFunction,
            tileLoadFunction: this._tileLoadFunction,
            maxZoom: this.options.maxZoom,
            minZoom: this.options.minZoom,
            projection: 'EPSG:3857',
            tileSize: [
                this.options.size.X,
                this.options.size.Y
            ],
            wrapX: true,
        };


        const source = new ol.source.XYZ(xyz_options);
        this.setExtent([-20026376.39, -20048966.10, 20026376.39, 20048966.10]);
        // source.setRenderReprojectionEdges(true)
        this.setSource(source);
    }

    _tileUrlFunction = (coord) => {
        const Z = 0, X = 1, Y = 2;
        const url = this.options.url.map(v => v.concat(`/${coord[Z]}/${coord[X]}/${coord[Y]}.png`));
        return url;
    }

    _tileLoadFunction = async (imageTile, url) => {
        const canvas = document.createElement("canvas");
        [canvas.width, canvas.height] = [this.options.size.X, this.options.size.Y];

        const toneFunc = async () => {
            await this.options.diagram.url2canvas(url[0], canvas);
        }

        const vectorFunc = async () => {
            await this.options.diagram.urls2canvas(url, canvas);
        }

        await this.options.diagram.isTone(toneFunc, vectorFunc)();
        imageTile.getImage().src = canvas.toDataURL();
    }
}