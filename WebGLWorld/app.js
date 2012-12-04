var Terreno = (function () {
    function Terreno() {
        this.size = 14;
        this.step = 1;
    }
    Terreno.prototype.load = function (callback) {
        var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial({
            color: 13421772,
            opacity: 0.2
        });
        for(var i = -this.size; i <= this.size; i += this.step) {
            geometry.vertices.push(new THREE.Vector3(-this.size, -0.04, i));
            geometry.vertices.push(new THREE.Vector3(this.size, -0.04, i));
            geometry.vertices.push(new THREE.Vector3(i, -0.04, -this.size));
            geometry.vertices.push(new THREE.Vector3(i, -0.04, this.size));
        }
        this.mesh = new THREE.Line(geometry, material, THREE.LinePieces);
        callback();
    };
    return Terreno;
})();
var Bird = (function () {
    function Bird() {
        this._width = 2000;
        this._height = 2000;
        this._depth = 2000;
        this.num_frames_pass = 0;
        this.num_frames_skip = 3;
        this._max_rotation = Math.PI / 16;
        this._scale = 1;
        this._max_speed = 0.8;
        this._avoidWalls = true;
        this._reach_ponderation = 0.008;
        this._separation_radio = 25;
        this._pond_separation = 0.5;
        this._pond_cohesion = 0.005;
        this._pond_alignment = 0.6;
        this.init_center_pos = new THREE.Vector3(100, 100, 100);
        this.init_center_vel = new THREE.Vector3(0.2, 0.2, 0.2);
        this.init_d_pos = 50;
        this.init_d_vel = 0.1;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this._acceleration = new THREE.Vector3();
    }
    Bird.prototype.setRandPosAndVel = function () {
        this.position.x = Math.random() * this.init_center_pos.x - this.init_d_pos;
        this.position.y = Math.random() * this.init_center_pos.y - this.init_d_pos;
        this.position.z = Math.random() * this.init_center_pos.z - this.init_d_pos;
        this.velocity.x = Math.random() * this.init_center_vel.x - this.init_d_vel;
        this.velocity.y = Math.random() * this.init_center_vel.y - this.init_d_vel;
        this.velocity.z = Math.random() * this.init_center_vel.z - this.init_d_vel;
    };
    Bird.prototype.loadModel = function (model_path, scene, callback) {
        var loader = new THREE.JSONLoader();
        var bird = this;
        loader.load(model_path, function (geometry) {
            geometry.materials[0].morphTargets = true;
            geometry.materials[0].morphNormals = true;
            bird.morphColorsToFaceColors(geometry);
            geometry.computeMorphNormals();
            var material = new THREE.MeshFaceMaterial();
            var meshAnim = new THREE.MorphAnimMesh(geometry, material);
            meshAnim.duration = 1000;
            var s = bird._scale;
            meshAnim.scale.set(s, s, s);
            meshAnim.position.set(bird.position.x, bird.position.y, bird.position.z);
            bird.model = meshAnim;
            scene.add(bird.model);
            callback();
        });
    };
    Bird.prototype.morphColorsToFaceColors = function (geometry) {
        if(geometry.morphColors && geometry.morphColors.length) {
            var colorMap = geometry.morphColors[0];
            for(var i = 0; i < colorMap.colors.length; i++) {
                geometry.faces[i].color = colorMap.colors[i];
                THREE.ColorUtils.adjustHSV(geometry.faces[i].color, 0, -0.1, 0);
            }
        }
    };
    Bird.prototype.run = function (boids, ind) {
        if(this.num_frames_pass != this.num_frames_skip - 1) {
            return;
        }
        if(this._avoidWalls) {
            this.checkBounds();
        }
        this.flock(boids, ind);
        this.move();
    };
    Bird.prototype.flock = function (boids, ind) {
        if(this._goal) {
            this._acceleration.addSelf(this.reach(this._goal, this._reach_ponderation));
        }
        this._acceleration.addSelf(this.alignment(boids, ind));
        this._acceleration.addSelf(this.cohesion(boids, ind));
        this._acceleration.addSelf(this.separation(boids, ind));
    };
    Bird.prototype.move = function () {
        this.velocity.addSelf(this._acceleration);
        var l = this.velocity.length();
        if(l > this._max_speed) {
            this.velocity.divideScalar(l / this._max_speed);
        }
        this.position.addSelf(this.velocity);
        this._acceleration.set(0, 0, 0);
    };
    Bird.prototype.reach = function (target, amount) {
        var steer = new THREE.Vector3();
        steer.sub(target, this.position);
        steer.multiplyScalar(amount);
        return steer;
    };
    Bird.prototype.checkBounds = function () {
        if(this.position.x > this._width) {
            this.position.x = -this._width;
        }
        if(this.position.x < -this._width) {
            this.position.x = this._width;
        }
        if(this.position.y > this._height) {
            this.position.y = -this._height;
        }
        if(this.position.y < -this._height) {
            this.position.y = this._height;
        }
        if(this.position.z > this._depth) {
            this.position.z = -this._depth;
        }
        if(this.position.z < -this._depth) {
            this.position.z = this._depth;
        }
    };
    Bird.prototype.alignment = function (boids, ind) {
        var other;
        var velSum = new THREE.Vector3();

        for(var i = 0; i < boids.length; i++) {
            if(ind == i) {
                continue;
            }
            other = boids[i];
            velSum.addSelf(other.velocity);
        }
        velSum.divideScalar(boids.length - 1);
        return velSum.multiplyScalar(this._pond_alignment);
    };
    Bird.prototype.cohesion = function (boids, ind) {
        var other;
        var distance;
        var posSum = new THREE.Vector3();
        var steer = new THREE.Vector3();

        for(var i = 0; i < boids.length; i++) {
            if(ind == i) {
                continue;
            }
            other = boids[i];
            distance = other.position.distanceTo(this.position);
            posSum.addSelf(other.position);
        }
        posSum.divideScalar(boids.length - 1);
        steer.sub(posSum, this.position);
        return steer.multiplyScalar(this._pond_cohesion);
    };
    Bird.prototype.separation = function (boids, ind) {
        var other;
        var distance;
        var posSum = new THREE.Vector3();

        for(var i = 0; i < boids.length; i++) {
            if(ind == i) {
                continue;
            }
            other = boids[i];
            distance = other.position.distanceTo(this.position);
            var repulse_vector = new THREE.Vector3();
            repulse_vector.sub(this.position, other.position);
            if(distance <= this._separation_radio) {
                posSum.addSelf(repulse_vector);
            }
        }
        return posSum.multiplyScalar(this._pond_separation);
    };
    Bird.prototype.update = function (delta) {
        this.model.updateAnimation(1000 * delta);
        this.num_frames_pass++;
        if(this.num_frames_pass == this.num_frames_skip) {
            this.model.position.set(this.position.x, this.position.y, this.position.z);
            var y_rotation = Math.PI / 2 - Math.atan2(-this.velocity.z, this.velocity.x);
            if(this._max_rotation >= Math.abs(this.model.rotation.y - y_rotation)) {
                this.model.rotation.y = y_rotation;
            } else {
                this.model.rotation.y = y_rotation % this._max_rotation;
            }
            this.num_frames_pass = 0;
        }
    };
    Bird.prototype.getModel = function () {
        return this.model;
    };
    Bird.prototype.setGoal = function (target) {
        this._goal = target;
    };
    Bird.prototype.setAvoidWalls = function (value) {
        this._avoidWalls = value;
    };
    Bird.prototype.setWorldSize = function (width, height, depth) {
        this._width = width;
        this._height = height;
        this._depth = depth;
    };
    return Bird;
})();
var Boids = (function () {
    function Boids() {
        this._num_birds = 5;
        this.boids = [];
        for(var i = 0; i < this._num_birds; i++) {
            var boid = this.boids[i] = new Bird();
            boid.setRandPosAndVel();
            boid.setAvoidWalls(true);
            boid.setGoal(new THREE.Vector3(4, 12, 20));
            boid.setWorldSize(50, 50, 50);
        }
    }
    Boids.prototype.loadModel = function (scene, callback) {
        var _this = this;
        var count = 0;
        for(var i = 0; i < this._num_birds; i++) {
            var model_path = "models/MarioBros/mario_main.js";
            var r = Math.random();
            if(r < 0.3) {
                model_path = "models/MarioBros/mario_fire.js";
            } else {
                if(r >= 0.25 && r < 0.5) {
                    model_path = "models/MarioBros/mario_mime.js";
                }
            }
            this.boids[i].loadModel(model_path, scene, function () {
                count++;
                var bar_width = count / _this._num_birds * 100;
                $("#models_bar").attr("style", "width: " + bar_width + "%;");
            });
        }
        var lazy_wait = function () {
            if(count < _this._num_birds) {
                setTimeout(lazy_wait, 1000);
            } else {
                callback();
            }
        };
        lazy_wait();
    };
    Boids.prototype.getModel = function () {
        throw new DOMException();
    };
    Boids.prototype.update = function (delta) {
        var il = this.boids.length;
        for(var i = 0; i < il; i++) {
            var boid = this.boids[i];
            var bird = boid.getModel();
            if(bird != undefined) {
                boid.run(this.boids, i);
                boid.update(delta);
            }
        }
    };
    return Boids;
})();
var world;
$(document).ready(function () {
    world = new World();
});
var World = (function () {
    function World() {
        var _this = this;
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = 480;
        this.camera_pos_init = new THREE.Vector3(0, 10, 10);
        this.camera_rot_init = new THREE.Vector3(0, 0, 0);
        this.camera_max_x = 20;
        this.camera_max_y = 20;
        this.camera_max_z = 20;
        this.clock = new THREE.Clock();
        $("#reset_button").click(function () {
            _this.resetCamera();
        });
        $("#switch_camera_button").click(function () {
            _this.switchCameraControls();
        });
        this.camera = new THREE.PerspectiveCamera(75, this.canvasWidth / this.canvasHeight, 1, 10000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        $('#canvas-wrapper').append($(this.renderer.domElement));
        this.scene = new THREE.Scene();
        var loader = new THREE.SceneLoader();
        loader.callbackProgress = function (progress, result) {
            var total = progress.totalModels + progress.totalTextures;
            var loaded = progress.loadedModels + progress.loadedTextures;
            $("#scene_bar").attr("style", "width: " + loaded / total * 100 + "%;");
        };
        loader.load("models/sandLandscapeCeilingBig/SandLandscape_big.js", function (loaded) {
            _this.camera = loaded.currentCamera;
            _this.resetCamera();
            _this.camera.updateProjectionMatrix();
            _this.scene = loaded.scene;
            _this.renderer.setClearColor(loaded.bgColor, loaded.bgAlpha);
            var light = new THREE.DirectionalLight(16777215, 2);
            light.position.set(-40, -20, 10);
            _this.scene.add(light);
            var ambient_light = new THREE.AmbientLight(2236962);
            _this.scene.add(ambient_light);
            _this.controls = new THREE.OrbitControls(_this.camera);
            _this.boids = new Boids();
            _this.boids.loadModel(_this.scene, function () {
                _this.animate();
            });
        });
    }
    World.prototype.animate = function () {
        var _this = this;
        requestAnimationFrame(function () {
            return _this.animate();
        });
        var delta = this.clock.getDelta();
        var time = this.clock.getElapsedTime() * 5;

        this.controls.update(delta);
        this.checkBounds();
        this.boids.update(delta);
        this.renderer.render(this.scene, this.camera);
    };
    World.prototype.resetCamera = function () {
        this.camera.position.set(this.camera_pos_init.x, this.camera_pos_init.y, this.camera_pos_init.z);
        this.camera.rotation.set(this.camera_rot_init.x, this.camera_rot_init.y, this.camera_rot_init.z);
    };
    World.prototype.switchCameraControls = function () {
        if(this.controls instanceof THREE.FirstPersonControls) {
            this.controls = new THREE.OrbitControls(this.camera);
        } else {
            if(this.controls instanceof THREE.OrbitControls) {
                this.controls = new THREE.FirstPersonControls(this.camera);
                this.controls.movementSpeed = 15;
                this.controls.lookSpeed = 0.02;
                this.controls.noFly = true;
                this.controls.lookVertical = true;
            }
        }
    };
    World.prototype.checkBounds = function () {
        var camera_x = this.camera.position.x;
        var camera_y = this.camera.position.y;
        var camera_z = this.camera.position.z;
        if(camera_x < -this.camera_max_x) {
            this.camera.position.x = -this.camera_max_x;
        } else {
            if(camera_x > this.camera_max_x) {
                this.camera.position.x = this.camera_max_x;
            }
        }
        if(camera_y < -this.camera_max_y) {
            this.camera.position.y = -this.camera_max_y;
        } else {
            if(camera_y > this.camera_max_y) {
                this.camera.position.y = this.camera_max_y;
            }
        }
        if(camera_z < -this.camera_max_z) {
            this.camera.position.z = -this.camera_max_z;
        } else {
            if(camera_z > this.camera_max_z) {
                this.camera.position.z = this.camera_max_z;
            }
        }
    };
    return World;
})();
