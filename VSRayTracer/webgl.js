

var canvas = document.getElementById("webgl")

var SCREEN_WIDTH = canvas.getAttribute("width")
var SCREEN_HEIGHT = canvas.getAttribute("height")

var camera, scene, renderer, mesh;
var cameraPerspective;
var renderer;


function initWebgl() {

    // renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    // scene
    scene = new THREE.Scene()


    // camera
    camera = new THREE.Camera();
    scene.add(camera)

    camera.projectionMatrix = MAIN_viewMatrix


    var sphere = new THREE.Mesh(new THREE.SphereGeometry(2, 100, 100), new THREE.MeshNormalMaterial());
    sphere.position.set(0, 1, -8)
    sphere.overdraw = true;
    scene.add(sphere);


    var sphere = new THREE.Mesh(new THREE.SphereGeometry(2, 100, 100), new THREE.MeshNormalMaterial());
    sphere.position.set(3, 0, -2)
    sphere.overdraw = true;
    scene.add(sphere);

    var plane = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }));
    plane.lookAt(new THREE.Vector3(0, 100, 0))
    scene.add(plane);


}

function renderWebgl() {

    camera.projectionMatrix = MAIN_viewMatrix

    renderer.render(scene, camera);

}

