



var canvas = document.getElementById("webgl")

var SCREEN_WIDTH = canvas.getAttribute("width")
var SCREEN_HEIGHT = canvas.getAttribute("height")

var camera, scene, renderer, mesh;
var cameraPerspective;
var renderer;


function initWebgl() {

    // renderer
    renderer = new THREE.WebGLRenderer({ canvas: <any> canvas });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    // scene
    scene = new THREE.Scene()


    // camera
    camera = new THREE.Camera();
    scene.add(camera)

    camera.projectionMatrix = MAIN_viewMatrix


    for (var i in object_list) {
        var obj = <any> object_list[i]
        switch (obj.type) {
            case "sphere":
                var sp = new THREE.Mesh(new THREE.SphereGeometry(obj.size, 100, 100), new THREE.MeshNormalMaterial());
                sp.position.set(obj.pos.x, obj.pos.y, obj.pos.z) 
                scene.add(sp);
                break;
            case "plane":
                var plane = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshBasicMaterial({ color: 0xA0888888, side: THREE.DoubleSide }));
                plane.position.set(obj.pos.x, obj.pos.y, obj.pos.z) 
                plane.lookAt(obj.at)
                scene.add(plane);
                break;
        
        }
    }

}

function renderWebgl() {


    camera.projectionMatrix = MAIN_viewMatrix

    renderer.render(scene, camera);

}

