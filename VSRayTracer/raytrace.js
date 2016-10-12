var rayTrace_fov = main.MAIN_fov * 1.2;
var canvs = document.getElementById("raytrace");
var num_webworkers = 8;
var webworkers = [];
var ctx = canvs.getContext("2d");
function raytrace() {
    for (var i = 0; i < num_webworkers; i++) {
        webworkers[i] = new Worker('webworker_raytrace.js');
        webworkers[i].addEventListener('message', function (e) {
            for (var i = 0; i < e.data.colors.length; i = i + 3) {
                ctx.fillStyle = "rgba(" + e.data.colors[i + 0] + "," + e.data.colors[i + 1] + "," + e.data.colors[i + 2] + "," + 255 + ")";
                ctx.fillRect(e.data.x, i / 3, 1, 1);
            }
        }, false);
    }
    update_webworker_MAIN();
    var width = parseInt(canvas.getAttribute("width"));
    var height = parseInt(canvas.getAttribute("height"));
    var RotXbig = new THREE.Matrix4().makeRotationY(-THREE.Math.degToRad(rayTrace_fov / 2));
    var RotYbig = new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(rayTrace_fov / 2));
    var RotXYbig = new THREE.Matrix4().multiplyMatrices(RotXbig, RotYbig);
    var upper_left = new THREE.Vector3(0, 0, -1).applyMatrix4(RotXYbig);
    for (var i = 0; i < num_webworkers; i++) {
        for (var x = (i % num_webworkers); x < width; x = x + num_webworkers) {
            webworkers[i].postMessage({ 'cmd': 'raytrace', 'x': x, 'width': width, 'height': height, 'upper_left': upper_left });
        }
    }
}
function update_webworker_MAIN() {
    for (var i = 0; i < num_webworkers; i++) {
        if (webworkers[i]) {
            webworkers[i].postMessage({ 'cmd': 'update_main', 'main': main, 'lights': lights, 'materials': materials, 'object_list': object_list });
        }
    }
}
