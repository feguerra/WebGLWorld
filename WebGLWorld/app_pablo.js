var Terreno = (function () {
    function Terreno() { }
    return Terreno;
})();
var Monkey = (function () {
    function Monkey(path, callback) {
        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;
        loader.load(path, function (collada) {
            this.dae = collada.scene;
            this.dae.scale.x = this.dae.scale.y = this.dae.scale.z = 20;
            callback();
        });
    }
    Monkey.prototype.getModel = function () {
        return this.mesh;
    };
    return Monkey;
})();
$(document).ready(function () {
    var world = new World();
    var mon = new Monkey('models/monkey_model.dae', function () {
        world.addModel(mon.getModel());
        world.animate();
    });
    var terr = new Terreno();
});
var World = (function () {
    function World() {
        this.canvasWidth = 640;
        this.canvasHeight = 480;
        this.camera = new THREE.PerspectiveCamera(75, this.canvasWidth / this.canvasHeight, 1, 10000);
        this.camera.position.z = 1000;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.CanvasRenderer();
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        document.body.appendChild(this.renderer.domElement);
    }
    World.prototype.addModel = function (model) {
        this.scene.add(model);
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
