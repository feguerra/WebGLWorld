var PhysicWorld = (function () {
    function PhysicWorld() {
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = 480;
        this.scene = new Physijs.Scene();
        this.scene.setGravity(new THREE.Vector3(0, -30, 0));
        this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(60, 50, 60);
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);
        var light = new THREE.DirectionalLight(16777215);
        light.position.set(20, 40, -15);
        light.target.position.copy(this.scene.position);
        light.castShadow = true;
        light.shadowCameraLeft = -60;
        light.shadowCameraTop = -60;
        light.shadowCameraRight = 60;
        light.shadowCameraBottom = 60;
        light.shadowCameraNear = 20;
        light.shadowCameraFar = 200;
        light.shadowBias = -0.0001;
        light.shadowMapWidth = light.shadowMapHeight = 2048;
        light.shadowDarkness = 0.7;
        this.scene.add(light);
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        document.body.appendChild(this.renderer.domElement);
        this.addGround();
        for(var i = 0; i < 10; i++) {
            this.addRandomBox();
        }
    }
    PhysicWorld.prototype.init = function () {
        var _this = this;
        requestAnimationFrame(function () {
            return _this.render();
        });
        this.scene.simulate();
    };
    PhysicWorld.prototype.addGround = function () {
        this.ground_material = Physijs.createMaterial(new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture('images/rocks.jpg')
        }), 0.8, 0.4);
        this.ground_material.map.wrapS = this.ground_material.map.wrapT = THREE.RepeatWrapping;
        this.ground_material.map.repeat.set(3, 3);
        var ground = new Physijs.BoxMesh(new THREE.CubeGeometry(100, 1, 100), this.ground_material, 0);
        ground.receiveShadow = true;
        this.scene.add(ground);
    };
    PhysicWorld.prototype.addRandomBox = function () {
        var box_material = Physijs.createMaterial(new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture('images/plywood.jpg')
        }), 0.4, 0.6);
        box_material.map.wrapS = this.ground_material.map.wrapT = THREE.RepeatWrapping;
        box_material.map.repeat.set(0.25, 0.25);
        var box = new Physijs.BoxMesh(new THREE.CubeGeometry(4, 4, 4), box_material);
        box.position.set(Math.random() * 50 - 25, 10 + Math.random() * 5, Math.random() * 50 - 25);
        box.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        box.scale.set(Math.random() * 1 + 0.5, Math.random() * 1 + 0.5, Math.random() * 1 + 0.5);
        box.castShadow = true;
        this.scene.add(box);
    };
    PhysicWorld.prototype.render = function () {
        var _this = this;
        requestAnimationFrame(function () {
            return _this.render();
        });
        this.renderer.render(this.scene, this.camera);
        this.scene.simulate();
    };
    return PhysicWorld;
})();
$(document).ready(function () {
    Physijs.scripts.worker = 'vendor/Physijs/physijs_worker.js';
    var world = new PhysicWorld();
    world.init();
    $('#posX').change(function () {
        world.camera.position.x = $(this).val();
    });
    $('#posY').change(function () {
        world.camera.position.y = $(this).val();
    });
    $('#posZ').change(function () {
        world.camera.position.z = $(this).val();
    });
});
