/// <reference path="../vendor/three.d.ts" />
/// <reference path="IModel.ts" />
/// <reference path="Bird.ts" />

class Boids implements IModel {
    private boids : Bird[];
    private _num_birds = 300;

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

    loadModel(scene) {
        for (var i = 0; i < this._num_birds; i++) {
            this.boids[i].loadModel();
            scene.add(this.boids[i].getModel());
        }
    }

    getModel() {
        throw new DOMException();
    }

    update() {
        for (var i = 0, il = this.boids.length; i < il; i++) {

            var boid = this.boids[i];
            boid.run(this.boids);

            var bird = this.boids[i].getModel();

            var color = bird.material.color;
            color.r = color.g = color.b = (500 - bird.position.z) / 1000;

            bird.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
            bird.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length());

            bird.phase = (bird.phase + (Math.max(0, bird.rotation.z) + 0.1)) % 62.83;
            bird.geometry.vertices[5].y = bird.geometry.vertices[4].y = Math.sin(bird.phase) * 5;
        }
    }
}