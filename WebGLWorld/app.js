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
        this._scale = 1;
        this.vector = new THREE.Vector3();
        this._width = 2000;
        this._height = 2000;
        this._depth = 2000;
        this._neighborhoodRadius = 100000;
        this._maxSpeed = 2;
        this._maxSteerForce = 0.2;
        this._avoidWalls = true;
        this._force_scalar = 3;
        this._repulse_distance = 350;
        this._steer_numerator = 0.5;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this._acceleration = new THREE.Vector3();
    }
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
    Bird.prototype.run = function (boids) {
        if(this._avoidWalls) {
            this.checkBounds();
        }
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
        if(Math.random() > 0.5) {
            this.flock(boids);
        }
        this.move();
    };
    Bird.prototype.flock = function (boids) {
        if(this._goal) {
            this._acceleration.addSelf(this.reach(this._goal, 0.005));
        }
        this._acceleration.addSelf(this.alignment(boids));
        this._acceleration.addSelf(this.cohesion(boids));
        this._acceleration.addSelf(this.separation(boids));
    };
    Bird.prototype.move = function () {
        this.velocity.addSelf(this._acceleration);
        var l = this.velocity.length();
        if(l > this._maxSpeed) {
            this.velocity.divideScalar(l / this._maxSpeed);
        }
        this.position.addSelf(this.velocity);
        this._acceleration.set(0, 0, 0);
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
    Bird.prototype.avoid = function (target) {
        var steer = new THREE.Vector3();
        steer.copy(this.position);
        steer.subSelf(target);
        steer.multiplyScalar(1 / this.position.distanceToSquared(target));
        return steer;
    };
    Bird.prototype.repulse = function (target) {
        var distance = this.position.distanceTo(target);
        if(distance < this._repulse_distance) {
            var steer = new THREE.Vector3();
            steer.sub(this.position, target);
            steer.multiplyScalar(this._steer_numerator / distance);
            this._acceleration.addSelf(steer);
        }
    };
    Bird.prototype.reach = function (target, amount) {
        var steer = new THREE.Vector3();
        steer.sub(target, this.position);
        steer.multiplyScalar(amount);
        return steer;
    };
    Bird.prototype.alignment = function (boids) {
        var boid;
        var velSum = new THREE.Vector3();
        var count = 0;

        for(var i = 0, il = boids.length; i < il; i++) {
            if(Math.random() > 0.6) {
                continue;
            }
            boid = boids[i];
            var distance = boid.position.distanceTo(this.position);
            if(distance > 0 && distance <= this._neighborhoodRadius) {
                velSum.addSelf(boid.velocity);
                count++;
            }
        }
        if(count > 0) {
            velSum.divideScalar(count);
            var l = velSum.length();
            if(l > this._maxSteerForce) {
                velSum.divideScalar(l / this._maxSteerForce);
            }
        }
        return velSum;
    };
    Bird.prototype.cohesion = function (boids) {
        var boid;
        var distance;
        var posSum = new THREE.Vector3();
        var steer = new THREE.Vector3();
        var count = 0;

        for(var i = 0, il = boids.length; i < il; i++) {
            if(Math.random() > 0.6) {
                continue;
            }
            boid = boids[i];
            distance = boid.position.distanceTo(this.position);
            if(distance > 0 && distance <= this._neighborhoodRadius) {
                posSum.addSelf(boid.position);
                count++;
            }
        }
        if(count > 0) {
            posSum.divideScalar(count);
        }
        steer.sub(posSum, this.position);
        var l = steer.length();
        if(l > this._maxSteerForce) {
            steer.divideScalar(l / this._maxSteerForce);
        }
        return steer;
    };
    Bird.prototype.separation = function (boids) {
        var boid;
        var distance;
        var posSum = new THREE.Vector3();
        var repulse = new THREE.Vector3();

        for(var i = 0, il = boids.length; i < il; i++) {
            if(Math.random() > 0.6) {
                continue;
            }
            boid = boids[i];
            distance = boid.position.distanceTo(this.position);
            if(distance > 0 && distance <= this._neighborhoodRadius) {
                repulse.sub(this.position, boid.position);
                repulse.normalize();
                repulse.divideScalar(distance);
                posSum.addSelf(repulse);
            }
        }
        return posSum;
    };
    Bird.prototype.getModel = function () {
        return this.model;
    };
    Bird.prototype.update = function (delta) {
        this.model.updateAnimation(1000 * delta);
        this.model.position.set(this.position.x, this.position.y, this.position.z);
        this.model.rotation.y = Math.PI / 2 - Math.atan2(-this.velocity.z, this.velocity.x);
        this.model.rotation.z = 3 * Math.PI / 2 - Math.asin(this.velocity.y / this.velocity.length());
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
        this._num_birds = 2;
        this.boids = [];
        for(var i = 0; i < this._num_birds; i++) {
            var boid = this.boids[i] = new Bird();
            boid.position.x = Math.random() * 500 - 250;
            boid.position.y = Math.random() * 500 - 250;
            boid.position.z = Math.random() * 500 - 250;
            boid.velocity.x = Math.random() * 1 - 0.5;
            boid.velocity.y = Math.random() * 1 - 0.5;
            boid.velocity.z = Math.random() * 1 - 0.5;
            boid.setAvoidWalls(true);
            boid.setGoal(new THREE.Vector3());
            boid.setWorldSize(1500, 1500, 1500);
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
        callback();
    };
    Boids.prototype.getModel = function () {
        throw new DOMException();
    };
    Boids.prototype.update = function (delta) {
        var il = this.boids.length;
        for(var i = 0; i < il; i++) {
            var boid = this.boids[i];
            boid.run(this.boids);
            var bird = boid.getModel();
            if(bird != undefined) {
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
        this.clock = new THREE.Clock();
        $("#orbit_camera_button").click(function () {
            _this.OrbitCameraControls();
        });
        $("#firstPerson_camera_button").click(function () {
            _this.FirspersonCameraControls();
        });
        this.camera = new THREE.PerspectiveCamera(75, this.canvasWidth / this.canvasHeight, 1, 10000);
        this.camera_pos_init = new THREE.Vector3(0, 0, 0);
        this.camera_rot_init = new THREE.Vector3(0, 0, 0);
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
        loader.load("models/js2/SandLandscape.js", function (loaded) {
            _this.camera = loaded.currentCamera;
            _this.camera.updateProjectionMatrix();
            _this.scene = loaded.scene;
            _this.renderer.setClearColor(loaded.bgColor, loaded.bgAlpha);
            var light = new THREE.DirectionalLight(16777215, 2);
            light.position.set(-40, -20, 10);
            _this.scene.add(light);
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
        this.boids.update(delta);
        this.renderer.render(this.scene, this.camera);
    };
    World.prototype.resetCamera = function () {
        this.camera.position.set(this.camera_pos_init.x, this.camera_pos_init.y, this.camera_pos_init.z);
        this.camera.rotation.set(this.camera_rot_init.x, this.camera_rot_init.y, this.camera_rot_init.z);
    };
    World.prototype.OrbitCameraControls = function () {
        this.controls = new THREE.OrbitControls(this.camera);
    };
    World.prototype.FirspersonCameraControls = function () {
        this.resetCamera();
        this.controls = new THREE.FirstPersonControls(this.camera);
        this.controls.movementSpeed = 30;
        this.controls.lookSpeed = 0.01;
        this.controls.noFly = true;
        this.controls.lookVertical = true;
    };
    return World;
})();
