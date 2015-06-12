

/// <reference path="webgl.ts"/>
/// <reference path="raytrace.ts"/>


//default parameters shared by raytracer and webgl
var MAIN_pos = new THREE.Vector3(-1, 4, 10)
var MAIN_at = new THREE.Vector3(0, 0, -200).normalize()
var MAIN_up = new THREE.Vector3(0, 200, 0).normalize()
var MAIN_fov = 45

var MAIN_transMatrix = new THREE.Matrix4().makeTranslation(-MAIN_pos.x, -MAIN_pos.y, -MAIN_pos.z)
var MAIN_rotMatrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), MAIN_at, MAIN_up)
var MAIN_rotTransMatrix = MAIN_rotMatrix.clone().multiply(MAIN_transMatrix)

//for some reason I cant get the ray trace to match with the inverse alone
var MAIN_rayTraceAt = new THREE.Vector3(0, 0, -200).normalize()
var MAIN_rayTraceUp = new THREE.Vector3(0, 200, 0).normalize()
var MAIN_rayTraceRot = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), MAIN_rayTraceAt, MAIN_rayTraceUp)

var MAIN_perspective = new THREE.Matrix4().makePerspective(MAIN_fov, 1, 0.1, 1000)
var MAIN_viewMatrix = MAIN_perspective.clone().multiply(MAIN_rotTransMatrix)

var MAIN_maxRecursion = 2

//where the textures will be loaded
var MAIN_textures= {}


var materials = {
    redplastic: {
        emit: new THREE.Vector3(0, 0, 0),
        amb: new THREE.Vector3(0.1, 0.1, 0.1),
        diff: new THREE.Vector3(0.6, 0.0, 0.0),
        spec: new THREE.Vector3(0.6, 0.6, 0.6),
        shiny: 100,
        mirror: new THREE.Vector3(0.3, 0.3, 0.3),//how strongly deos it reflect each color
        texture: null,
        transmission: 0,
        indexOfRefraction: 0,
    },
    brass: {
        emit: new THREE.Vector3(0, 0, 0),
        amb: new THREE.Vector3(0.329412, 0.223529, 0.027451),
        diff: new THREE.Vector3(0.780392, 0.568627, 0.113725),
        spec: new THREE.Vector3(0.992157, 0.941176, 0.807843),
        shiny: 27.8974,
        mirror: new THREE.Vector3(0.6, 0.6, 0.6),//how strongly deos it reflect each color
        texture: null,
        transmission: 0,
        indexOfRefraction: 0,
    },
    mirror: {
        emit: new THREE.Vector3(0, 0, 0),
        amb: new THREE.Vector3(.05, .05, .05),
        diff: new THREE.Vector3(0, 0, 0),
        spec: new THREE.Vector3(0, 0, 0),
        mirror: new THREE.Vector3(1, 1, 1),//how strongly deos it reflect each color
        shiny: 0,
        texture: null,
        transmission: 0,
        indexOfRefraction: 0,
    },
    turquoise: {
        emit: new THREE.Vector3(0.0, 0.0, 0.0),
        amb: new THREE.Vector3(0.1, 0.18725, 0.1745),
        diff: new THREE.Vector3(0.396, 0.74151, 0.69102),
        spec: new THREE.Vector3(0.297254, 0.30829, 0.306678), 
        mirror: new THREE.Vector3(.2, .2, .2),  
        shiny: 12.8,
        texture: null,
        transmission: 0,
        indexOfRefraction: 0,
    },
    wood: {
        emit: new THREE.Vector3(0, 0, 0),
        amb: new THREE.Vector3(0, 0, 0),
        diff: new THREE.Vector3(1.4, 1.4, 1.4),//textures are kinda dim
        spec: new THREE.Vector3(.7, .7, .7),
        mirror: new THREE.Vector3(.4, .4, .4),//how strongly deos it reflect each color
        shiny: 30,
        texture: "wood",
        transmission: 0,
        indexOfRefraction: 0,
    },
    tiger: {
        emit: new THREE.Vector3(0, 0, 0),
        amb: new THREE.Vector3(0.0, 0, 0),
        diff: new THREE.Vector3(1.7, 1.7, 1.7),//textures are kinda dim
        spec: new THREE.Vector3(.3, .3, .3),
        mirror: new THREE.Vector3(0, 0, 0),//how strongly deos it reflect each color
        shiny: 10,
        texture: "tiger",
        transmission: 0,
        indexOfRefraction: 0,
    },
    glass: {
        emit: new THREE.Vector3(0, 0, 0),
        amb: new THREE.Vector3(0.0, 0, 0),
        diff: new THREE.Vector3(1.7, 1.7, 1.7),//textures are kinda dim
        spec: new THREE.Vector3(.3, .3, .3),
        mirror: new THREE.Vector3(0, 0, 0),//how strongly deos it reflect each color
        shiny: 10,
        texture: "tiger",
        transmission: .98,
        indexOfRefraction: 1.52,
    }

}

function addAreaLight(pos, dir, length, color, strength, samples, jittered) {

    var positions = []

    for (var x = 0; x < samples; x++) {
        for (var y = 0; y < samples; y++) {
            if (jittered) {
                var px = x + Math.random()
                var py = y + Math.random()
            }
            positions.push(new THREE.Vector3(px/samples*length,py/samples*length,0))//unscaled length of one
        }
    }

    for (var i in positions) {
        var vert = positions[i]
        var scale = new THREE.Matrix4().makeScale(length, length, length)
        var translate = new THREE.Matrix4().makeTranslation(pos.x, pos.y, pos.z)
        positions[i] = vert.applyMatrix4(scale).applyMatrix4(translate)
    }

    for (var i in positions) {
        var pos = positions[i]
        var intensity = strength / (samples*samples)

        lights.push({ pos: pos, color: color, strength: intensity, on: true} )
    }

}

function togglePointLight0() {
    lights[0].on = !lights[0].on;
    return lights[0].on
}

function togglePointLight1() {
    lights[1].on = !lights[1].on;
    return lights[1].on
}

function togglePointLight2() {
    lights[2].on = !lights[2].on;
    return lights[2].on
}

var lights = [
    {
        pos: new THREE.Vector3(2, 2, 0),
        color: new THREE.Vector3(1, 1, 1),
        strength: .8,
        on: true,
    },
    {
        pos: new THREE.Vector3(-6, 10, -8),
        color: new THREE.Vector3(1, 1, 0),
        strength: .8,
        on: false,
    },
    {
        pos: new THREE.Vector3(-2, 2, -3),
        color: new THREE.Vector3(1, 1, 1),
        strength: .8,
        on: false,
    }
]

var object_list = [
    { type: "plane", pos: new THREE.Vector3(0, 0, 0), scale: new THREE.Vector3(1, 1, 1), material: materials.wood },
    { type: "sphere", pos: new THREE.Vector3(-4, .3, -6), scale: new THREE.Vector3(0.3,0.3,0.3), material: materials.redplastic },
    { type: "sphere", pos: new THREE.Vector3(-1, 1, -6),  scale: new THREE.Vector3(1,1,1), material: materials.mirror },
    { type: "sphere", pos: new THREE.Vector3(3, 3, -6),    scale: new THREE.Vector3(0.5,3,3), material: materials.turquoise },
    { type: "sphere", pos: new THREE.Vector3(-1, 4.5, -14),    scale: new THREE.Vector3(4.5,4.5,4.5), material: materials.mirror},
]


var current = 0;
var controls = ["camera", "light 1", "light 2"]
var currentLight
function toggleControl() {
    current = (current + 1) % controls.length
    if (current == 1)
        currentLight = lights[1]
    if (current == 2)
        currentLight = lights[2]
    return controls[current]
}

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
            MAIN_rayTraceAt.applyAxisAngle(MAIN_up, rotSpeed);
            MAIN_at.applyAxisAngle(MAIN_up, rotSpeed); break;
        case 37://left arrow
            MAIN_rayTraceAt.applyAxisAngle(MAIN_up, -rotSpeed);
            MAIN_at.applyAxisAngle(MAIN_up, -rotSpeed); break;
        case 38://up arrow
            //raytrace
            var perpendicular = new THREE.Vector3().crossVectors(MAIN_rayTraceAt, MAIN_rayTraceUp).normalize()
            MAIN_rayTraceAt.applyAxisAngle(perpendicular, rotSpeed);
            MAIN_rayTraceUp.applyAxisAngle(perpendicular, rotSpeed); 
            //webgl
            var perpendicular = new THREE.Vector3().crossVectors(MAIN_at, MAIN_up).normalize()
            MAIN_at.applyAxisAngle(perpendicular, rotSpeed);
            MAIN_up.applyAxisAngle(perpendicular, rotSpeed); break;
        case 40://down arrow
            //raytrace
            var perpendicular = new THREE.Vector3().crossVectors(MAIN_rayTraceAt, MAIN_rayTraceUp).normalize()
            MAIN_rayTraceAt.applyAxisAngle(perpendicular, -rotSpeed);
            MAIN_rayTraceUp.applyAxisAngle(perpendicular, -rotSpeed); 
            //webgl
            var perpendicular = new THREE.Vector3().crossVectors(MAIN_at, MAIN_up).normalize()
            MAIN_at.applyAxisAngle(perpendicular, -rotSpeed);
            MAIN_up.applyAxisAngle(perpendicular, -rotSpeed); break;
        case 65://a
            if(controls[current] == "camera")
                MAIN_transMatrix.multiply(transX);
            else
                currentLight.pos.x += .2
            break;
        case 90://z
            if (controls[current] == "camera")
                MAIN_transMatrix.multiply(new THREE.Matrix4().getInverse(transX));
            else
                currentLight.pos.x -= .2  
            break;
        case 83://s 
            if (controls[current] == "camera")
                MAIN_transMatrix.multiply(transY);
            else
                currentLight.pos.y += .2          
            break;
        case 88://x 
            if (controls[current] == "camera")
                MAIN_transMatrix.multiply(new THREE.Matrix4().getInverse(transY));
            else
                currentLight.pos.y -= .2          
            break;
        case 68://d  
            if (controls[current] == "camera")
                MAIN_transMatrix.multiply(transZ); 
            else
                currentLight.pos.z += .2         
            break;
        case 67://c  
            if (controls[current] == "camera")
                MAIN_transMatrix.multiply(new THREE.Matrix4().getInverse(transZ));
            else
                currentLight.pos.z -= .2
            break;      
        case 70://f
            MAIN_rayTraceUp.applyAxisAngle(MAIN_rayTraceAt, rotSpeed); 
            MAIN_up.applyAxisAngle(MAIN_at, rotSpeed); break;
        case 86://v
            MAIN_rayTraceUp.applyAxisAngle(MAIN_rayTraceAt, -rotSpeed); 
            MAIN_up.applyAxisAngle(MAIN_at, -rotSpeed); break;
    }

    //for some reason I cant get the ray trace matrix to match - found out the reason. My tracing was left to right not right to left.
    MAIN_rayTraceRot = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), MAIN_rayTraceAt, MAIN_rayTraceUp)

    //set view matrix
    MAIN_rotMatrix = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), MAIN_at, MAIN_up)
    MAIN_rotTransMatrix = MAIN_rotMatrix.clone().multiply(MAIN_transMatrix)
    MAIN_viewMatrix = MAIN_perspective.clone().multiply(MAIN_rotTransMatrix)

})


// the next scene
var prevLights = [
    {
        pos: new THREE.Vector3(2, 2, 0),
        color: new THREE.Vector3(1, 1, 1),
        strength: .8,
        on: true,
    }
]

var prevObjs = [
    { type: "sphere", pos: new THREE.Vector3(-1.5, 1, -8), scale: new THREE.Vector3(1, 1, 1), material: materials.redplastic },
    { type: "sphere", pos: new THREE.Vector3(2, 1, -8), scale: new THREE.Vector3(1.5, 1.5, 1.5), material: materials.mirror },
    { type: "sphere", pos: new THREE.Vector3(0, 3, -5), scale: new THREE.Vector3(0.1, 0.8, 0.8), material: materials.turquoise },
    { type: "sphere", pos: new THREE.Vector3(3, 2, -2), scale: new THREE.Vector3(2.5, 2.5, 2.5), material: materials.mirror },
    { type: "plane", pos: new THREE.Vector3(0, 0, 0), scale: new THREE.Vector3(0, 1, 0), material: materials.wood }
]

function switchScene() {
    prevLights = lights
    prevObjs = object_list

    lights = prevLights
    object_list = prevObjs
}

function draw() {

    renderWebgl();

    window.requestAnimationFrame(draw);

}

function loadTextures() {

    var images = <any> document.getElementsByClassName("texture")
    for (var i in images) {

        try {

        var img = images[i]
        var canvas = <any> document.createElement("CANVAS");
        canvas.height = img.height
        canvas.width = img.width
        var context = canvas.getContext('2d');

        context.drawImage(img, 0, 0);
 
        MAIN_textures[img.id] = context.getImageData(0, 0, img.width, img.height)
        } finally {
            continue    
        }

    }
}


function main() {

    loadTextures()

    initWebgl();
    initRaytrace();

    window.requestAnimationFrame(draw);

} 