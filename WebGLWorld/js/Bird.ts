/// <reference path="../vendor/three.d.ts" />
/// <reference path="IModel.ts" />

class Bird implements IModel {
    public position;
    public velocity;
    private	_acceleration;
    private _goal;
    private model;
        
    private _width_max = 0;
    private _height_max = 0;
    private _depth_max = 0;
    private _width_min = 0;
    private _height_min = 0;
    private _depth_min = 0;
    
    private num_frames_pass = 0;

    //------------------------------------PARAMETROS A CAMBIAR:----------------------------------
    private num_frames_skip = 3;
    private _max_rotation = Math.PI / 16;

    private _scale = 0.8;
    private _max_speed = .6;
   
    private _avoidWalls = true;
    
    private _reach_ponderation = 0.1;
    private _separation_radio = 5;
    private _pond_separation = 0.5;
    private _pond_cohesion = 0.005;
    private _pond_alignment = 0.06;
    
    public scene_center = new THREE.Vector3(4, 12, 20);

    private init_center_pos = new THREE.Vector3(100,100,100);
    private init_center_vel = new THREE.Vector3(0.2,0.2,0.2);
    private init_d_pos = 50;
    private init_d_vel = 0.1;
    //----------------------------------------------------------------------

    constructor () {
        this.position = new THREE.Vector3();
        this.velocity =  new THREE.Vector3();
        this._acceleration = new THREE.Vector3();
    }

    setRandPosAndVel() {
         this.position.x = Math.random() * this.init_center_pos.x - this.init_d_pos;
         this.position.y = Math.random() * this.init_center_pos.y - this.init_d_pos;
         this.position.z = Math.random() * this.init_center_pos.z - this.init_d_pos;
         this.velocity.x = Math.random() * this.init_center_vel.x - this.init_d_vel;
         this.velocity.y = Math.random() * this.init_center_vel.y - this.init_d_vel;
         this.velocity.z = Math.random() * this.init_center_vel.z - this.init_d_vel;
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
					meshAnim.castShadow = true;
					meshAnim.recieveShadow = true;
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

    run(boids,ind) {
        if (this.num_frames_pass != this.num_frames_skip-1) return;

        if (this._avoidWalls) 
            this.checkBounds();
                 
        this.flock(boids,ind);
        
        this.move();
    }

    change_goal() {
        var x_val = Math.random() * this._width_max + this._width_min;
        var y_val = Math.random() * this._height_max + this._height_min;;
        var z_val = Math.random() * this._depth_max + this._depth_min;
        this._goal = new THREE.Vector3(x_val, y_val ,z_val );
    }

    flock(boids,ind) {
        if (this._goal) {
            this._acceleration.addSelf(this.reach(this._goal, this._reach_ponderation));
            if(Math.random() > 0.7)
                this.change_goal();
        }

        this._acceleration.addSelf(this.alignment(boids,ind));
        this._acceleration.addSelf(this.cohesion(boids,ind));
        this._acceleration.addSelf(this.separation(boids,ind));
    }

    move() {
        this.velocity.addSelf(this._acceleration);
        var l = this.velocity.length();
                
        if (l > this._max_speed) {
            this.velocity.divideScalar(l / this._max_speed);
        }

        this.position.addSelf(this.velocity);
        this._acceleration.set(0, 0, 0);
    }

    reach(target, amount) {
        var steer = new THREE.Vector3();
        steer.sub(target, this.position);
        steer.multiplyScalar(amount);
        return steer;
    }

    checkBounds() {
        //mov en un toro
        if (this.position.x > this._width_max) this.position.x = this._width_max;
        if (this.position.x < this._width_min) this.position.x = this._width_min;
        if (this.position.y > this._height_max) this.position.y = this._height_max;
        if (this.position.y < this._height_min) this.position.y = this._height_min;
        if (this.position.z > this._depth_max) this.position.z = this._depth_max;
        if (this.position.z < this._depth_min) this.position.z = this._depth_min;
    }
       
    alignment(boids,ind) {
        var other, velSum = new THREE.Vector3();

        for (var i = 0;  i < boids.length; i++) {
            if(ind==i) continue;

            other = boids[i];
            velSum.addSelf(other.velocity);
        }

        velSum.divideScalar(boids.length-1);

        return velSum.multiplyScalar(this._pond_alignment);
    }

    cohesion(boids,ind) {
       var other, distance, posSum = new THREE.Vector3(), steer = new THREE.Vector3();

       for (var i = 0; i < boids.length; i++) {
            if(ind==i) continue;

            other = boids[i];
            distance = other.position.distanceTo(this.position);
            posSum.addSelf(other.position);           
        }
        posSum.divideScalar(boids.length-1);
        
        steer.sub(posSum, this.position);

        return steer.multiplyScalar(this._pond_cohesion);
    }

    separation(boids,ind) {
       var other, distance, posSum = new THREE.Vector3();

       for (var i = 0; i < boids.length; i++) {
           if (ind == i) continue;

           other = boids[i];
           distance = other.position.distanceTo(this.position);
           var repulse_vector = new THREE.Vector3();
           repulse_vector.sub(this.position, other.position);

            if (distance <= this._separation_radio)
                posSum.addSelf(repulse_vector);
       }
       return posSum.multiplyScalar(this._pond_separation);
    }
    
    update(delta) {
        this.model.updateAnimation(1000 * delta);
        this.num_frames_pass++;
        if (this.num_frames_pass == this.num_frames_skip) {

            this.model.position.set(this.position.x, this.position.y, this.position.z);

            var y_rotation = Math.PI / 2 - Math.atan2(-this.velocity.z, this.velocity.x);
            if(this._max_rotation >= Math.abs(this.model.rotation.y-y_rotation))
                this.model.rotation.y = y_rotation;
            else
                 this.model.rotation.y = y_rotation%this._max_rotation;
            //this.model.rotation.z = 3 * Math.PI / 2 - Math.asin(this.velocity.y / this.velocity.length());
            
            this.num_frames_pass = 0;
        }
    }

    getModel() {
        return this.model;
    }

    setGoal(target) {
        this._goal = target;
    }

    setAvoidWalls(value) {
        this._avoidWalls = value;
    }

    setWorldSize(width, height, depth) {
        this._width_max = width/2 + this.scene_center.x;
        this._height_max = height/2 + this.scene_center.y;
        this._depth_max = depth/2 + this.scene_center.z;
        this._width_min = -width/2 + this.scene_center.x;
        this._height_min = -height/2 + this.scene_center.y;;
        this._depth_min = -depth/2 + this.scene_center.z;
    }
}