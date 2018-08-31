var capture;
var img;
var pixelCount;
var colors;
var first_capture;

const detectionDiffInt = 800;


function setup() {
    colors = {
        'red': {
            'rgb': [209, 0, 0],
            'frequency': null,
            'firstCount': null,
            'lastCount': 0,
            'currentCount': 0
        },
        'orange': {
            'rgb': [255, 102, 34],
            'frequency': null,
            'firstCount': null,
            'lastCount': 0,
            'currentCount': 0
        },
        'yellow': {
            'rgb': [255, 218, 33],
            'frequency': null,
            'firstCount': null,
            'lastCount': 0,
            'currentCount': 0
        },
        'green': {
            'rgb': [51, 221, 0],
            'frequency': null,
            'firstCount': null,
            'lastCount': 0,
            'currentCount': 0
        },
        'blue': {
            'rgb': [17, 51, 204],
            'frequency': null,
            'firstCount': null,
            'lastCount': 0,
            'currentCount': 0
        },
        'purple': {
            'rgb': [51, 0, 68],
            'frequency': null,
            'firstCount': null,
            'lastCount': 0,
            'currentCount': 0
        }
    }

    var tempCounter = 0; // remove this; replace with some enumerate equivalent
    for (var colorKey in colors) {
        // instantiate oscillator
        var env = new p5.Envelope();
        env.setADSR(.001, .2, .2, .5);
        env.setRange(0.4, 0.0);
        var osc = new p5.Oscillator();
        osc.setType('sine');
        var freq = 200 + tempCounter * (800 / Object.keys(colors).length);
        osc.freq(freq);
        osc.amp(env);
        osc.start();
        colors[colorKey]['env'] = env;
        tempCounter += 1;
    }

    var targetVideoWidth = windowWidth * 0.50;
    var targetVideoHeight = windowHeight * 0.50;

    capture = createCapture(VIDEO);
    capture.size(targetVideoWidth, targetVideoHeight);
    capture.hide();

    var pixelD = pixelDensity();
    pixelCount = 4 * (capture.width * pixelD) * (capture.height * pixelD);
    first_capture = true;
}

function calculateClosestColors() {
    for (var colorKey in colors) {
        colors[colorKey]['lastCount'] = colors[colorKey]['currentCount'];
        colors[colorKey]['currentCount'] = 0;
    }

    if (capture.pixels.length > 0) {
        for (var i = 0; i < pixelCount; i += 4) {
            var totalDiff;
            var closestTargetColor;
            var minColorPixelDiff = 0;
            for (var colorKey in colors) {
                var c = colors[colorKey].rgb;
                currentPixelDiff = (
                    Math.abs(capture.pixels[i] - c[0]) 
                    + Math.abs(capture.pixels[i + 1] - c[1]) 
                    + Math.abs(capture.pixels[i + 2] - c[2])
                );
                if (minColorPixelDiff == 0 || minColorPixelDiff > currentPixelDiff) {
                    closestTargetColor = colorKey;
                    minColorPixelDiff = currentPixelDiff;
                };
            }
            if (first_capture == true) {
                colors[closestTargetColor]['firstCount'] += 1;
            }
            else {
                colors[closestTargetColor]['currentCount'] += 1;
            }
        }
        first_capture = false;
    }
}

function playSounds(detectionDiffInt) {
    // if diff between lastCount and currentCount is greater than specified int, start sound
    if (capture.pixels.length > 0) {
        for (var colorKey in colors) {
            var targetColor = colors[colorKey];
            if ((targetColor["currentCount"] - targetColor["lastCount"] >= detectionDiffInt) 
                && (targetColor["currentCount"] > targetColor["firstCount"])) {
                targetColor["env"].play();
            }
        }
    }
}

function draw() {
    var canvas = createCanvas(capture.width, capture.height);
    background('pink');
    var pixelD = pixelDensity();
    pixelCount = 4 * (capture.width * pixelD) * (capture.height * pixelD);

    image(capture, 0, 0, capture.width, capture.height);

    capture.loadPixels();
    calculateClosestColors();
    playSounds(detectionDiffInt);
}
