

const dcanvas = document.getElementById("drawCanvas");
const ctx = dcanvas.getContext("2d");
const printArr = document.getElementById("printArray");
const printTemp = document.getElementById("printTemp");
const displayTool = document.getElementById("dispTool");
const displayColor = document.getElementById("dispColor");
const colorBox = document.getElementById("colorBox");

// variables

const toolList = ["brush", "eraser", "bucket"];
let tool = toolList[0];
let color = "#EE4B2B";
let pixelSize = 24;
let canvasWidth = 33;
let canvasHeight = 24;
let canvasMarginTop = -1*canvasHeight*pixelSize/4;
let canvasMarginLeft = -1*canvasWidth*pixelSize/2;

//template
let useTemplate = false;

//mouse
let isDrawing = false;

//colorList
let colorList = {"red":"#EE4B2B", "blue":"#0096FF", "green":"#50C878", "yellow":"#FFEA00",
"orange":"#F28C28", "violet":"#7F00FF", "grey":"#808080", "turquoise":"#40e0d0", "black":"#000000"
, "white":"#FFFFFF"};


//here code

//dcanvas setup
dcanvas.width = canvasWidth * pixelSize;
dcanvas.height = canvasHeight * pixelSize;
dcanvas.style.marginTop = String(canvasMarginTop) + "px";
dcanvas.style.marginLeft = String(canvasMarginLeft) + "px";


//color button borders

let colorBtnArray = document.getElementsByClassName("colorBtn");
for (let c = 0; c < colorBtnArray.length; c++){
    let ih = colorBtnArray.item(c).innerHTML;
    colorBtnArray.item(c).style.borderColor = colorList[ih];
}

//pixel arrays

let templateArray = new Array(canvasHeight).fill(null).map(()=>new Array(canvasWidth).fill(null));
for (let i = 0; i < templateArray.length; i++){
    for (let j = 0; j < templateArray[0].length; j++){
        templateArray[i][j] = "#FFFFFF";
    }
}

let pixelArray = new Array(canvasHeight).fill(null).map(()=>new Array(canvasWidth).fill(null));
for (let i = 0; i < pixelArray.length; i++){
    for (let j = 0; j < pixelArray[0].length; j++){
        pixelArray[i][j] = "#FFFFFF";
    }
}

refresh();



//events
dcanvas.addEventListener("mousedown", function(e){
    isDrawing = true;
    if (tool === "bucket"){
        bucketFill(dcanvas, e);
    }
    else if(tool === "eraser" || tool === "brush"){
        paintPixel(dcanvas, e);
    }
});
dcanvas.addEventListener("mouseout", function(e){
    isDrawing = false;
})
dcanvas.addEventListener("mouseup", function(e){
    isDrawing = false;
})

dcanvas.addEventListener("mousemove", function(e){
    if (isDrawing && tool !== "bucket"){
        paintPixel(dcanvas, e);
    }
})

//functions

function updateArrDisplay(){
    let output = "";
    for (let i = 0; i < pixelArray.length; i++){
        for (let j = 0; j < pixelArray[0].length; j++){
            output += pixelArray[i][j];
            if (j<pixelArray[0].length - 1){
                output += ", ";
            }
        }
        output += "\n";
    }
    printArr.innerHTML = output;
    let outputTemp = "";
    for (let i = 0; i < templateArray.length; i++){
        for (let j = 0; j < templateArray[0].length; j++){
            outputTemp += templateArray[i][j];
            if (j<templateArray[0].length - 1){
                outputTemp += ", ";
            }
        }
        outputTemp += "\n";
    }
    printTemp.innerHTML = outputTemp;

}

function clearCanvas(){
    ctx.clearRect(0, 0, dcanvas.width, dcanvas.height);
    for (let i = 0; i < pixelArray.length; i++){
        for (let j = 0; j < pixelArray[0].length; j++){
            if (templateArray[i][j]==="#FFFFFF" || !useTemplate){
                pixelArray[i][j] = "#FFFFFF";
            }
        }
    }
    drawGrid();
    refresh();
}

function refresh(){
    ctx.clearRect(0, 0, dcanvas.width, dcanvas.height);
    for (let i = 0; i < pixelArray.length; i++){
        for (let j = 0; j < pixelArray[0].length; j++){
            ctx.fillStyle = pixelArray[i][j];
            ctx.fillRect(j*pixelSize,i*pixelSize,pixelSize,pixelSize);
        }
    }
    drawGrid();
    updateArrDisplay();
}

function drawGrid(){
    ctx.strokeStyle = "#b7b7b7";
    ctx.lineWidth = 1;
    for (let i = 0; i < templateArray.length; i++){
        for (let j = 0; j < templateArray[0].length; j++){
            if (templateArray[i][j] === "#FFFFFF" || !useTemplate){
                drawLine([j*pixelSize,i*pixelSize], [(j+1)*pixelSize,i*pixelSize]);
                drawLine([(j+1)*pixelSize,i*pixelSize], [(j+1)*pixelSize,(i+1)*pixelSize]);
                drawLine([(j+1)*pixelSize,(i+1)*pixelSize], [j*pixelSize,(i+1)*pixelSize]);
                drawLine([j*pixelSize,(i+1)*pixelSize], [j*pixelSize,i*pixelSize]);
            }
        }
    }
}

function setTool(newTool){
    tool = toolList[newTool];
    displayTool.innerHTML = "current tool: " + tool;
}

function paintPixel(canvas, event){
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    x = Math.floor(x/pixelSize);
    y = Math.floor(y/pixelSize);
    if (templateArray[y][x] === "#FFFFFF" || !useTemplate){
        if (tool === "brush"){
            pixelArray[y][x] = color;
        }
        else if (tool === "eraser"){
            pixelArray[y][x] = "#FFFFFF";
        }
    }
    refresh();
}

function bucketFill(canvas, event){
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    x = Math.floor(x/pixelSize);
    y = Math.floor(y/pixelSize);
    let prevColor = pixelArray[y][x];
    if (templateArray[y][x] === "#FFFFFF" || !useTemplate){
        let visited = new Array(canvasHeight).fill(null).map(()=>new Array(canvasWidth).fill(null));
        for (let i = 0; i < visited.length; i++){
            for (let j = 0; j < visited[0].length; j++){
                visited[i][j] = 0;
            }
        }
        spreadPaint(dcanvas, visited, prevColor, x, y);
        refresh();
    }
}

function spreadPaint(canvas, visited, pColor, x, y){
    pixelArray[y][x] = color;
    visited[y][x] = 1;
    if (y>0&&pixelArray[y-1][x]===pColor&&visited[y-1][x]===0){
        spreadPaint(canvas, visited, pColor, x, y-1);
    }
    if (y<pixelArray.length-1&&pixelArray[y+1][x]===pColor&&visited[y+1][x]===0){
        spreadPaint(canvas, visited, pColor, x, y+1);
    }
    if (x>0&&pixelArray[y][x-1]===pColor&&visited[y][x-1]===0){
        spreadPaint(canvas, visited, pColor, x-1, y);
    }
    if (x<pixelArray[0].length-1&&pixelArray[y][x+1]===pColor&&visited[y][x+1]===0){
        spreadPaint(canvas, visited, pColor, x+1, y);
    }
}

function drawLine(begin, end) {
    ctx.beginPath();
    ctx.moveTo(...begin);
    ctx.lineTo(...end);
    ctx.stroke();
}

function setColor(newColor){
    color = newColor;
    displayColor.innerHTML = "current color: " + color;
    colorBox.style.backgroundColor = color;
}

//export

function exportTemp(){

    for (let i = 0; i < templateArray.length; i++){
        for (let j = 0; j < templateArray[0].length; j++){
            templateArray[i][j] = pixelArray[i][j];
        }
    }

    useTemplate = true;
    refresh();
    let output = "";
    let seenColors = ["#000000", "#FFFFFF"];
    for (let i = 0; i < templateArray.length; i++){
        for (let j = 0; j < templateArray[0].length; j++){
            switch(templateArray[i][j]){
                case "#FFFFFF":
                    output += "F-";
                    break;
                case "#000000":
                    output += "0-"
                    break;
                default:
                    if (seenColors.includes(templateArray[i][j])){
                        output += String(seenColors.indexOf(templateArray[i][j])) + "-";
                    }
                    else {
                        seenColors.push(templateArray[i][j]);
                        output += String(seenColors.length - 1) + "-";
                    }
            }
        }
        console.log(output);
        output = "";
    }
}

