/// <reference path="../vendor/three.d.ts" />
/// <reference path="IModel.ts" />

class Bird implements IModel {
    public position;
    public velocity;
    private	_acceleration;
    private model;

    private vector = new THREE.Vector3();
    private _width = 600;
    private _height = 600;
    private _depth = 200;
    private _goal;
    private _neighborhoodRadius = 100;
    private _maxSpeed = 6;
    private _maxSteerForce = 0.1;
    private _avoidWalls = false;

    constructor () {
        this.position = new THREE.Vector3();
        this.velocity =  new THREE.Vector3();
        this._acceleration = new THREE.Vector3();
    }

    loadModel(scene, callback) {
            //this.model = new THREE.Mesh(new BirdModel(), new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, side: THREE.DoubleSide }));
            //this.model = new THREE.Mesh(
            //                new THREE.CubeGeometry(10, 10, 10),
            //                new THREE.MeshBasicMaterial({ color: 0xcc0000, wireframe: false }));

            var loader = new THREE.JSONLoader();
            var bird = this;

			loader.load( "models/MarioBros/rig_mario.js", function( geometry ) {				
					geometry.materials[ 0 ].morphTargets = true;
					geometry.materials[ 0 ].morphNormals = true;
					bird.morphColorsToFaceColors( geometry );
					geometry.computeMorphNormals();
                    
                    //var material = new THREE.MeshLambertMaterial({ morphTargets: true, morphNormals: true, vertexColors: THREE.FaceColors});
					//var material = new THREE.MeshPhongMaterial( {morphTargets: true, morphNormals: true} );
					var material = new THREE.MeshFaceMaterial();
					
					var meshAnim = new THREE.MorphAnimMesh( geometry, material );
					
					meshAnim.duration = 1000;

					var s = 20;
					meshAnim.scale.set( s, s, s );
					meshAnim.position.x = 0;
                    meshAnim.position.y = 10;
					scene.add( meshAnim );
					bird.model = meshAnim;
					//bird.morphs.push( meshAnim );
					callback();
                } );
            
            /* loader.load( "models/flamingo.js", ( geometry, materials ) => { 
                this.morphColorsToFaceColors(geometry);
                geometry.computeMorphNormals();

                var material = new THREE.MeshPhongMaterial( { color: 0xffcccc, specular: 0xffcccc, shininess: 20, morphTargets: true, morphNormals: true, vertexColors: THREE.FaceColors, shading: THREE.FlatShading } );
                this.model = new THREE.MorphAnimMesh( geometry, material );
                //this.model = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );

                //animacion
                this.model.duration = 1000;

                // mesh
                this.model.position = this.position;
                this.model.phase = Math.floor(Math.random() * 62.83);
		        //this.model.scale.set( 30, 30, 30 );
                this.model.scale.set( 1, 1, 1 );

		        scene.add( this.model );

			    callback();
            });*/
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

    getModel() {
        return this.model;
    }

    update(delta) {
        this.model.updateAnimation(1000 * delta);

        /*for ( var i = 0; i < morphs.length; i ++ ) {

					morph = morphs[ i ];
					morph.updateAnimation( 1000 * delta );

				}*/
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

    run(boids) {
        if (this._avoidWalls) {

            this.vector.set(-this._width, this.position.y, this.position.z);
            this.vector = this.avoid(this.vector);
            this.vector.multiplyScalar(5);
            this._acceleration.addSelf(this.vector);

            this.vector.set(this._width, this.position.y, this.position.z);
            this.vector = this.avoid(this.vector);
            this.vector.multiplyScalar(5);
            this._acceleration.addSelf(this.vector);

            this.vector.set(this.position.x, -this._height, this.position.z);
            this.vector = this.avoid(this.vector);
            this.vector.multiplyScalar(5);
            this._acceleration.addSelf(this.vector);

            this.vector.set(this.position.x, this._height, this.position.z);
            this.vector = this.avoid(this.vector);
            this.vector.multiplyScalar(5);
            this._acceleration.addSelf(this.vector);

            this.vector.set(this.position.x, this.position.y, -this._depth);
            this.vector = this.avoid(this.vector);
            this.vector.multiplyScalar(5);
            this._acceleration.addSelf(this.vector);

            this.vector.set(this.position.x, this.position.y, this._depth);
            this.vector = this.avoid(this.vector);
            this.vector.multiplyScalar(5);
            this._acceleration.addSelf(this.vector);

        }/* else {

						this.checkBounds();

					}
					*/

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

        if (distance < 150) {

            var steer = new THREE.Vector3();

            steer.sub(this.position, target);
            steer.multiplyScalar(0.5 / distance);

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
}