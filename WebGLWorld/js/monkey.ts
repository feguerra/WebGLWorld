/// <reference path="../vendor/three.d.ts" />


class Monkey {
    private mesh;
    private dae;
    private skin;

    constructor (path, callback) {
        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;

        loader.load(path, function (collada) {
            this.dae = collada.scene;
            //this.skin = collada.skins[0];
            
            this.dae.scale.x = this.dae.scale.y = this.dae.scale.z = 20;
            //this.dae.position.x = -1;
            //this.dae.updateMatrix();

            callback();
        });
    }

    getModel()
    {
        return this.mesh;
    }
    
}