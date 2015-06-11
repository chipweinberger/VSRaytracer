

/// <reference path="webgl.ts"/>
/// <reference path="raytrace.ts"/>


//default parameters shared by raytracer and webgl
var MAIN_pos = new THREE.Vector3(0, 4, 20)
var MAIN_at = new THREE.Vector3(0, 0, -200).normalize()
var MAIN_up = new THREE.Vector3(0, 200, 0).normalize()
var MAIN_fov = 70

var MAIN_transMatrix = new THREE.Matrix4().makeTranslation(-MAIN_pos.x, -MAIN_pos.y, -MAIN_pos.z)
var MAIN_rotMatrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), MAIN_at, MAIN_up)
var MAIN_rotTransMatrix = MAIN_rotMatrix.clone().multiply(MAIN_transMatrix)

var MAIN_perspective = new THREE.Matrix4().makePerspective(MAIN_fov, 1, 0.1, 1000)
var MAIN_viewMatrix = MAIN_perspective.clone().multiply(MAIN_rotTransMatrix)

var object_list = [
    { type: "sphere", pos: new THREE.Vector3(1, 1, -8), size: 1},
    { type: "plane", pos: new THREE.Vector3(0, 0, 0), at: new THREE.Vector3(0,1,0)}
]

window.addEventListener("keydown", function (ev) {

    var rotSpeed = 0.04;
    var transSpeed = .1;

    var transX = new THREE.Matrix4().makeTranslation(transSpeed, 0, 0)
    var transY = new THREE.Matrix4().makeTranslation(0, transSpeed, 0)
    var transZ = new THREE.Matrix4().makeTranslation(0, 0, transSpeed)


    switch (ev.keyCode) {
        case 84://t
            raytrace(); break;
        case 39://right arrow
            MAIN_at.applyAxisAngle(MAIN_up, rotSpeed); break;
        case 37://left arrow
            MAIN_at.applyAxisAngle(MAIN_up, -rotSpeed); break;
        case 38://up arrow
            var perpendicular = new THREE.Vector3().crossVectors(MAIN_at, MAIN_up).normalize()
            MAIN_at.applyAxisAngle(perpendicular, rotSpeed);
            MAIN_up.applyAxisAngle(perpendicular, rotSpeed); break;
        case 40://down arrow
            var perpendicular = new THREE.Vector3().crossVectors(MAIN_at, MAIN_up).normalize()
            MAIN_at.applyAxisAngle(perpendicular, -rotSpeed);
            MAIN_up.applyAxisAngle(perpendicular, -rotSpeed); break;
        case 65://a
            MAIN_transMatrix.multiply(transX); break;
        case 90://z
            MAIN_transMatrix.multiply(new THREE.Matrix4().getInverse(transX)); break;
        case 83://s           
            MAIN_transMatrix.multiply(transY); break;
        case 88://x           
            MAIN_transMatrix.multiply(new THREE.Matrix4().getInverse(transY)); break;
        case 68://d           
            MAIN_transMatrix.multiply(transZ); break;
        case 67://c           
            MAIN_transMatrix.multiply(new THREE.Matrix4().getInverse(transZ)); break;
        case 70://f
            MAIN_up.applyAxisAngle(MAIN_at, rotSpeed); break;
        case 86://v
            MAIN_up.applyAxisAngle(MAIN_at, -rotSpeed); break;
    }

    //set view matrix
    MAIN_rotMatrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), MAIN_at, MAIN_up)
    MAIN_rotTransMatrix = MAIN_rotMatrix.clone().multiply(MAIN_transMatrix)
    MAIN_viewMatrix = MAIN_perspective.clone().multiply(MAIN_rotTransMatrix)

})function draw() {

    renderWebgl();

    window.requestAnimationFrame(draw);

}function main() {    initWebgl();    initRaytrace();
    window.requestAnimationFrame(draw);

} 