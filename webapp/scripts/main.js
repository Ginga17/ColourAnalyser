
function addImage(file) {
    var img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function() {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        var width = canvas.width = img.naturalWidth;
        var height = canvas.height = img.naturalHeight;
        
        ctx.drawImage(img,0,0);
    
        var imageData = ctx.getImageData(0, 0, width, height);
        var data = imageData.data;
        var colors = [];
        for (var i = 0, l = data.length; i < l; i+=4) {    
            colors.push({r: data[i], g: data[i+1], b: data[i+2]});
        }

        var rgbs = kMeansCluster(kMeansCluster(kMeansCluster(kMeansCluster(initialiseClusters(colors), colors),colors),colors),colors);
        var weight = 0;
        console.log("MARK");
        for(var i in rgbs) {
            orec = rgbs[i];
            console.log(orec.weight);
            weight += orec.weight;
        }
        var y = 0;     
        console.log("we got colors");
        for(var i in rgbs) {
            orec = rgbs[i];
            console.log("ohooohohoh " + getRGBStr(orec.rgb) + " " + orec.weight);
            ctx.fillStyle = getRGBStr(orec.rgb);
            ctx.fillRect(0,y, 80,40)
            y += 100;//Math.ceil(500 * orec.weight/weight);

        }
        document.getElementById('images').appendChild(canvas);

    };
}

function getRGBStr(rgb) {
    return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';

}

function handleImages(files) {
    document.getElementById('images').innerHTML = '';

    for (var i = 0; i < files.length; i++) {
        addImage(files[i]);
    }
}

  

function drawColours() {
    // var c = document.getElementById("dom_colours");
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(20, 20, 150, 100);
}

class Centroid {
    constructor(colours) {
        this.newColours = [];
        this.oldColours = colours;
        this.rgb = averageColour(colours);
    }
    recalculateColour() {
        this.rgb = averageColour(this.newColours);
        if (arraysEqual(this.newColours,this.oldColours)) {
            // console.log("pussy");
            return false;
        }
        this.oldColours = this.newColours;
        this.rgb = averageColour(this.newColours);
        this.newColours = [];

        return true;
    }
    get weight() {
        return this.oldColours.length; 
    }
    split() {
        console.log("doggy " +  this.oldColours.length/2);
        var newCent = new Centroid(this.oldColours.splice(0, this.oldColours.length/2));
        // refresh colour
        this.rgb = averageColour(this.oldColours);
        newCent.newColours = newCent.oldColours;
        return newCent;
    }
    dist(colour) {
        return Math.pow(this.rgb.r - colour.r,2) +Math.pow(this.rgb.g - colour.g,2)+Math.pow(this.rgb.b - colour.b,2);
    }
    sumDist() {
        var sum = 0;
        for(c in this.oldColours) {
            sum += this.dist(this.oldColours[c]);
        }
        return sum;
    }
}

function arraysEqual(arr1, arr2) {

	// Check if the arrays are the same length
	if (arr1.length !== arr2.length) return false;

	// Check if all items exist and are in the same order
	for (var i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}

	// Otherwise, return true
	return true;

};

function findDoms(img) {
    
    // var c = document.getElementById("dom_colours")
    console.log("cheeekky");
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    var width = canvas.width = img.naturalWidth;
    var height = canvas.height = img.naturalHeight;
    
    console.log("dddd" + img.naturalHeight);
    console.log(img.naturalWidth);
    
    ctx.drawImage(img,0,0);

    var imageData = ctx.getImageData(0, 0, width, height);
    var data = imageData.data;
    console.log("cccccc");
    const colors = [];
    const centroid1 = [];
    const centroid2 = [];

    var p = 0;
    for (var i = 0, l = data.length; i < l; i+=4) {
        
        colors.push({r: data[i], g: data[i+1], b: data[i+2]});
        if (i < data.length/2) {
            centroid1.push({r: data[i], g: data[i+1], b: data[i+2]});
        }
        else {
            centroid2[p].push({r: data[i], g: data[i+1], b: data[i+2]});
        }
    }

    const ret = [];
    var rgb = averageColour(centroid1);
    ret[0] = {r:rgb.r,g:rgb.g,b:rgb.b,weight:rgb.weight};
    var rgb = averageColour(centroid1);
    ret[1] = {r:rgb.r,g:rgb.g,b:rgb.b,weight:rgb.weight};
    return ret;

    // var rgbStr = 'rgb(' + rgb.r +',' +rgb.g + ',' + rgb.b + ')';
    // ctx.fillStyle = rgbStr;
    // ctx.fillRect(10, 10, 100, 100);
    // var rgb = averageColour(centroid2);
    // var rgbStr = 'rgb(' + rgb.r +',' +rgb.g + ',' + rgb.b + ')';
    // ctx.fillStyle = rgbStr;
    // ctx.fillRect(120, 20, 100, 100);
}

// Sums together the r g and b values of the colour
function sumColour(rgb) {
    return rgb.r + rgb.g + rgb.b;
}

function distBetweenColours(rgb1, rgb2) {
    return Math.pow(rgb1.r-rgb2.r,2) + Math.pow(rgb1.g-rgb2.g,2) + Math.pow(rgb1.b-rgb2.b,2);
}

// IDEA FOR FAST INITIALISATION
// If we calc average, max (r + g + b), min (r+b+g), we initialise
// two points between
function initialiseClusters(colors) {
    
    var startTime = performance.now();
    const centroid1 = [];
    const centroid2 = [];
    var min = sumColour(colors[0]);
    var max = sumColour(colors[0]);
    var minColour = colors[0];
    var maxColour = colors[0];
    
    for (var i =0; i< colors.length; i++) {
        var size = sumColour(colors[i]);
        if (size > max) {
            max = size;
            minColour = colors[i];
        }
        else if (size < min) {
            min = size;
            maxColour = colors[i];
        }
    }
    minColour = {r:Math.floor((averageColour(colors).r + minColour.r)/2), g:Math.floor((averageColour(colors).g + minColour.g)/2), b:Math.floor((averageColour(colors).b + minColour.b)/2) }
    maxColour = {r:Math.floor((averageColour(colors).r + maxColour.r)/2), g:Math.floor((averageColour(colors).g + maxColour.g)/2), b:Math.floor((averageColour(colors).b + maxColour.b)/2) }
    
    console.log(maxColour);
    console.log(minColour);
    console.log("SSSS");
    
    for (var i = 0, l = colors.length; i < l; i++) {
        if (distBetweenColours(minColour, colors[i]) < distBetweenColours(maxColour, colors[i])) {
            centroid1.push(colors[i]);
            // console.log("BBBB");
        }
        else {
            centroid2.push(colors[i]);
            // console.log("AAAA");
        }
    }
    
    const centroids = [new Centroid(centroid1), new Centroid(centroid2)];
    var noChange = false;
    while(noChange == false) {
        // for (p in centroids) {
        //     c = centroids[p];
        //     c.colours = [];
        // }
        for (p in colors) {
            colour = colors[p];

            var closest = centroids[0];
            var dist = centroids[0].dist(colour);
            for (o in centroids) {
                centroid = centroids[o];
                if (centroid.dist(colour) < dist) {
                    closest = centroid;
                }
            }
            closest.newColours.push(colour);
            // console.log(closest.rgb);
        }
        noChange = true;
        for (p in centroids) {
            c = centroids[p];
            console.log("pop");

            console.log(c.rgb);

            console.log(c.newColours.length);
            if(c.recalculateColour()) {
                noChange = false;
            }
            console.log(c.rgb);
            console.log(c.weight);
        }
    }
    console.log(`Call to doSomething took ${performance.now() - startTime} milliseconds`)

    return centroids;
    

}

function kMeansCluster(centroids, colors) {
    // console.log(centroids.length);
    console.log("GIRAFFE");
    var widestCentroid = 0;
    var dist = centroids[0].sumDist;
    // console.log("oooo");
    // console.log(centroids);
    console.log(centroids.length);
    // for (c in centroids) {
    //     op = centroids[c];
    //     console.log(getRGBStr(op.rgb));
    //     console.log(op.weight);
    // }
    for (c in centroids) {
        if (centroids[c].sumDist() > dist) {
            dist = centroids[c].sumDist();
            widestCentroid = c;
        }
    }
    
    
    centroids.push(centroids[widestCentroid].split());
    // console.log(centroids.length);
    for (c in centroids) {
        op = centroids[c];
        console.log(getRGBStr(op.rgb));
        console.log(op.weight);
    }
    // console.log(centroids);
    console.log("SNAKE");

    var noChange = false;
    while(noChange == false) {
        // for (p in centroids) {
        //     c = centroids[p];
        //     c.colours = [];
        // }
        for (p in colors) {
            colour = colors[p];

            var closest = centroids[0];
            var dist = centroids[0].dist(colour);
            for (o in centroids) {
                centroid = centroids[o];
                if (centroid.dist(colour) < dist) {
                    closest = centroid;
                }
            }
            closest.newColours.push(colour);
        }
        noChange = true;
        for (p in centroids) {
            c = centroids[p];

            if(c.recalculateColour()) {
                noChange = false;
            }
        }
    }
    console.log("hhheeeellp");
    // console.log(centroids);
    return centroids;
}

function findDomsFromColor(clusters) {
    
    // var c = document.getElementById("dom_colours")
    var clusters = [];
    for (var i = 0; i <= colours.length; i++) {
        clusters[i] = {}
    }
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    var width = canvas.width = img.naturalWidth;
    var height = canvas.height = img.naturalHeight;
    
    console.log("dddd" + img.naturalHeight);
    console.log(img.naturalWidth);
    
    ctx.drawImage(img,0,0);

    var imageData = ctx.getImageData(0, 0, width, height);
    var data = imageData.data;
    console.log("cccccc");
    const colors = [];
    const centroid1 = [];
    const centroid2 = [];

    var p = 0;
    for (var i = 0, l = data.length; i < l; i+=4) {
        
        colors[p] = {r: data[i], g: data[i+1], b: data[i+2]};
        if (i < data.length/2) {
            centroid1[p] = {r: data[i], g: data[i+1], b: data[i+2]};
        }
        else {
            centroid2[p] = {r: data[i], g: data[i+1], b: data[i+2]};
        }
        p++;
    }

    const ret = [];
    var rgb = averageColour(centroid1);
    ret[0] = {r:rgb.r,g:rgb.g,b:rgb.b,weight:rgb.weight};
    var rgb = averageColour(centroid1);
    ret[1] = {r:rgb.r,g:rgb.g,b:rgb.b,weight:rgb.weight};
    return ret;

    // var rgbStr = 'rgb(' + rgb.r +',' +rgb.g + ',' + rgb.b + ')';
    // ctx.fillStyle = rgbStr;
    // ctx.fillRect(10, 10, 100, 100);
    // var rgb = averageColour(centroid2);
    // var rgbStr = 'rgb(' + rgb.r +',' +rgb.g + ',' + rgb.b + ')';
    // ctx.fillStyle = rgbStr;
    // ctx.fillRect(120, 20, 100, 100);
}

function averageColour(colours) {
    var r = 0;
    var g = 0;
    var b = 0;
    for (var i = 0, l = colours.length; i < l; i++) {
        r += colours[i].r;
        g += colours[i].g;
        b += colours[i].b;
    }
    r = Math.floor(r/colours.length);
    g = Math.floor(g/colours.length);
    b = Math.floor(b/colours.length);

    return {r:r, g:g, b:b, weight:colours.length}
}

(function() {
    var upload = document.getElementById('upload');
    var target = document.getElementById('target');
  
    upload.onchange = function() {
      handleImages(this.files);
    };
  
    target.onclick = function() {
      upload.click();
    };
  })();