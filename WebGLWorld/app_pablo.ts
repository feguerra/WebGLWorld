/// <reference path="vendor/jquery.d.ts" />
/// <reference path="vendor/three.d.ts" />
/// <reference path="js/terreno.ts" />
/// <reference path="js/monkey.ts" />


// Codigo inicializacion
$(document).ready(function() {

    var world = new World();
    
        
    //var mon = new Monkey('models/monkey/monkey.dae');
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
    
    //controles
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


/// Clase que contiene todos los elementos de WebGL + ThreeJS
class World {
    private canvasWidth = window.innerWidth;
    private canvasHeight = 480;
    public scene; 
    public camera;    
    private renderer;
    
    public model;
    public pointLight;
    public pointLightModel; // mesh para saber donde esta la luz

    private t = 0;
    private clock = new THREE.Clock();

    constructor() 
    {
        this.camera = new THREE.PerspectiveCamera(45, this.canvasWidth/this.canvasHeight, 1, 2000);
        this.camera.position.set(0,5,10);

        this.scene = new THREE.Scene(); 

        // light
        this.scene.add( new THREE.AmbientLight( 0xcccccc ) );
        // luz puntual
        this.pointLight = new THREE.PointLight(0xff0000, 5, 50); 
        this.pointLight.position.set(0, 5, 5); 
        this.scene.add( this.pointLight );
        // esfera para "ver" la luz puntual
        this.pointLightModel = new THREE.Mesh( new THREE.SphereGeometry( 0.5 ), new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
        this.pointLightModel.position = this.pointLight.position;
		this.scene.add( this.pointLightModel );
        
        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    addMesh(model)
    {
        var mesh = model.mesh;
        if (mesh == null)
            console.error("undefined model");
        else 
        {
            this.scene.add(mesh);
        }
    }

    animate() 
    {
        var delta = this.clock.getDelta();

        // Prepararse para dibujar siguiente frame:
        requestAnimationFrame(() => this.animate());


        if ( this.t > 1 ) this.t = 0;
        
        //$.each(this.models,function (index,value) {

        if (this.model.skin) {
            for (var i = 0; i < this.model.skin.morphTargetInfluences.length; i++) {
                this.model.skin.morphTargetInfluences[i] = 0;
            }

            this.model.skin.morphTargetInfluences[Math.floor(this.t * 30)] = 1;

            this.t += delta;

            this.pointLight.position.x = 20*(this.t - 0.5);
            this.pointLightModel.position = this.pointLight.position;
        }

        this.renderer.render(this.scene, this.camera);
    }

   
    
}