/// <reference path="vendor/jquery.d.ts" />
/// <reference path="vendor/three.d.ts" />
/// <reference path="js/terreno.ts" />

// Codigo inicializacion
$(document).ready(function() {

    var world = new World();
    world.animate();

    var terr = new Terreno();   //Test: usar clases de otros archivos *.ts
});


/// Clase que contiene todos los elementos de WebGL + ThreeJS
class World {
    private canvasWidth = 640;
    private canvasHeight = 480;
    private scene; 
    private camera;
    private mesh;
    private renderer;

    constructor() {
        this.camera = new THREE.PerspectiveCamera(75, this.canvasWidth/this.canvasHeight, 1, 10000);
        this.camera.position.z = 1000;

        this.scene = new THREE.Scene(); 
        var geometry = new THREE.CubeGeometry(200, 200, 200); 
        var material = new THREE.MeshBasicMaterial({ color: 0xcc0000, wireframe: false });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
        
        this.renderer = new THREE.CanvasRenderer();
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    animate() {
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;
        this.renderer.render(this.scene, this.camera);

        // Prepararse para dibujar siguiente frame:
        requestAnimationFrame(() => this.animate());
    }
}