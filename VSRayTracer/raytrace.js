//# sourceMappingURL=app.js.map
/// <reference path="main.ts"/>
var canvs = document.getElementById("raytrace");
function initRaytrace() {
}
var antialiasing = {
    jittered: false,
    n: 1,
};
function raytrace() {
    var width = parseInt(canvas.getAttribute("width"));
    var height = parseInt(canvas.getAttribute("height"));
    //dir to upper left
    var RotXbig = new THREE.Matrix4().makeRotationY(-THREE.Math.degToRad(MAIN_fov / 2));
    var RotYbig = new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(MAIN_fov / 2));
    var RotXYbig = new THREE.Matrix4().multiplyMatrices(RotXbig, RotYbig);
    var upper_left = new THREE.Vector3(0, 0, -1).applyMatrix4(RotXYbig);
    //shoot rays
    for (var x = 0; x < width; x++) {
        window.setTimeout(raytraceBlocking, 0, x, width, height, upper_left);
    }
}
function raytraceBlocking(x, width, height, upper_left) {
    for (var y = 0; y < height; y++) {
        var avg_pix = new THREE.Vector3(0, 0, 0);
        //antialiasing
        for (var subx = x; subx < x + 1; subx += 1 / antialiasing.n) {
            for (var suby = y; suby < y + 1; suby += 1 / antialiasing.n) {
                var x2 = subx; //clone
                var y2 = suby; //clone
                if (x2 == 400 && y2 == 400)
                    debugger;
                //org
                var org = new THREE.Vector3(0, 0, 0);
                //jitter
                if (antialiasing.jittered) {
                    var step = 1 / antialiasing.n;
                    x2 = THREE.Math.randFloat(x2, x2 + step);
                    y2 = THREE.Math.randFloat(y2, y2 + step);
                }
                var degX = x2 / width * MAIN_fov;
                var degY = y2 / width * MAIN_fov;
                var RotX = new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(degX));
                var RotY = new THREE.Matrix4().makeRotationX(-THREE.Math.degToRad(degY));
                var RotXY = new THREE.Matrix4().multiplyMatrices(RotY, RotX); //opposite order
                var dest = upper_left.clone().applyMatrix4(RotXY);
                //apply view matrix
                var tt = new THREE.Matrix4().multiplyMatrices(MAIN_transMatrix, MAIN_rotMatrix);
                org.applyMatrix4(tt);
                dest.applyMatrix4(tt);
                var color = trace(org, dest);
                color.divideScalar(antialiasing.n * antialiasing.n);
                avg_pix.add(color);
            }
        }
        //set pixel color
        var ctx = canvs.getContext("2d");
        var p = avg_pix.multiplyScalar(255).floor();
        ctx.fillStyle = "rgba(" + p.x + "," + p.y + "," + p.z + "," + 255 + ")";
        ctx.fillRect(x, y, 1, 1);
    }
}
//traces a single ray
function trace(org, dest) {
    for (var i in object_list) {
        var obj = object_list[i];
        var intersection = getIntersection(obj, org, dest);
        if (intersection)
            return new THREE.Vector3(.5, .5, .5);
        else
            return new THREE.Vector3(0, 1, 0);
        var normal = getNormal(obj, dest, intersection);
    }
}
function getIntersection(obj, org, dest) {
    org.add(obj.pos);
    dest.add(obj.pos);
    var dir = new THREE.Vector3().subVectors(dest, org).normalize();
    switch (obj.type) {
        case "sphere":
            var cen = obj.pos;
            var a = dir.length() * dir.length();
            var b = org.dot(dir);
            var c = (org.length() * org.length()) - obj.size;
            var disc = (b * b) - (a * c);
            if (disc > 0) {
                return true;
                var t0 = (-b + Math.sqrt(b * b - 4 * c)) / 2;
                var t1 = (-b - Math.sqrt(b * b - 4 * c)) / 2;
                var p0 = org.add(dir.clone().multiplyScalar(t0));
                var p1 = org.add(dir.clone().multiplyScalar(t0));
                var len0 = new THREE.Vector3().subVectors(p0, org).length();
                var len1 = new THREE.Vector3().subVectors(p1, org).length();
                if (len0 < len1)
                    return p0;
                else
                    return p1;
            }
            else {
                return null;
            }
            // var r = new THREE.Ray(org, dir)
            // var dist = r.distanceToPoint(obj.pos)
            //
            // if (dist < obj.size)
            //     return true;
            // else
            //     return false;
            break;
        case "plane":
            break;
    }
}
function getNormal(obj, dest, intersection) {
    switch (obj.type) {
        case "sphere":
            break;
        case "plane":
            break;
    }
}
//# sourceMappingURL=raytrace.js.map