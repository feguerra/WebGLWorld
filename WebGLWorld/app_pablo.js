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
            monkey.dae = collada.scene;
            monkey.skin = collada.skins[0];
            monkey.dae.scale.x = monkey.dae.scale.y = monkey.dae.scale.z = 0.002;
            monkey.dae.updateMatrix();
            callback();
        }, function (info) {
        });
    };
    return Monkey;
})();
$(document).ready(function () {
    var world = new World();
    world.animate();
    var mon = new Monkey('models/monster/monster.dae');
    mon.load(function () {
        world.addMesh(mon.dae);
        world.camera.lookAt(mon.dae.position);
        console.info("model cargado!");
    });
    var grid = new Terreno();
    grid.load(function () {
        world.addMesh(grid.mesh);
        console.info("grid cargado!");
    });
    $('#posX').change(function () {
        world.camera.position.x = $(this).val();
        world.camera.lookAt(mon.dae.position);
    });
    $('#posY').change(function () {
        world.camera.position.y = $(this).val();
        world.camera.lookAt(mon.dae.position);
    });
    $('#posZ').change(function () {
        world.camera.position.z = $(this).val();
        world.camera.lookAt(mon.dae.position);
    });
});
var World = (function () {
    function World() {
        this.canvasWidth = 640;
        this.canvasHeight = 480;
        this.camera = new THREE.PerspectiveCamera(45, this.canvasWidth / this.canvasHeight, 1, 2000);
        this.camera.position.set(0, 5, 10);
        this.scene = new THREE.Scene();
        var particleLight = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({
            color: 16777215
        }));
        this.scene.add(new THREE.AmbientLight(13421772));
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        document.body.appendChild(this.renderer.domElement);
    }
    World.prototype.addMesh = function (model) {
        if(model == null) {
            console.error("undefined model");
        } else {
            this.scene.add(model);
        }
    };
    World.prototype.animate = function () {
        var _this = this;
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(function () {
            return _this.animate();
        });
    };
    return World;
})();
