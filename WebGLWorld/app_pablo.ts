/// <reference path="vendor/jquery.d.ts" />
/// <reference path="vendor/three.d.ts" />
/// <reference path="js/terreno.ts" />
/// <reference path="js/monkey.ts" />

// Codigo inicializacion
$(document).ready(function() {

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
    
    //controles
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


/// Clase que contiene todos los elementos de WebGL + ThreeJS
class World {
    private canvasWidth = window.innerWidth;
    private canvasHeight = 480;
    public scene; 
    public camera;
    private mesh;
    private renderer;

    constructor() 
    {
        this.camera = new THREE.PerspectiveCamera(45, this.canvasWidth/this.canvasHeight, 1, 2000);
        this.camera.position.set(0,5,10);

        this.scene = new THREE.Scene(); 

        // light
        var particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
		//this.scene.add( particleLight );
        this.scene.add( new THREE.AmbientLight( 0xcccccc ) );
        
        this.renderer = //new THREE.CanvasRenderer();
                        new THREE.WebGLRenderer();

        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    addMesh(model)
    {
        if (model == null)
            console.error("undefined model");
        else
            this.scene.add(model);
    }
    
    animate() 
    {
        this.renderer.render(this.scene, this.camera);

        // Prepararse para dibujar siguiente frame:
        requestAnimationFrame(() => this.animate());
    }

   
    
}