//# sourceMappingURL=app.js.map
/// <reference path="main.ts"/>




var canvs =  <HTMLCanvasElement><any> document.getElementById("raytrace")



function initRaytrace() {


}


var antialiasing = {

    jittered: true,
    n: 1,

}

function raytrace() {

    

    var width: number = parseInt( canvas.getAttribute("width") ) 
    var height = parseInt( canvas.getAttribute("height") ) 

    //dir to upper left
    var RotYbig = new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(MAIN_fov) / 2)
    var RotXbig = new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(MAIN_fov) / 2)
    var upper_left = MAIN_at.clone().applyMatrix4(RotYbig).applyMatrix4(RotXbig)

    //shoot rays
    for (var x = 0; x < width; x++) {
        
            window.setTimeout(raytraceBlocking, 0,  x, height, upper_left);
            
    }
}

function raytraceBlocking(x, height,  upper_left) {

    for (var y = 0; y < height; y++) {

        var avg_pix = new THREE.Vector3(0, 0, 0)

        //antialiasing
        for (var subx = x; subx < x + 1; subx += 1 / antialiasing.n) {
            for (var suby = y; suby < y + 1; suby += 1 / antialiasing.n) {

                var x2 = subx //clone
                var y2 = suby //clone

                //org
                var org = new THREE.Vector3(0, 0, 0)

                //jitter
                if (antialiasing.jittered) {
                    var step = 1 / antialiasing.n
                    x2 = THREE.Math.randFloat(x2, x2 + step)
                    y2 = THREE.Math.randFloat(y2, y2 + step)
                }

                var RotY = new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(x2))
                var RotX = new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(y2))
                var dir = upper_left.clone().applyMatrix4(RotY).applyMatrix4(RotX)

                //apply view matrix
                org.applyMatrix4(MAIN_viewMatrix)
                dir.applyMatrix4(MAIN_viewMatrix)

                var color = trace(org, dir)
                avg_pix.add(color.divideScalar(antialiasing.n * antialiasing.n))

            }
        }

        //set pixel color
        var ctx = <any> canvs.getContext("2d");
        var p = avg_pix
        ctx.fillStyle = "rgba(" + p.x + "," + p.y + "," + p.z + "," + 1 + ")";
        ctx.fillRect(x, y, 1, 1);
    }

}

//traces a single ray
function trace(org, dir) {

    for( i in object_list) {


    }



    return new THREE.Vector3(Math.random(), Math.random(), Math.random())

}