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
$(document).ready(function () {
    var world = new World();
    world.animate();
    var terr = new Terreno();
});
var World = (function () {
    function World() {
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
        this.scene.add(this.mesh);
        this.controls = new THREE.FirstPersonControls(this.camera);
        this.controls.movementSpeed = 60;
        this.controls.lookSpeed = 0.05;
        this.controls.noFly = true;
        this.controls.lookVertical = false;
        this.renderer = new THREE.CanvasRenderer();
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        $('#canvas-wrapper').append($(this.renderer.domElement));
    }
    World.prototype.animate = function () {
        var _this = this;
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;
        var delta = this.clock.getDelta();
        var time = this.clock.getElapsedTime() * 5;

        this.controls.update(delta);
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(function () {
            return _this.animate();
        });
    };
    return World;
})();
