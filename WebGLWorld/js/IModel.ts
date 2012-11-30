/// <reference path="../vendor/three.d.ts" />

interface IModel {

    update(delta);

    loadModel(scene, callback);

    getModel();

}