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
    private camera_pos_init = new THREE.Vector3(0,10,10);
    private camera_rot_init = new THREE.Vector3(0,0,0);
    private camera_max_x = 20;
    private camera_max_y = 20;
    private camera_max_z = 20;
    private mesh;
    private renderer;
    private controls;
    private clock = new THREE.Clock();
    private boids : Boids;

    constructor() {

        $("#reset_button").click(() =>{ this.resetCamera(); });
        $("#switch_camera_button").click(() =>{ this.switchCameraControls(); });
            
        this.camera = new THREE.PerspectiveCamera(75, this.canvasWidth/this.canvasHeight, 1, 10000);
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        $('#canvas-wrapper').append($(this.renderer.domElement));
        this.scene = new THREE.Scene();
        var loader = new THREE.SceneLoader();
        loader.callbackProgress = function (progress, result) {
            var total = progress.totalModels + progress.totalTextures;
			var loaded = progress.loadedModels + progress.loadedTextures;
            $("#scene_bar").attr("style", "width: "+loaded/total*100+"%;");
        }
		loader.load( "models/sandLandscapeCeilingBig/SandLandscape_big.js", ( loaded ) => {
            this.camera = loaded.currentCamera;
            this.resetCamera();
			this.camera.updateProjectionMatrix();
            this.scene = loaded.scene;
            this.renderer.setClearColor( loaded.bgColor, loaded.bgAlpha );

            //------------------------------- lights -------------------------------
		    var light = new THREE.DirectionalLight(0xffffff, 2);
		    light.position.set(-40,-20,10);
		    this.scene.add(light);
            //Naxo says: dejé esta luz para que se viera completo, hay que sacarla para que Fabián ponga las suyas :P.
            var ambient_light = new THREE.AmbientLight(0x222222);
		    this.scene.add(ambient_light);
		    //------------------------------- end lights -------------------------------
        
            //------------------------------- controles -------------------------------
            this.controls = new THREE.OrbitControls(this.camera);
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
        this.checkBounds();
		this.boids.update(delta);

        this.renderer.render(this.scene, this.camera);        
    }

    resetCamera() {
        this.camera.position.set(this.camera_pos_init.x,this.camera_pos_init.y,this.camera_pos_init.z);
        this.camera.rotation.set(this.camera_rot_init.x,this.camera_rot_init.y,this.camera_rot_init.z);
    }

    switchCameraControls() {
        if (this.controls instanceof THREE.FirstPersonControls) {
            this.controls = new THREE.OrbitControls(this.camera);
        }
        else if (this.controls instanceof THREE.OrbitControls) {
            this.controls = new THREE.FirstPersonControls( this.camera );
		    this.controls.movementSpeed = 15;
		    this.controls.lookSpeed = 0.02;
		    this.controls.noFly = true;
		    this.controls.lookVertical = true;
        }
    }

    checkBounds() { 
        var camera_x = this.camera.position.x;
        var camera_y = this.camera.position.y;
        var camera_z = this.camera.position.z;

        if(camera_x<-this.camera_max_x)
            this.camera.position.x = -this.camera_max_x;
        else if(camera_x>this.camera_max_x)
            this.camera.position.x = this.camera_max_x;
        if(camera_y<-this.camera_max_y)
            this.camera.position.y = -this.camera_max_y;
        else if(camera_y>this.camera_max_y)
            this.camera.position.y = this.camera_max_y;
            if(camera_z<-this.camera_max_z)
            this.camera.position.z = -this.camera_max_z;
        else if(camera_z>this.camera_max_z)
            this.camera.position.z = this.camera_max_z;
    }
}