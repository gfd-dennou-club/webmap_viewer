import L from "leaflet";

import layerManager3D from "./lib/layerManager3D";
import layerManagerCartesian from "./lib/layerManagerCartesian";
import layerManagerProjection from "./lib/layerManagerProjection";

import layer from '../layer/layer';
import { contourDiagram } from '../layer/diagram/diagram';

const layerManager = class{
    constructor(wmtsLibIdentifer, viewer){
        this.wmtsLibIdentifer = wmtsLibIdentifer;

        // レイヤの元となるものを取得
        const original_layer = this._getOriginalLayer(viewer);

        // ライブラリに適したLayerManagerを取ってくる
        this.layer_manager = this._getLayerManager(original_layer);

        this.layer_props = [];
    }

    addBaseLayer = (layer, name) => {
        const layer_props = layer.getProps();
        if ( !this.layer_props.includes(layer_props) ) {
            this.layer_props.push(layer_props);
        }

        const baselayer = layer.create(this.wmtsLibIdentifer);
        this.layer_manager.addBaseLayer(baselayer, name);
    }

    addLayer = (_layer, name, alpha = 1.0, show = true) => {
        const overlaylayer = _layer.create(this.wmtsLibIdentifer); 
        this.layer_manager.addLayer(overlaylayer, name, alpha, show);

        // if ( _layer.diagram.isTone() ){
        //     const options = { 
        //         ..._layer.options, 
        //         name: _layer.options.name.concat("_contour"),
        //         diagram: new contourDiagram() 
        //     };
        //     _layer = new layer(options);
        //     const contourlayer = _layer.create(this.wmtsLibIdentifer);
        //     this.layer_manager.addLayer(contourlayer, options.name, alpha, show);
        // }
    }

    getLayers = () => {
        return this.layer_manager.getLayers();
    }

    getBaseLayers = () => {
        return this.layer_manager.getBaseLayers();
    }

    setup = (viewer) => {
        this.layer_manager.setup(viewer);
        return this.layer_props;
    }

    update = () => {
        this.layer_manager.update();
    }

    remove = (layer) => {
        this.layer_manager.remove(layer);
    }

    add = (layer, index) => {
        this.layer_manager.add(layer, index);
    }

    raise = (layer) => {
        this.layer_manager.raise(layer);
    }

    lower = (layer) => {
        this.layer_manager.lower(layer);
    }

    _getOriginalLayer = (viewer) => {
        const cesium = viewer.imageryLayers;
        const leaflet = new L.control.layers();
        const openlayers = viewer;
        return this.wmtsLibIdentifer.whichLib(cesium, leaflet, openlayers);
    }

    _getLayerManager = (original_layer) => {
        const cesium = () => new layerManager3D(original_layer);
        const leaflet = () => new layerManagerCartesian(original_layer);
        const openlayers = () => new layerManagerProjection(original_layer);
        const suitableFunc = this.wmtsLibIdentifer.whichLib(cesium, leaflet, openlayers);
        return suitableFunc();
    }
}

export default layerManager;