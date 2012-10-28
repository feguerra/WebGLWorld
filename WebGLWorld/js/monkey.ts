/// <reference path="../vendor/three.d.ts" />


class Monkey {
    private path;
    public dae;
    private skin;

    constructor (path) {
        this.path = path;
    }

    load(callback) {
        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;

        var monkey = this;
        loader.load(this.path, function (collada) {
            monkey.dae = collada.scene;
            monkey.skin = collada.skins[0];
            
            monkey.dae.scale.x = monkey.dae.scale.y = monkey.dae.scale.z = 0.002;
            monkey.dae.updateMatrix();

            callback();
        }, function (info) {
            //console.info("total: " + info["total"] + ", loaded: " + +info["loaded"]);
        });
    }
}