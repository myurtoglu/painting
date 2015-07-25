"use strict";

var canvas;
var gl;

var currPts = [];
var points = [];
var colors = [];

var lineWidth = 1.0;
var mouseClicked = false;
var lineColor = [1, 0, 0];

var bufferId;
var cbufferId;
var maxNumberOfPoints = 200000;

function changeLineWidth(newValue)
{
    var numVal = Number(newValue);
    document.getElementById("range").innerHTML = numVal.toPrecision(3);
    lineWidth = numVal;
    render();
}

function clearFunction()
{
    points = [];
    currPts = [];
    colors = [];
    render();
}

function colorChange(newValue)
{
    lineColor = newValue.color.rgb;
}

function canvasColorChange(newValue)
{
    var newRgb = newValue.color.rgb;
    gl.clearColor(newRgb[0], newRgb[1], newRgb[2], 1.0);
    render();
}

function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Vertex buffer
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumberOfPoints, gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Color buffer
    cbufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumberOfPoints, gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Event listeners for mouse input
    canvas.addEventListener("mousemove", function(event) {
        if (mouseClicked == true) {
            currPts.push(vec2(-1 + 2*event.offsetX/canvas.width,
                              -1 + 2*(canvas.height - event.offsetY)/canvas.height));
            render();
        }
    });

    canvas.addEventListener("mousedown", function() {
        mouseClicked = true;
    });

    canvas.addEventListener("mouseup", function() {
        mouseClicked = false;
        currPts = [];
    });

    currPts = [];
    render();
};

function createLine(begin, end)
{
    // get initial and final pts on a line, return rectangle with width
    var width = lineWidth * 0.001;
    var beta = (Math.PI/2.0) - Math.atan2(end[1] - begin[1], end[0] - begin[0]);
    var delta_x = Math.cos(beta)*width;
    var delta_y = Math.sin(beta)*width;
    return [vec2(begin[0] - delta_x, begin[1] + delta_y),
            vec2(begin[0] + delta_x, begin[1] - delta_y),
            vec2(end[0] + delta_x, end[1] - delta_y),
            vec2(end[0] - delta_x, end[1] + delta_y)];
}

window.onload = init;

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (currPts.length == 2) {
        var tempPts = createLine(currPts[0], currPts[1]);
        points.push(tempPts[0], tempPts[1], tempPts[2], tempPts[3]);
        for (var i = 0; i < 4; ++i) {
            colors.push(lineColor[0], lineColor[1], lineColor[2]);
        }
        currPts.shift();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cbufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors));
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    for (var i = 0; i < points.length / 4; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}