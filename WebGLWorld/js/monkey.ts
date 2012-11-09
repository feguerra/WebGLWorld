/// <reference path="../vendor/three.d.ts" />


class Monkey {
    private path;
    public mesh;
    public skin;

    constructor (path) {
        this.path = path;
    }

    load(callback) {
        var loader = new THREE.ColladaLoader();
        loader.options.convertUpAxis = true;

        var monkey = this;
        loader.load(this.path, function (collada) {
            monkey.mesh = collada.scene;
            monkey.skin = collada.skins[0];
            
            monkey.mesh.scale.x = monkey.mesh.scale.y = monkey.mesh.scale.z = 0.002;
            monkey.mesh.updateMatrix();

            callback();
        }, function (info) {
            //console.info("total: " + info["total"] + ", loaded: " + +info["loaded"]);
        });
    }
}