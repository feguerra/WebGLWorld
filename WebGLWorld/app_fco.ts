/// <reference path="vendor/jquery.d.ts" />
/// <reference path="vendor/three.d.ts" />
/// <reference path="js/physicWorld.ts" />


// Codigo inicializacion
$(document).ready(function () {
    Physijs.scripts.worker = 'vendor/Physijs/physijs_worker.js';

    var world = new PhysicWorld();
    world.init();

    //controles
    $('#posX').change(function () {
        world.camera.position.x = $(this).val();
    });
    $('#posY').change(function () {
        world.camera.position.y = $(this).val();
    });
    $('#posZ').change(function () {
        world.camera.position.z = $(this).val();
        //world.camera.lookAt(mon.mesh.position);
    });
});