/// <reference path="../vendor/jquery.d.ts" />
/// <reference path="../vendor/three.d.ts" />
/// <reference path="../vendor/Physijs/physijs.d.ts" />

class PhysicWorld {
    private canvasWidth = window.innerWidth;
    private canvasHeight = 480;
    public scene; 
    public camera;    
    private renderer;
    private ground_material;
        
    constructor() 
    {
        this.scene = new Physijs.Scene;
		this.scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
		/*this.scene.addEventListener(
			'update',
			function() {
				//applyForce();
				this.scene.simulate( undefined, 1 );
			}
		);*/
        
		this.camera = new THREE.PerspectiveCamera(
			35,
			window.innerWidth / window.innerHeight,
			1,
			1000
		);
		this.camera.position.set( 60, 50, 60 );
		this.camera.lookAt( this.scene.position );
		this.scene.add( this.camera );
		
		// Light
		var light = new THREE.DirectionalLight( 0xFFFFFF );
		light.position.set( 20, 40, -15 );
		light.target.position.copy( this.scene.position );
		light.castShadow = true;
		light.shadowCameraLeft = -60;
		light.shadowCameraTop = -60;
		light.shadowCameraRight = 60;
		light.shadowCameraBottom = 60;
		light.shadowCameraNear = 20;
		light.shadowCameraFar = 200;
		light.shadowBias = -.0001
		light.shadowMapWidth = light.shadowMapHeight = 2048;
		light.shadowDarkness = .7;
		this.scene.add( light );
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        document.body.appendChild(this.renderer.domElement);
        this.addGround();

        for (var i = 0; i<10; i++)
            this.addRandomBox();
    }

    init() 
    {
        requestAnimationFrame( () => this.render() );
		this.scene.simulate();
    }

    addGround() {
        // Material
        this.ground_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'images/rocks.jpg' ) }),
			.8, // high friction
			.4 // low restitution
		);
		this.ground_material.map.wrapS = this.ground_material.map.wrapT = THREE.RepeatWrapping;
		this.ground_material.map.repeat.set( 3, 3 );
        
        // Ground
		var ground = new Physijs.BoxMesh(
			new THREE.CubeGeometry(100, 1, 100),
			this.ground_material,
			0 // mass
		);
		ground.receiveShadow = true;
	    this.scene.add( ground );
    }

    addRandomBox() {
        // Materials
        var box_material = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('images/plywood.jpg') }),
            .4, // low friction
            .6 // high restitution
        );
        box_material.map.wrapS = this.ground_material.map.wrapT = THREE.RepeatWrapping;
        box_material.map.repeat.set(.25, .25);

        var box = new Physijs.BoxMesh(
            new THREE.CubeGeometry(4, 4, 4),
            box_material
        );
        box.position.set(
            Math.random() * 50 - 25,
            10 + Math.random() * 5,
            Math.random() * 50 - 25
        );
        box.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        box.scale.set(
            Math.random() * 1 + .5,
            Math.random() * 1 + .5,
            Math.random() * 1 + .5
        );
        box.castShadow = true;
        this.scene.add(box);
        //this.boxes.push( box );
    }

    /*
    private applyForce () {
		if (!mouse_position) return;
		var strength = 35, distance, effect, offset, box;
		
		for ( var i = 0; i < boxes.length; i++ ) {
			box = boxes[i];
			distance = mouse_position.distanceTo( box.position ),
			effect = mouse_position.clone().subSelf( box.position ).normalize().multiplyScalar( strength / distance ).negate(),
			offset = mouse_position.clone().subSelf( box.position );
			box.applyImpulse( effect, offset );
		}
	}*/

    private render() {
		requestAnimationFrame( () => this.render() );
        this.renderer.render(this.scene, this.camera);

        this.scene.simulate();
    }

}