/// <reference path="vendor/jquery.d.ts" />
/// <reference path="vendor/three.d.ts" />
/// <reference path="js/terreno.ts" />
/// <reference path="js/monkey.ts" />

// Codigo inicializacion
$(document).ready(function() {

    var world = new World();

    var mon = new Monkey('models/monkey_model.dae', function () {
        world.addModel(mon.getModel())

        world.animate();    
    });

    var terr = new Terreno();   //Test: usar clases de otros archivos *.ts
    
});


/// Clase que contiene todos los elementos de WebGL + ThreeJS
class World {
    private canvasWidth = 640;
    private canvasHeight = 480;
    public scene; 
    private camera;
    private mesh;
    private renderer;

    constructor() 
    {
        this.camera = new THREE.PerspectiveCamera(75, this.canvasWidth/this.canvasHeight, 1, 10000);
        this.camera.position.z = 1000;

        this.scene = new THREE.Scene(); 
        
        this.renderer = new THREE.CanvasRenderer();
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    addModel(model)
    {
        this.scene.add(model);
    }
    
    animate() 
    {
        this.renderer.render(this.scene, this.camera);

        // Prepararse para dibujar siguiente frame:
        requestAnimationFrame(() => this.animate());
    }

   
    
}