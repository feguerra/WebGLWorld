/// <reference path="../vendor/three.d.ts" />
/// <reference path="IModel.ts" />
/// <reference path="Bird.ts" />

class Boids implements IModel {
    private boids : Bird[];
    private _num_birds =5;

    constructor () {
        this.boids = [];

        for (var i = 0; i < this._num_birds; i++) {

            var boid = this.boids[i] = new Bird();
            boid.position.x = Math.random() * 500 - 250;
            boid.position.y = Math.random() * 500 - 250;
            boid.position.z = Math.random() * 500 - 250;
            boid.velocity.x = Math.random() * 1 - 0.5;
            boid.velocity.y = Math.random() * 1 - 0.5;
            boid.velocity.z = Math.random() * 1 - 0.5;
            boid.setAvoidWalls(true);
            boid.setGoal(new THREE.Vector3());
            boid.setWorldSize(1500 , 1500, 1500);
        }
    }

    loadModel(scene, callback) {
        var count = 0;
        for (var i = 0; i < this._num_birds; i++) {
            var model_path = "models/MarioBros/mario_main.js";
            var r = Math.random();
            if(r<0.3)
                model_path = "models/MarioBros/mario_fire.js";
            else if(r>=0.25 && r<0.5)
                model_path = "models/MarioBros/mario_mime.js";

            this.boids[i].loadModel(model_path, scene, () => { 
                count++; 
                var bar_width = count / this._num_birds * 100;
                $("#models_bar").attr("style", "width: "+bar_width+"%;");
            });
        }
        // funcion que espera a que todos los modelos carguen
        var lazy_wait = () => {
            if (count < this._num_birds) { 
               setTimeout(lazy_wait, 1000);
            }
            else
                callback();
        }

        lazy_wait();
        //callback();
        /**/
    }

    getModel() {
        throw new DOMException();
    }

    update(delta) {
        var il = this.boids.length;
        for (var i = 0; i < il; i++) {

            var boid = this.boids[i];
            boid.run(this.boids);

            var bird = boid.getModel();
            
            if (bird != undefined) {
                boid.update(delta);
            }
        }
    }
}