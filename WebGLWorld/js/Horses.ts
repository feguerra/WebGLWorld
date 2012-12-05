/// <reference path="../vendor/three.d.ts" />
/// <reference path="IModel.ts" />
/// <reference path="Horse.ts" />

class Horses implements IModel {
    private horses : Horse[];
    private _num_birds = 10;

    constructor () {
        this.horses = [];
        for (var i = 0; i < this._num_birds; i++) {
            var boid = this.horses[i] = new Horse();
            boid.setWorldSize(35 , 60);
        }
    }

    loadModel(scene, callback) {
        var count = 0;
        for (var i = 0; i < this._num_birds; i++) {
            var model_path = "models/horse.js";
            this.horses[i].loadModel(model_path, scene, () => { 
            });
        }
        var lazy_wait = () => {
            if (count < this._num_birds) { 
               setTimeout(lazy_wait, 1000);
            }
            else
                callback();
        }

        lazy_wait();
        
    }

    getModel() {
        throw new DOMException();
    }

    update(delta) {
        var il = this.horses.length;
        for (var i = 0; i < il; i++) {

            var horse = this.horses[i];
            if (horse.getModel() != undefined) {
                horse.update(delta);
            }
        }
    }
}