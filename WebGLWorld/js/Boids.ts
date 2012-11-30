/// <reference path="../vendor/three.d.ts" />
/// <reference path="IModel.ts" />
/// <reference path="Bird.ts" />

class Boids implements IModel {
    private boids : Bird[];
    private _num_birds = 3;

    constructor () {
        this.boids = [];

        for (var i = 0; i < this._num_birds; i++) {

            var boid = this.boids[i] = new Bird();
            boid.position.x = Math.random() * 400 - 200;
            boid.position.y = Math.random() * 400 - 200;
            boid.position.z = Math.random() * 400 - 200;
            boid.velocity.x = Math.random() * 2 - 1;
            boid.velocity.y = Math.random() * 2 - 1;
            boid.velocity.z = Math.random() * 2 - 1;
            boid.setAvoidWalls(true);
            boid.setWorldSize(500, 500, 400);
            //boid.loadModel();
            //scene.add(boid.getModel());
        }
    }

    loadModel(scene, callback) {
        var count = 0;
        for (var i = 0; i < this._num_birds; i++) {
            this.boids[i].loadModel(scene, () => { 
                count++; 
            });
        }

        // funcion que espera a que todos los modelos carguen
        var lazy_wait = () => {
            if (count < this._num_birds)
                setTimeout(lazy_wait, 1000);
            else
                callback();
        }

        lazy_wait();
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
                bird.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
                bird.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length());
                boid.update(delta);
            }
        }
    }
}