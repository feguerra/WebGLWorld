/// <reference path="../vendor/three.d.ts" />
/// <reference path="IModel.ts" />

class Bird implements IModel {
    public position;
    public velocity;
    private	_acceleration;
    private _scale = 1;
    private model;

    private vector = new THREE.Vector3();
    private _width = 2000;
    private _height = 2000;
    private _depth = 2000;
    private _goal;
    private _neighborhoodRadius = 100000;
    private _maxSpeed = 2;
    private _maxSteerForce = 0.2;
    private _avoidWalls = true;
    private _force_scalar = 3;
    private _repulse_distance = 350;
    private _steer_numerator = 0.5;

    constructor () {
        this.position = new THREE.Vector3();
        this.velocity =  new THREE.Vector3();
        this._acceleration = new THREE.Vector3();
    }

    loadModel(model_path, scene, callback) {
            var loader = new THREE.JSONLoader();
            var bird = this;

			loader.load( model_path, function( geometry ) {				
					geometry.materials[ 0 ].morphTargets = true;
					geometry.materials[ 0 ].morphNormals = true;
					bird.morphColorsToFaceColors( geometry );
					geometry.computeMorphNormals();
					var material = new THREE.MeshFaceMaterial();
					var meshAnim = new THREE.MorphAnimMesh( geometry, material );
					meshAnim.duration = 1000;
                    
					var s = bird._scale;
					meshAnim.scale.set( s, s, s );
					meshAnim.position.set( bird.position.x, bird.position.y, bird.position.z );
					bird.model = meshAnim;
					scene.add( bird.model );
					callback();
                } );
    }

    morphColorsToFaceColors(geometry) {
        if ( geometry.morphColors && geometry.morphColors.length ) {
			var colorMap = geometry.morphColors[ 0 ];
			for ( var i = 0; i < colorMap.colors.length; i ++ ) {
				geometry.faces[ i ].color = colorMap.colors[ i ];
				THREE.ColorUtils.adjustHSV( geometry.faces[ i ].color, 0, -0.1, 0 );
			}
		}
    }

    run(boids) {
        if (this._avoidWalls) 
            this.checkBounds();

        this.vector.set(-this._width, this.position.y, this.position.z);
        this.vector = this.avoid(this.vector);
        this.vector.multiplyScalar(this._force_scalar);
        this._acceleration.addSelf(this.vector);

        this.vector.set(this._width, this.position.y, this.position.z);
        this.vector = this.avoid(this.vector);
        this.vector.multiplyScalar(this._force_scalar);
        this._acceleration.addSelf(this.vector);

        this.vector.set(this.position.x, -this._height, this.position.z);
        this.vector = this.avoid(this.vector);
        this.vector.multiplyScalar(this._force_scalar);
        this._acceleration.addSelf(this.vector);

        this.vector.set(this.position.x, this._height, this.position.z);
        this.vector = this.avoid(this.vector);
        this.vector.multiplyScalar(this._force_scalar);
        this._acceleration.addSelf(this.vector);

        this.vector.set(this.position.x, this.position.y, -this._depth);
        this.vector = this.avoid(this.vector);
        this.vector.multiplyScalar(this._force_scalar);
        this._acceleration.addSelf(this.vector);

        this.vector.set(this.position.x, this.position.y, this._depth);
        this.vector = this.avoid(this.vector);
        this.vector.multiplyScalar(this._force_scalar);
        this._acceleration.addSelf(this.vector);
        
        if (Math.random() > 0.5) {
            this.flock(boids);
        }
        this.move();
    }

    flock(boids) {
        if (this._goal) {
            this._acceleration.addSelf(this.reach(this._goal, 0.005));
        }

        this._acceleration.addSelf(this.alignment(boids));
        this._acceleration.addSelf(this.cohesion(boids));
        this._acceleration.addSelf(this.separation(boids));
    }

    move() {
        this.velocity.addSelf(this._acceleration);
        var l = this.velocity.length();

        if (l > this._maxSpeed) {
            this.velocity.divideScalar(l / this._maxSpeed);
        }

        this.position.addSelf(this.velocity);
        this._acceleration.set(0, 0, 0);
    }

    checkBounds() {
        if (this.position.x > this._width) this.position.x = -this._width;
        if (this.position.x < - this._width) this.position.x = this._width;
        if (this.position.y > this._height) this.position.y = -this._height;
        if (this.position.y < -this._height) this.position.y = this._height;
        if (this.position.z > this._depth) this.position.z = -this._depth;
        if (this.position.z < -this._depth) this.position.z = this._depth;
    }

    avoid(target) 
    {
        var steer = new THREE.Vector3();

        steer.copy(this.position);
        steer.subSelf(target);

        steer.multiplyScalar(1 / this.position.distanceToSquared(target));

        return steer;
    }

    repulse(target) {
        var distance = this.position.distanceTo(target);

        if (distance < this._repulse_distance) {
            var steer = new THREE.Vector3();
            steer.sub(this.position, target);
            steer.multiplyScalar(this._steer_numerator / distance);
            this._acceleration.addSelf(steer);
        }
    }

    reach(target, amount) {
        var steer = new THREE.Vector3();

        steer.sub(target, this.position);
        steer.multiplyScalar(amount);

        return steer;
    }

    alignment(boids) {
               var boid, velSum = new THREE.Vector3(),
                   count = 0;

        for (var i = 0, il = boids.length; i < il; i++) {
            if (Math.random() > 0.6) continue;

            boid = boids[i];
            var distance = boid.position.distanceTo(this.position);

            if (distance > 0 && distance <= this._neighborhoodRadius) {
                velSum.addSelf(boid.velocity);
                count++;
            }
        }

        if (count > 0) {
            velSum.divideScalar(count);

            var l = velSum.length();

            if (l > this._maxSteerForce) {
                velSum.divideScalar(l / this._maxSteerForce);
            }
        }

        return velSum;
    }

    cohesion(boids) {
                   var boid, distance,
                   posSum = new THREE.Vector3(),
                   steer = new THREE.Vector3(),
                   count = 0;

        for (var i = 0, il = boids.length; i < il; i++) {
            if (Math.random() > 0.6) continue;

            boid = boids[i];
            distance = boid.position.distanceTo(this.position);

            if (distance > 0 && distance <= this._neighborhoodRadius) {
                posSum.addSelf(boid.position);
                count++;
            }
        }

        if (count > 0) {
            posSum.divideScalar(count);
        }

        steer.sub(posSum, this.position);

        var l = steer.length();

        if (l > this._maxSteerForce) {
            steer.divideScalar(l / this._maxSteerForce);
        }

        return steer;
    }

    separation(boids) {
                var boid, distance,
                    posSum = new THREE.Vector3(),
                    repulse = new THREE.Vector3();

        for (var i = 0, il = boids.length; i < il; i++) {

            if (Math.random() > 0.6) continue;

            boid = boids[i];
            distance = boid.position.distanceTo(this.position);

            if (distance > 0 && distance <= this._neighborhoodRadius) {

                repulse.sub(this.position, boid.position);
                repulse.normalize();
                repulse.divideScalar(distance);
                posSum.addSelf(repulse);

            }
        }
        return posSum;
    }

    getModel() {
        return this.model;
    }

    update(delta) {
        this.model.updateAnimation(1000 * delta);
        this.model.position.set(this.position.x, this.position.y, this.position.z);
        this.model.rotation.y = Math.PI/2 - Math.atan2(-this.velocity.z, this.velocity.x);
        this.model.rotation.z = 3*Math.PI/2 - Math.asin(this.velocity.y / this.velocity.length());
    }

    setGoal(target) {
        this._goal = target;
    }

    setAvoidWalls(value) {
        this._avoidWalls = value;
    }

    setWorldSize(width, height, depth) {
        this._width = width;
        this._height = height;
        this._depth = depth;
    }
}