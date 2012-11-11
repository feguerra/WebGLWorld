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
var Monkey = (function () {
    function Monkey(path) {
        this.path = path;
    }
    Monkey.prototype.load = function (callback) {
        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;
        var monkey = this;
        loader.load(this.path, function (collada) {
            monkey.mesh = collada.scene;
            monkey.skin = collada.skins[0];
            monkey.mesh.scale.x = monkey.mesh.scale.y = monkey.mesh.scale.z = 0.002;
            monkey.mesh.updateMatrix();
            callback();
        }, function (info) {
        });
    };
    return Monkey;
})();
$(document).ready(function () {
    var world = new World();
    var mon = new Monkey('models/monster/monster.dae');
    mon.load(function () {
        world.addMesh(mon);
        world.model = mon;
        world.camera.lookAt(mon.mesh.position);
        console.info("model cargado!");
    });
    var grid = new Terreno();
    grid.load(function () {
        world.addMesh(grid);
        console.info("grid cargado!");
    });
    $('#posX').change(function () {
        world.camera.position.x = $(this).val();
        world.camera.lookAt(mon.mesh.position);
    });
    $('#posY').change(function () {
        world.camera.position.y = $(this).val();
        world.camera.lookAt(mon.mesh.position);
    });
    $('#posZ').change(function () {
        world.camera.position.z = $(this).val();
        world.camera.lookAt(mon.mesh.position);
    });
    world.animate();
});
var World = (function () {
    function World() {
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = 480;
        this.t = 0;
        this.clock = new THREE.Clock();
        this.camera = new THREE.PerspectiveCamera(45, this.canvasWidth / this.canvasHeight, 1, 2000);
        this.camera.position.set(0, 5, 10);
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(13421772));
        this.pointLight = new THREE.PointLight(16711680, 5, 50);
        this.pointLight.position.set(0, 5, 5);
        this.scene.add(this.pointLight);
        this.pointLightModel = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial({
            color: 16711680
        }));
        this.pointLightModel.position = this.pointLight.position;
        this.scene.add(this.pointLightModel);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        document.body.appendChild(this.renderer.domElement);
    }
    World.prototype.addMesh = function (model) {
        var mesh = model.mesh;
        if(mesh == null) {
            console.error("undefined model");
        } else {
            this.scene.add(mesh);
        }
    };
    World.prototype.animate = function () {
        var _this = this;
        var delta = this.clock.getDelta();
        requestAnimationFrame(function () {
            return _this.animate();
        });
        if(this.t > 1) {
            this.t = 0;
        }
        if(this.model.skin) {
            for(var i = 0; i < this.model.skin.morphTargetInfluences.length; i++) {
                this.model.skin.morphTargetInfluences[i] = 0;
            }
            this.model.skin.morphTargetInfluences[Math.floor(this.t * 30)] = 1;
            this.t += delta;
            this.pointLight.position.x = 20 * (this.t - 0.5);
            this.pointLightModel.position = this.pointLight.position;
        }
        this.renderer.render(this.scene, this.camera);
    };
    return World;
})();
