//# sourceMappingURL=app.js.map
/// <reference path="main.ts"/>




var canvs =  <HTMLCanvasElement><any> document.getElementById("raytrace")



function initRaytrace() {


}


var antialiasing = {

    jittered: false,
    n: 1,

}

function raytrace() {

    

    var width: number = parseInt( canvas.getAttribute("width") ) 
    var height = parseInt( canvas.getAttribute("height") ) 

    //dir to upper left
    var RotXbig = new THREE.Matrix4().makeRotationY( -THREE.Math.degToRad(MAIN_fov/2) )
    var RotYbig = new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(MAIN_fov / 2))
    var RotXYbig = new THREE.Matrix4().multiplyMatrices(RotXbig, RotYbig)
    var upper_left = new THREE.Vector3(0,0,-1).applyMatrix4(RotXYbig)

    //shoot rays
    for (var x = 0; x < width; x++) {
        
            window.setTimeout(raytraceBlocking, 0,  x, width, height, upper_left);
            
    }
}

function raytraceBlocking(x, width, height,  upper_left) {

    for (var y = 0; y < height; y++) {

        var avg_pix = new THREE.Vector3(0, 0, 0)

        //antialiasing
        for (var subx = x; subx < x + 1; subx += 1 / antialiasing.n) {
            for (var suby = y; suby < y + 1; suby += 1 / antialiasing.n) {

                var x2 = subx //clone
                var y2 = suby //clone

                if (x2 == 400 && y2 == 400)
                    debugger

                //org
                var org = new THREE.Vector3(0, 0, 0)

                //jitter
                if (antialiasing.jittered) {
                    var step = 1 / antialiasing.n
                    x2 = THREE.Math.randFloat(x2, x2 + step)
                    y2 = THREE.Math.randFloat(y2, y2 + step)
                }

                var degX = x2 / width * MAIN_fov
                var degY = y2 / width * MAIN_fov
                var RotX = new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(degX))
                var RotY = new THREE.Matrix4().makeRotationX(-THREE.Math.degToRad(degY))
                var RotXY = new THREE.Matrix4().multiplyMatrices(RotY, RotX)//opposite order
                var dest = upper_left.clone().applyMatrix4(RotXY)

                //apply view matrix
                var tt = new THREE.Matrix4().multiplyMatrices(MAIN_transMatrix, MAIN_rotMatrix)
                org.applyMatrix4(tt)
                dest.applyMatrix4(tt)

                var color = trace(org, dest)
                color.divideScalar(antialiasing.n * antialiasing.n)
                avg_pix.add(color)

            }
        }

        //set pixel color
        var ctx = <any> canvs.getContext("2d");
        var p = avg_pix.multiplyScalar(255).floor()
        ctx.fillStyle = "rgba(" + p.x + "," + p.y + "," + p.z + "," + 255 + ")";
        ctx.fillRect(x, y, 1, 1);
    }

}

//traces a single ray
function trace(org, dest) {

    var dir = new THREE.Vector3().subVectors(dest, org)

    var nearestObj = null
    var dist = 99999999
    for (var i in object_list) {
        var obj = object_list[i]

        var intersection = getIntersection(obj, org, dest)

        if (intersection) {
            var d = new THREE.Vector3().subVectors(intersection, dir).length()
            if (d < dist) {
                dist = d
                nearestObj = obj
            }
        }
    }

    if (nearestObj) {

        //phong shading
        obj = nearestObj
        var amb = obj.material.amb;

        var normal = getNormal(obj, dest, intersection)

        var difStrength
        var specStrength
        for (var j in lights) {
            var light = lights[j]

            //diffuse
            var dirToLight = new THREE.Vector3().subVectors(light.pos, intersection).normalize()
            difStrength = normal.clone().dot(dirToLight) * light.strength

            //specular
            //var reflection = dirToLight.clone().reflect(normal).normalize()
            //var theta = Math.abs(reflection.dot(dir))
            //var shny = obj.material.shiny
            //theta = Math.pow(theta, shny)
            //specStrength = theta * light.strength

            //should scale by ligth distance here
            var distToLight = new THREE.Vector3().subVectors(intersection, light.pos).length();
            console.log(distToLight)

        }

        var phongColor = new THREE.Vector3(0, 0, 0)
        phongColor.add(amb)
        phongColor.add( obj.material.diff.multiplyScalar(difStrength) )
       // phongColor.add( obj.material.spec.multiplyScalar(specStrength) )

        return phongColor
    } else {

        return new THREE.Vector3(0, 0, 0)
    }
}

function getIntersection(obj, org: THREE.Vector3, dest: THREE.Vector3) : any {

    var org = org.clone().add(obj.pos)
    var dest = dest.clone().add(obj.pos)
    var dir = new THREE.Vector3().subVectors(dest, org).normalize()

    switch (obj.type) {
        case "sphere":

            var cen = obj.pos
            var a = dir.length() * dir.length()
            var b = org.dot(dir)
            var c = (org.length() * org.length()) - obj.size
            
            
            var disc = (b * b) - ( a * c)
            if (disc > 0) {


            
                var t0 = (-b + Math.sqrt(b * b - 4 * c)) / 2
                var t1 = (-b - Math.sqrt(b * b - 4 * c)) / 2
            
                var p0 = org.add(dir.clone().multiplyScalar(t0))
                var p1 = org.add(dir.clone().multiplyScalar(t0))
            
                var len0 = new THREE.Vector3().subVectors(p0, org).length()
                var len1 = new THREE.Vector3().subVectors(p1, org).length()
            
                if (len0 < len1)
                    return p0
                else
                    return p1
            } else {
                return null
            }
            break;
        case "plane":
            if (dir.y < 0) {
                var t = (org.y*-1) / dir.y
                return org.add( dir.multiplyScalar(t) )
            }
            
            

    }

}




function getNormal(obj, dest, intersection) : THREE.Vector3{

    switch (obj.type) {
        case "sphere":
            return new THREE.Vector3().subVectors(intersection , obj.pos).normalize()
            break;
        case "plane":
            return new THREE.Vector3(0,1,0)
            break;
    }

    return new THREE.Vector3()
}