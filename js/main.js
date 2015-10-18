var filename = getParameterByName("filename");
var width = getParameterByName("width");
var height = getParameterByName("height");
$("#image").attr('width', width + "px");
$("#image").attr('height', height + "px");
$("#canvas").attr('width', width + "px");
$("#canvas").attr('height', height + "px");
var canvasImage = document.getElementById('image'),
    ctxImage = canvasImage.getContext('2d');

var canvas = document.getElementById("canvas")

var maxPolygons = 200;

make_base();

function make_base() {
    base_image = new Image();
    base_image.src = filename;
    base_image.onload = function () {

        ctxImage.drawImage(base_image, 0, 0);
    }
}


var ctx = canvas.getContext('2d');
var polyArray = [];
var totalDraws = 0;
var currentDistance;
var imgdImage;
var pixImage;
var coloursArray = [];
var successes = 0;
var boundingBox = 500;
var previousSuccessRatio = 1;
var recordEvery = getParameterByName("recordEvery");
if (! recordEvery) {
	recordEvery = 10;
}
var reduceEvery = getParameterByName("reduceEvery");
if (! reduceEvery) {
	reduceEvery = 1000;
}
var minBoxSize = getParameterByName("minBoxSize");
if (! minBoxSize) {
	minBoxSize = 100;
}


for (var i = 0; i < randomIntFromInterval(10, 20); i++) {
    addPoly();
}

function distanceFromImage() {
    // Get the CanvasPixelArray from the given coordinates and dimensions.

    // get from source


    // get from canvas
    var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pix = imgd.data;

    var distanceTotal = 0;

    // Loop over each pixel and invert the color.
    for (var i = 0, n = pix.length; i < n; i += 4) {
        //pix[i  ] =  // red
        //pix[i+1] =  // green
        //pix[i+2] =  // blue
        // i+3 is alpha (the fourth element)

        distanceTotal += Math.abs(pixImage[i] - pix[i]);
        distanceTotal += Math.abs(pixImage[i + 1] - pix[i + 1]);
        distanceTotal += Math.abs(pixImage[i + 2] - pix[i + 2]);
    }

    return distanceTotal;

    // Draw the ImageData at the given (x,y) coordinates.
    //ctx.putImageData(imgd, 0, 0);
}

setTimeout(init, 5000);
function init() {
    drawLoop();
    setInterval(modify, 10);
    setInterval(pruneHidden, 1000 * 300); // 300 seconds
    //setInterval(status, 1000 * 60); // 60 seconds
    imgdImage = ctxImage.getImageData(0, 0, canvas.width, canvas.height);
    pixImage = imgdImage.data;

    if (getParameterByName("pallet")) {
        $.ajax({
            url: '/get/pallet?pallet=' + getParameterByName("pallet"),
            type: 'GET',
            success: function (data) {
                coloursArray = data;
                return;
            },
            error: function (data) {
                console.log("pallet load failed for " + getParameterByName("pallet"));
            }
        });
    }

    for (var i = 0, n = pixImage.length; i < n; i += 4) {
        var red = pixImage[i].toString(16);
        if (red.length < 2) {
            red = '0' + red;
        }
        var green = pixImage[i + 1].toString(16);
        if (green.length < 2) {
            green = '0' + green;
        }
        var blue = pixImage[i + 2].toString(16);
        if (blue.length < 2) {
            blue = '0' + blue;
        }
        var colorItem = '#' + red + green + blue;
        if (coloursArray.indexOf(colorItem) == -1) {
            coloursArray.push(colorItem);
            if (coloursArray.length % reduceEvery === 0) {
                console.log("coloursArray.length: " + coloursArray.length);
//                    $.ajax({
//                        type: "GET",
//                        dataType: 'jsonp',
//                        url: 'http://localhost:4040/',
//                        data: {status: coloursArray.length, filename: filename}
//                    })
            }
        }
    }
    var palletString = JSON.stringify(coloursArray);
    var palletUrl = '/insert/pallet';
    debugger;
    $.post(palletUrl, {
        pallet: palletString,
        filename: filename
    });

}

function pruneHidden() {
    var tempObject = JSON.parse(JSON.stringify(polyArray));
    for (i = 0; i < polyArray.length; i++) {
        removePoly(i);
    }

    drawLoop();
    var tempDistance = distanceFromImage();
    if (currentDistance < tempDistance) {
        polyArray = JSON.parse(JSON.stringify(tempObject));
    }
    else {
        currentDistance = tempDistance;
    }
}

function drawLoop() {
    totalDraws++;

    canvas.width = canvas.width;
    for (i = 0; i < polyArray.length; i++) {
        drawPoly(polyArray[i].points, polyArray[i].colour);
    }
    var currentSuccessRatio = successes / totalDraws;
    if (totalDraws % reduceEvery === 0) {
        if (currentSuccessRatio < previousSuccessRatio) {
            if (boundingBox > minBoxSize) {
                boundingBox--;
            }
            console.log(boundingBox);
        } else if (currentSuccessRatio > previousSuccessRatio) {
            if (boundingBox < 500) {
                boundingBox++;
            }
        }
        previousSuccessRatio = currentSuccessRatio;

    }
}

function modify() {
    var tempObject = JSON.parse(JSON.stringify(polyArray));

    var changeMode = randomIntFromInterval(0, 100);
    if (changeMode < 50) {
        modifyPoly();
    }
    else if (changeMode < 85) {
        addPoly();
    }
    else {
        removePoly();
    }
    drawLoop();

    var tempDistance = distanceFromImage();

    if (currentDistance < tempDistance) {
        polyArray = JSON.parse(JSON.stringify(tempObject));
    }
    else {
        currentDistance = tempDistance;
        successes++;
        if (successes % recordEvery === 0) {
            status();
            //console.log(successes);
        }
    }
    //console.log(currentDistance);
}

function addPoly() {
    if (polyArray.length > maxPolygons) return;

    var points = [];
    points.push(randomIntFromInterval(0, canvas.width));
    points.push(randomIntFromInterval(0, canvas.height));
    var pointCount = randomIntFromInterval(3, 4);

    var minX = points[0] - boundingBox;
    if (minX < 0) minX = 0;
    var maxX = points[0] + boundingBox;
    if (maxX > canvas.width) maxX = canvas.width;

    var minY = points[1] - boundingBox;
    if (minY < 0) minY = 0;
    var maxY = points[1] + boundingBox;
    if (maxY > canvas.height) maxX = canvas.height;

    for (var j = 0; j < pointCount; j++) {
        points.push(randomIntFromInterval(minX, maxX));
        points.push(randomIntFromInterval(minY, maxY));
    }

    var polyColour = '';
    polyColour = getAverageColour(points);

    polyArray.push({
        points: points,
        colour: polyColour
    });
}

function removePoly(removeIndex) {
    if (polyArray.length < 10) return;
    if (!removeIndex) {
        removeIndex = randomIntFromInterval(0, polyArray.length - 1)
    }
    polyArray.splice(removeIndex, 1);
}

function modifyPoly() {
    var polyIndex = randomIntFromInterval(0, polyArray.length - 1);

    var changeMode = randomIntFromInterval(0, 100);
    if (changeMode < 50) {
        var pointIndex = randomIntFromInterval(0, polyArray[polyIndex].points.length - 1);
        polyArray[polyIndex].points[pointIndex] += randomIntFromInterval(-10, 10);
    } else {
        polyArray[polyIndex].colour = getRandomColor();
    }
}

function drawPoly(poly, colour) {
    ctx.fillStyle = colour;

    ctx.beginPath();
    ctx.moveTo(poly[0], poly[1]);
    for (item = 2; item < poly.length - 1; item += 2) {
        ctx.lineTo(poly[item], poly[item + 1])
    }

    ctx.closePath();

    ctx.fill();
}

function save() {
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.

    window.location.href = image;
}

function status() {
    var statusObj = {};
    statusObj.date = (new Date()).toISOString();
    statusObj.totalDraws = totalDraws;
    statusObj.successes = successes;
    statusObj.currentDistance = currentDistance;
    statusObj.polyArrayLength = polyArray.length;
    statusObj.polyArray = polyArray;
    statusObj.boundingBox = boundingBox;
    statusObj.filename = filename;
    statusObj.width = width;
    statusObj.height = height;
    var statusString = JSON.stringify(statusObj);
    console.log(statusString);
    //$.get('http://localhost:4040/status=' + statusString)
    $.ajax({
        type: "GET",
        dataType: 'jsonp',
        url: '/insert/frame/',
        data: {status: statusString}
    });
}

// from http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
function getRandomColor() {
    var colourMode = 2;
    if (colourMode == 1) {
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
         color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
    else if (colourMode == 2) {
      var colourIndex = randomIntFromInterval(0, coloursArray.length - 1);
      return coloursArray[colourIndex];
    }
}

function getAverageColour(points) {
    var redAcc = 0;
    var blueAcc = 0;
    var greenAcc = 0;
    for (var j = 0; j < points.length; j=j+2) {
        var pixelData = ctxImage.getImageData(points[j],points[j+1],1,1).data;
        redAcc += pixelData[0];
        greenAcc += pixelData[1];
        blueAcc += pixelData[2];
    }

    var actualPoints = points.length/2;
    var red = Math.round(redAcc / actualPoints).toString(16);
    if (red.length < 2) {
        red = '0' + red;
    }
    var green = Math.round(greenAcc / actualPoints).toString(16);
    if (green.length < 2) {
        green = '0' + green;
    }
    var blue = Math.round(blueAcc / actualPoints).toString(16);
    if (blue.length < 2) {
        blue = '0' + blue;
    }
    return '#' + red + green + blue;
}

// from http://stackoverflow.com/questions/4959975/generate-random-value-between-two-numbers-in-javascript
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
