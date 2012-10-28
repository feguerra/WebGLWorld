/// <reference path="../vendor/three.d.ts" />


// Grilla
class Terreno {
    public size: number;
    public step: number;
    public mesh;

    constructor () {
        this.size = 14;
        this.step = 1;
    }

    load(callback) {
        var geometry = new THREE.Geometry();
	    var material = new THREE.LineBasicMaterial( { color: 0xcccccc, opacity: 0.2 } );

	    for (var i = - this.size; i <= this.size; i += this.step) {

		    geometry.vertices.push( new THREE.Vector3( - this.size, - 0.04, i ));
		    geometry.vertices.push( new THREE.Vector3(   this.size, - 0.04, i ));

		    geometry.vertices.push( new THREE.Vector3( i, - 0.04, - this.size ));
		    geometry.vertices.push( new THREE.Vector3( i, - 0.04,   this.size ));
	    }

	    this.mesh = new THREE.Line( geometry, material, THREE.LinePieces);

	    callback();
    }
}