var capture;
var img;
var pixelCount;
var colortonesArray;
var noteFreqObj;

const colorClosenessFlexValue = 50;
const detectionDiffInt = 800;


function setup() {
    // setting the scale, default middle C
    // x2 to go up or down an octave
    // TODO: enable octave selection
    noteFreqObj = {
        "A": 220.00,
        "A#": 233.08,
        "B": 246.94,
        "C": 261.63,
        "C#": 277.18,
        "D": 293.66,
        "D#": 311.13,
        "E": 329.63,
        "F": 349.23,
        "F#": 369.99,
        "G": 392.00,
        "G#": 415.30
    }

    colortonesArray = new Array();

    let targetVideoWidth = windowWidth * 0.80;
    let targetVideoHeight = windowHeight * 0.80;

    capture = createCapture(VIDEO);
    capture.size(targetVideoWidth, targetVideoHeight);
    capture.hide();
    pixelCount = 4 * capture.width * capture.height;

    var canvas = createCanvas(windowWidth * 0.96, windowHeight * 0.96);
    background("lightblue");
}

// TODO: rework this function
// function calculateClosestColors() {
//     for (var colorKey in colors) {
//         colors[colorKey]['lastCount'] = colors[colorKey]['currentCount'];
//         colors[colorKey]['currentCount'] = 0;
//     }

//     if (capture.pixels.length > 0) {
//         for (var i = 0; i < pixelCount; i += 4) {
//             var totalDiff;
//             var closestTargetColor;
//             var minColorPixelDiff = 0;
//             for (var colorKey in colors) {
//                 var c = colors[colorKey].rgb;
//                 currentPixelDiff = (
//                     Math.abs(capture.pixels[i] - c[0]) 
//                     + Math.abs(capture.pixels[i + 1] - c[1]) 
//                     + Math.abs(capture.pixels[i + 2] - c[2])
//                 );
//                 if (minColorPixelDiff == 0 || minColorPixelDiff > currentPixelDiff) {
//                     closestTargetColor = colorKey;
//                     minColorPixelDiff = currentPixelDiff;
//                 };
//             }
//             if (first_capture == true) {
//                 colors[closestTargetColor]['firstCount'] += 1;
//             }
//             else {
//                 colors[closestTargetColor]['currentCount'] += 1;
//             }
//         }
//     }
// }

function playSounds(detectionDiffInt) {
    // TODO: play sound for longer depending on duration on canvas
    if (capture.pixels.length > 0) {
        for (let colortonesIndex in colortonesArray) {
            let targetColor = colortonesArray[colortonesIndex];
            if ((targetColor["currentCount"] - targetColor["lastCount"] >= detectionDiffInt)) {
                targetColor["env"].play();
            }
        }
    }
}

function setTone(note, arrayIndex) {
    // instantiate oscillator
    let env = new p5.Envelope();
    env.setADSR(.001, .2, .2, .5);
    env.setRange(0.4, 0.0);

    let osc = new p5.Oscillator();
    osc.setType("sine");

    let freq = noteFreqObj[note];
    osc.freq(freq);
    osc.amp(env);
    osc.start();

    colortonesArray[arrayIndex]["frequency"] = freq;
    colortonesArray[arrayIndex]["env"] = env;
}

function selectedNoteEvent(sel, itemIndex) {
    let val = sel.value();
    setTone(val, itemIndex);
}

function mousePressed() {
    let colorToneObj = {
        "color": get(mouseX, mouseY),
        "lastCount": null,
        "currentCount": null,
        "frequency": null
    };
    if (colortonesArray.length < 12) {
        colortonesArray.push(colorToneObj);

        // TODO: populate within bounds of capture only
        textAlign(CENTER);
        let sel = createSelect();
        sel.position(50 * (colortonesArray.length-1) + 10, capture.height + 65);
        let sortedNotes = Object.keys(noteFreqObj).sort();
        for (var keyIndex in sortedNotes) {
            sel.option(sortedNotes[keyIndex]);
        }
        let partialSelectedNoteEvent = selectedNoteEvent.bind(null, sel, colortonesArray.length);
        sel.changed(partialSelectedNoteEvent);
    } else {
        // TODO: change this to be displayed gui text
        console.log("max of 12 allowed");
    }
}

function draw() {
    image(capture, 0, 0, capture.width, capture.height);

    // TODO: log pixels for first capture

    // current color box
    fill(get(mouseX, mouseY));
    stroke("orange");
    strokeWeight(4);
    rect(25, 25, 50, 50);

    // display all colortones
    for (let colortonesIndex in colortonesArray) {
        let currentColor = colortonesArray[colortonesIndex];
        fill(currentColor["color"]);
        let xPos = 50 * (int(colortonesIndex))+5;
        rect(xPos, capture.height + 10, 40, 40);
    }

    capture.loadPixels();
    // calculateClosestColors();
    playSounds(detectionDiffInt);
}
