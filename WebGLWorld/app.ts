/// <reference path="vendor/jquery.d.ts" />
/// <reference path="vendor/three.d.ts" />
/// <reference path="js/terreno.ts" />
/// <reference path="js/Boids.ts" />

// Codigo inicializacion
$(document).ready(function() {
    var world = new World();
    //world.animate();

    var terr = new Terreno();   //Test: usar clases de otros archivos *.ts
});


/// Clase que contiene todos los elementos de WebGL + ThreeJS
class World {
    private canvasWidth = window.innerWidth;
    private canvasHeight = 480;
    private scene; 
    private camera;
    private mesh;
    private renderer;
    private controls;
    private clock = new THREE.Clock();
    private boids : Boids;

    constructor() {
        this.camera = new THREE.PerspectiveCamera(75, this.canvasWidth/this.canvasHeight, 1, 10000);
        this.camera.position.z = 1000;
    
        //----------------------------cubo --------------------------------
        this.scene = new THREE.Scene(); 
        var geometry = new THREE.CubeGeometry(200, 200, 200); 
        var material = new THREE.MeshBasicMaterial({ color: 0xcc0000, wireframe: false });

        this.mesh = new THREE.Mesh(geometry, material);
        //this.scene.add(this.mesh);
        //---------------------end cubo -------------------------------

        //-------------------- terreno -------------------------------
        // GROUND
		var groundGeo = new THREE.PlaneGeometry( 10000, 10000 );
		var groundMat = new THREE.MeshPhongMaterial( { ambient: 0xffffff, color: 0xffffff, specular: 0x050505 } );
		groundMat.color.setHSV( 0.095, 0.5, 1 );

		var ground = new THREE.Mesh( groundGeo, groundMat );
		ground.rotation.x = -Math.PI/2;
		ground.position.y = -33;
		this.scene.add( ground );

		ground.receiveShadow = true;
        // --------------------------------------------------------

        this.controls = new THREE.FirstPersonControls( this.camera );

		this.controls.movementSpeed = 60;
		this.controls.lookSpeed = 0.05;
		this.controls.noFly = true;
		this.controls.lookVertical = false;
        
        this.renderer = new THREE.CanvasRenderer();
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        $('#canvas-wrapper').append($(this.renderer.domElement));

        this.boids = new Boids();
        this.boids.loadModel(this.scene, () => {
            this.animate();
        });
    }

    animate() {
        // Prepararse para dibujar siguiente frame:
        requestAnimationFrame(() => this.animate());

        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.02;
        
        var delta = this.clock.getDelta(),
		time = this.clock.getElapsedTime() * 5;
		this.controls.update( delta );

		this.boids.update(delta);

        this.renderer.render(this.scene, this.camera);        
    }
}