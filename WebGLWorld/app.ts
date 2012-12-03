/// <reference path="vendor/jquery.d.ts" />
/// <reference path="vendor/three.d.ts" />
/// <reference path="js/terreno.ts" />
/// <reference path="js/Boids.ts" />
var world;
// Codigo inicializacion
$(document).ready(function() {
    world = new World();
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
        this.camera.rotation.set(-0.8,0.1,0.1); 
        this.camera.position.set(2,6.7,5.6);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        $('#canvas-wrapper').append($(this.renderer.domElement));
        this.scene = new THREE.Scene();
        var loader = new THREE.SceneLoader();

		loader.load( "models/sandLandscapeCube/SandLandscape.js", ( loaded ) => {
            this.camera = loaded.currentCamera;
			this.camera.updateProjectionMatrix();
            this.scene = loaded.scene;
            this.renderer.setClearColor( loaded.bgColor, loaded.bgAlpha );

            //------------------------------- lights -------------------------------
		    var light = new THREE.DirectionalLight(0x111111, 100);
		    light.position.x = 20;
		    light.position.y = 20;
		    this.scene.add(light);
		    var asdf = new THREE.AmbientLight(0x444444);
		    this.scene.add(asdf);
            //------------------------------- end lights -------------------------------
        
            //------------------------------- controles -------------------------------
            this.controls = new THREE.FirstPersonControls( this.camera );
		    this.controls.movementSpeed = 60;
		    this.controls.lookSpeed = 0.02;
		    this.controls.noFly = true;
		    this.controls.lookVertical = true;
            //------------------------------- end controles -------------------------------

            //------------------------------- BOIDS -------------------------------
            this.boids = new Boids();
            this.boids.loadModel(this.scene, () => {
                this.animate();
            });
            //------------------------------- end boids -------------------------------        
      });
    }

    animate() {
        // Prepararse para dibujar siguiente frame:
        requestAnimationFrame(() => this.animate());
        
        var delta = this.clock.getDelta(),
		time = this.clock.getElapsedTime() * 5;
		this.controls.update( delta );

		this.boids.update(delta);

        this.renderer.render(this.scene, this.camera);        
    }
}