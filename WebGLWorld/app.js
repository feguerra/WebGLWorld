var Terreno = (function () {
    function Terreno() { }
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
