/// <reference path="../vendor/three.d.ts" />
/// <reference path="IModel.ts" />

class Horse implements IModel {
    public position;
    private model;
        
    private x_max = 0;
    private x_world_length = 0;
    private y_max = 0;
    private _scale = 0.01;
    constructor () {
        this.position = new THREE.Vector3();
    }

    setRandPos() {
        this.position.x = -this.x_world_length/2 + Math.random() * 10;
        this.position.y = Math.random()*20;
        this.position.z = -10;
    }

    loadModel(model_path, scene, callback) {
            var loader = new THREE.JSONLoader();
            var horse = this;

			loader.load( model_path, function( geometry ) {				
					geometry.materials[ 0 ].morphTargets = true;
					geometry.materials[ 0 ].morphNormals = true;
					geometry.computeMorphNormals();
					var material = new THREE.MeshLambertMaterial( { color: 0xffaa55, morphTargets: true, vertexColors: THREE.FaceColors } );
                	var meshAnim = new THREE.MorphAnimMesh( geometry, material );
					meshAnim.duration = 1000;
					meshAnim.castShadow = true;
					meshAnim.recieveShadow = true;
					var s = horse._scale;
					meshAnim.scale.set( s, s, s );
					horse.setRandPos();
					meshAnim.position.set( horse.position.x, horse.position.y, horse.position.z );
					meshAnim.rotation.set(0,Math.PI/2,Math.PI/2);
					horse.model = meshAnim;
					scene.add( horse.model );
                    callback();
                } );
    }

    morphColorsToFaceColors(geometry) {
        if ( geometry.morphColors && geometry.morphColors.length ) {
			var colorMap = geometry.morphColors[ 0 ];
			for ( var i = 0; i < colorMap.colors.length; i ++ ) {
				geometry.faces[ i ].color = colorMap.colors[ i ];
				THREE.ColorUtils.adjustHSV( geometry.faces[ i ].color, 0, -0.1, 0 );
			}
		}
    }

    checkBounds() {
        //mov en un toro
        if (this.position.x > this.x_max) { 
            this.position.x -= this.x_world_length;
            this.position.y = Math.random()*20;
        }
    }
       
    update(delta) {
        this.model.updateAnimation(1000 * delta);
        this.position.x += 0.1;
        this.checkBounds();
        this.model.position = this.position;
    }

    getModel() {
        return this.model;
    }

    setWorldSize(x_max, x_world) {
        this.x_max = x_max;
        this.x_world_length = x_world;
    }
}