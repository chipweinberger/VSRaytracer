/// <reference path="webgl.ts"/>
/// <reference path="raytrace.ts"/>
//default parameters shared by raytracer and webgl
var MAIN_pos = new THREE.Vector3(0, 1.5, 1);
var MAIN_at = new THREE.Vector3(0, 0, -200).normalize();
var MAIN_up = new THREE.Vector3(0, 200, 0).normalize();
var MAIN_fov = 70;
var MAIN_transMatrix = new THREE.Matrix4().makeTranslation(-MAIN_pos.x, -MAIN_pos.y, -MAIN_pos.z);
var MAIN_rotMatrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), MAIN_at, MAIN_up);
var MAIN_rotTransMatrix = MAIN_rotMatrix.clone().multiply(MAIN_transMatrix);
var MAIN_perspective = new THREE.Matrix4().makePerspective(MAIN_fov, 1, 0.1, 1000);
var MAIN_viewMatrix = MAIN_perspective.clone().multiply(MAIN_rotTransMatrix);
var MAIN_maxRecursion = 2;
//where the textures will be loaded
var MAIN_textures = {};
var materials = {
    redplastic: {
        emit: new THREE.Vector3(0, 0, 0),
        amb: new THREE.Vector3(0.1, 0.1, 0.1),
        diff: new THREE.Vector3(0.6, 0.0, 0.0),
        spec: new THREE.Vector3(0.6, 0.6, 0.6),
        shiny: 100,
        mirror: new THREE.Vector3(0.3, 0.3, 0.3),
        texture: null,
    },
    brass: {
        emit: new THREE.Vector3(0, 0, 0),
        amb: new THREE.Vector3(0.329412, 0.223529, 0.027451),
        diff: new THREE.Vector3(0.780392, 0.568627, 0.113725),
        spec: new THREE.Vector3(0.992157, 0.941176, 0.807843),
        shiny: 27.8974,
        mirror: new THREE.Vector3(0.6, 0.6, 0.6),
        texture: null,
    },
    mirror: {
        emit: new THREE.Vector3(0, 0, 0),
        amb: new THREE.Vector3(0, 0, 0),
        diff: new THREE.Vector3(0, 0, 0),
        spec: new THREE.Vector3(0, 0, 0),
        mirror: new THREE.Vector3(1, 1, 1),
        shiny: 0,
        texture: null,
    },
    turquoise: {
        emit: new THREE.Vector3(0.0, 0.0, 0.0),
        amb: new THREE.Vector3(0.1, 0.18725, 0.1745),
        diff: new THREE.Vector3(0.396, 0.74151, 0.69102),
        spec: new THREE.Vector3(0.297254, 0.30829, 0.306678),
        mirror: new THREE.Vector3(.2, .2, .2),
        shiny: 12.8,
        texture: null,
    },
    wood: {
        emit: new THREE.Vector3(0, 0, 0),
        amb: new THREE.Vector3(0, 0, 0),
        diff: new THREE.Vector3(1.4, 1.4, 1.4),
        spec: new THREE.Vector3(.7, .7, .7),
        mirror: new THREE.Vector3(.4, .4, .4),
        shiny: 30,
        texture: "wood",
    }
};
function addAreaLight(pos, dir, length, color, strength, samples, jittered) {
    var positions = [];
    for (var x = 0; x < samples; x++) {
        for (var y = 0; y < samples; y++) {
            if (jittered) {
                x = THREE.Math.randFloat(x, x + 1);
                y = THREE.Math.randFloat(y, y + 1);
            }
            positions.push(new THREE.Vector3(x / length, y / length, 0)); //unscaled length of one
        }
    }
    for (var i in positions) {
        var vert = positions[i];
        var scale = new THREE.Matrix4().makeScale(length, length, length);
        var translate = new THREE.Matrix4().makeTranslation(pos.x, pos.y, pos.z);
        positions[i] = vert.applyMatrix4(scale).applyMatrix4(translate);
    }
    for (var i in positions) {
        var pos = positions[i];
        var intensity = strength / samples;
        lights.push({ pos: pos, color: color, strength: intensity });
    }
}
var lights = [
    {
        pos: new THREE.Vector3(2, 2, 0),
        color: new THREE.Vector3(1, 1, 1),
        strength: .8
    }
];
var object_list = [
    { type: "sphere", pos: new THREE.Vector3(-1.5, 1, -8), size: 1, material: materials.redplastic },
    { type: "sphere", pos: new THREE.Vector3(1.5, 1, -8), size: 1, material: materials.mirror },
    { type: "sphere", pos: new THREE.Vector3(0, 3, -5), size: 1, material: materials.turquoise },
    { type: "plane", pos: new THREE.Vector3(0, 0, 0), at: new THREE.Vector3(0, 1, 0), material: materials.wood }
];
window.addEventListener("keydown", function (ev) {
    var rotSpeed = 0.04;
    var transSpeed = .1;
    var transX = new THREE.Matrix4().makeTranslation(transSpeed, 0, 0);
    var transY = new THREE.Matrix4().makeTranslation(0, transSpeed, 0);
    var transZ = new THREE.Matrix4().makeTranslation(0, 0, transSpeed);
    switch (ev.keyCode) {
        case 84:
            raytrace();
            break;
        case 39:
            MAIN_at.applyAxisAngle(MAIN_up, rotSpeed);
            break;
        case 37:
            MAIN_at.applyAxisAngle(MAIN_up, -rotSpeed);
            break;
        case 38:
            var perpendicular = new THREE.Vector3().crossVectors(MAIN_at, MAIN_up).normalize();
            MAIN_at.applyAxisAngle(perpendicular, rotSpeed);
            MAIN_up.applyAxisAngle(perpendicular, rotSpeed);
            break;
        case 40:
            var perpendicular = new THREE.Vector3().crossVectors(MAIN_at, MAIN_up).normalize();
            MAIN_at.applyAxisAngle(perpendicular, -rotSpeed);
            MAIN_up.applyAxisAngle(perpendicular, -rotSpeed);
            break;
        case 65:
            MAIN_transMatrix.multiply(transX);
            break;
        case 90:
            MAIN_transMatrix.multiply(new THREE.Matrix4().getInverse(transX));
            break;
        case 83:
            MAIN_transMatrix.multiply(transY);
            break;
        case 88:
            MAIN_transMatrix.multiply(new THREE.Matrix4().getInverse(transY));
            break;
        case 68:
            MAIN_transMatrix.multiply(transZ);
            break;
        case 67:
            MAIN_transMatrix.multiply(new THREE.Matrix4().getInverse(transZ));
            break;
        case 70:
            MAIN_up.applyAxisAngle(MAIN_at, rotSpeed);
            break;
        case 86:
            MAIN_up.applyAxisAngle(MAIN_at, -rotSpeed);
            break;
    }
    //set view matrix
    MAIN_rotMatrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), MAIN_at, MAIN_up);
    MAIN_rotTransMatrix = MAIN_rotMatrix.clone().multiply(MAIN_transMatrix);
    MAIN_viewMatrix = MAIN_perspective.clone().multiply(MAIN_rotTransMatrix);
});
function draw() {
    renderWebgl();
    window.requestAnimationFrame(draw);
}
function loadTextures() {
    var images = document.getElementsByClassName("texture");
    for (var i in images) {
        try {
            var img = images[i];
            var canvas = document.createElement("CANVAS");
            canvas.height = img.height;
            canvas.width = img.width;
            var context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);
            MAIN_textures[img.id] = context.getImageData(0, 0, img.width, img.height);
        }
        finally {
            continue;
        }
    }
}
function main() {
    loadTextures();
    initWebgl();
    initRaytrace();
    window.requestAnimationFrame(draw);
}
//# sourceMappingURL=main.js.map