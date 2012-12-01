/// <reference path="../vendor/three.d.ts" />

interface IModel {

    update(delta);

    loadModel(model_path, scene, callback);

    getModel();

}