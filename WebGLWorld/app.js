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
        this.vector = new THREE.Vector3();
        this._width = 600;
        this._height = 600;
        this._depth = 200;
        this._neighborhoodRadius = 100;
        this._maxSpeed = 6;
        this._maxSteerForce = 0.1;
        this._avoidWalls = false;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this._acceleration = new THREE.Vector3();
    }
    Bird.prototype.loadModel = function (scene, callback) {
        var loader = new THREE.JSONLoader();
        var bird = this;
        loader.load("models/MarioBros/rig_mario.js", function (geometry) {
            geometry.materials[0].morphTargets = true;
            geometry.materials[0].morphNormals = true;
            bird.morphColorsToFaceColors(geometry);
            geometry.computeMorphNormals();
            var material = new THREE.MeshFaceMaterial();
            var meshAnim = new THREE.MorphAnimMesh(geometry, material);
            meshAnim.duration = 1000;
            var s = 20;
            meshAnim.scale.set(s, s, s);
            meshAnim.position.x = 0;
            meshAnim.position.y = 10;
            scene.add(meshAnim);
            bird.model = meshAnim;
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
    Bird.prototype.getModel = function () {
        return this.model;
    };
    Bird.prototype.update = function (delta) {
        this.model.updateAnimation(1000 * delta);
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
    Bird.prototype.run = function (boids) {
        if(this._avoidWalls) {
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
        }
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
        if(distance < 150) {
            var steer = new THREE.Vector3();
            steer.sub(this.position, target);
            steer.multiplyScalar(0.5 / distance);
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
    return Bird;
})();
var Boids = (function () {
    function Boids() {
        this._num_birds = 3;
        this.boids = [];
        for(var i = 0; i < this._num_birds; i++) {
            var boid = this.boids[i] = new Bird();
            boid.position.x = Math.random() * 400 - 200;
            boid.position.y = Math.random() * 400 - 200;
            boid.position.z = Math.random() * 400 - 200;
            boid.velocity.x = Math.random() * 2 - 1;
            boid.velocity.y = Math.random() * 2 - 1;
            boid.velocity.z = Math.random() * 2 - 1;
            boid.setAvoidWalls(true);
            boid.setWorldSize(500, 500, 400);
        }
    }
    Boids.prototype.loadModel = function (scene, callback) {
        var _this = this;
        var count = 0;
        for(var i = 0; i < this._num_birds; i++) {
            this.boids[i].loadModel(scene, function () {
                count++;
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
            boid.run(this.boids);
            var bird = boid.getModel();
            if(bird != undefined) {
                bird.rotation.y = Math.atan2(-boid.velocity.z, boid.velocity.x);
                bird.rotation.z = Math.asin(boid.velocity.y / boid.velocity.length());
                boid.update(delta);
            }
        }
    };
    return Boids;
})();
$(document).ready(function () {
    var world = new World();
    var terr = new Terreno();
});
var World = (function () {
    function World() {
        var _this = this;
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = 480;
        this.clock = new THREE.Clock();
        this.camera = new THREE.PerspectiveCamera(75, this.canvasWidth / this.canvasHeight, 1, 10000);
        this.camera.position.z = 1000;
        this.scene = new THREE.Scene();
        var geometry = new THREE.CubeGeometry(200, 200, 200);
        var material = new THREE.MeshBasicMaterial({
            color: 13369344,
            wireframe: false
        });
        this.mesh = new THREE.Mesh(geometry, material);
        var groundGeo = new THREE.PlaneGeometry(10000, 10000);
        var groundMat = new THREE.MeshPhongMaterial({
            ambient: 16777215,
            color: 16777215,
            specular: 328965
        });
        groundMat.color.setHSV(0.095, 0.5, 1);
        var ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -33;
        this.scene.add(ground);
        ground.receiveShadow = true;
        this.controls = new THREE.FirstPersonControls(this.camera);
        this.controls.movementSpeed = 60;
        this.controls.lookSpeed = 0.05;
        this.controls.noFly = true;
        this.controls.lookVertical = false;
        this.renderer = new THREE.CanvasRenderer();
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        $('#canvas-wrapper').append($(this.renderer.domElement));
        this.boids = new Boids();
        this.boids.loadModel(this.scene, function () {
            _this.animate();
        });
    }
    World.prototype.animate = function () {
        var _this = this;
        requestAnimationFrame(function () {
            return _this.animate();
        });
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;
        var delta = this.clock.getDelta();
        var time = this.clock.getElapsedTime() * 5;

        this.controls.update(delta);
        this.boids.update(delta);
        this.renderer.render(this.scene, this.camera);
    };
    return World;
})();
