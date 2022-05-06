// Written by Randy Panopio 
// import { getColorDict } from './modules/colordb.js'

// NOTE
// so I could convert the db to override it to have keys based on current selected colorspace. EG key would be rgba
// this means when doing  color tone mapping, we have an rgb/color value and use that key to lookup which image to render on preview cells

// #region Globals
var colorDBCache = null
// var selectedColors = [] // TODO build me when doing color selection feature

// Loaded image's processed data
var hasValidLoadedImage = false
var cachedData = []

// Table previews
var previewCells = []
var previewCellsDims = 25
// #endregion

// #region Initialization and Hooked Event Listeners
function Initialize() {
    colorDBCache = getColorDB()

    // populate previewCells
    for (var y = 0; y < previewCellsDims; y++) {
        for (var x = 0; x < previewCellsDims; x++) {
            let id = "cell-"+ x + "-" + y 
            let cell = document.getElementById(id)
            previewCells.push(cell)
        }
    }
    // TODO optimize, eliminate this matrix conversion
    // convert to 2d array
    previewCells = convertToMatrix(previewCells, previewCellsDims)
    console.log("preview grid cells")
    console.log(previewCells)
}

document.addEventListener("DOMContentLoaded", function(){
     Initialize()
})

const imageInput = document.getElementById("image-input")
imageInput.addEventListener("change", function () {
    console.log("Image input change event triggered, opening fs")
    const reader = new FileReader()

    reader.addEventListener("load", () => {
        const uploaded_image = reader.result
        var imgDom = document.getElementById("upload-preview")
        imgDom.src = `${uploaded_image}`

        console.log("Uploaded W: " + imgDom.naturalWidth + ", H: " + imgDom.naturalHeight)

        if (imgDom.naturalWidth <= 500 && imgDom.naturalHeight <= 500) {
            // should I be rejecting images here? yes
            hasValidLoadedImage = true;
        } else {
            // clear image for now
            document.getElementById("upload-preview").src = '#'
            hasValidLoadedImage = false;
            console.error("Image too large/not supported!")
        }
    })

    reader.readAsDataURL(this.files[0])
})
// #endregion

// #region Core Functions
function processImage() {
    if (!hasValidLoadedImage) {  
        console.error("No valid uploaded image available!")
        return
    }
    console.log("Processing currently uploaded image")

    let loadedImageCanvasData //TODO rename me 
    // get the uploaded image from the dom and draw it on a hidden canvas NOTE maybe replace the img to this canvas instead?
    const uploadedImage = document.getElementById("upload-preview")
    // CORS
    uploadedImage.crossOrigin = "Anonymous"
    const ictx = document.createElement('canvas').getContext('2d')
    ictx.drawImage(uploadedImage, 0, 0)
    loadedImageCanvasData = ictx.getImageData(0, 0, uploadedImage.naturalWidth, uploadedImage.naturalHeight);
    console.log("Loaded Image data: ")
    console.log(loadedImageCanvasData)

    let width = loadedImageCanvasData.width
    let height = loadedImageCanvasData.height

    let outputCanvas = document.getElementById("output-canvas")
    let octx = outputCanvas.getContext("2d")
    outputCanvas.style.backgroundColor = "white"
    outputCanvas.style.width = '35%'
    outputCanvas.style.height = '35%'
    
    // fit 500px width for pixel scale
    let pixelSize = Math.trunc(2000 / width)
    let canvasPixelWidth = width * pixelSize
    let canvasPixelHeight = height * pixelSize
    outputCanvas.width = canvasPixelWidth
    outputCanvas.height = canvasPixelHeight

    // reset cachedData
    cachedData = []
    cachedData = Array.from(Array(height), () => new Array(width))
    console.log("========== cleared cachedData")
    console.log(cachedData)

    // TODO optimize by just looping pixel data once. 
    // flatten array to rgb array
    let rgbArray = []
    for (var i = 0; i < loadedImageCanvasData.data.length; i += 4) {
        rgbArray.push([loadedImageCanvasData.data[i], loadedImageCanvasData.data[i + 1], loadedImageCanvasData.data[i + 2]])
    }
    console.log("rgbArray")
    console.log(rgbArray)
    
    // convert to 2d array
    let pixel2dArray = convertToMatrix(rgbArray, width)
    // while(rgbArray.length) pixel2dArray.push(rgbArray.splice(0, width))
    console.log("pixel2dArray")
    console.log(pixel2dArray)

    // iterate over 2d matrix and print each pixel after mapping
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            let _r = pixel2dArray[y][x][0] //Math.floor(Math.random() * 256)
            let _g = pixel2dArray[y][x][1] //Math.floor(Math.random() * 256)
            let _b = pixel2dArray[y][x][2] //Math.floor(Math.random() * 256)

            // TODO optimize by caching already mapped color values instead of doing another loop of getting closest colour    
            let colorSpace = "RGB"
            let closestValue = getDBClosestValue(colorDBCache, [_r, _g, _b], colorSpace)
            cachedData[y][x] = closestValue

            // Fill in canvas preview
            octx.fillStyle = "rgba(" + trimBrackets(closestValue[colorSpace]) + ", 255)"
            octx.fillRect(x * pixelSize, y * pixelSize, 1 * pixelSize, 1 * pixelSize)
        }
    }

    //TODO also add grid lines
    let p = 100
    const offset = 0.5 // not even sure if this is useful
    const showGridLinesDOM = document.getElementById("show-grid-lines")
    const gridThicknessInput = document.getElementById("grid-thickness")
    if (showGridLinesDOM.checked) {
        octx.lineWidth = parseInt(gridThicknessInput.value)
        octx.strokeStyle = "black"

        for (var x = 0; x < canvasPixelWidth; x += pixelSize * previewCellsDims) {
            octx.moveTo(offset + x, 0)
            octx.lineTo(offset + x, canvasPixelHeight)
        }   
    
        for (var x = 0; x < canvasPixelHeight; x += pixelSize * previewCellsDims) {
            octx.moveTo(0, offset + x)
            octx.lineTo(canvasPixelWidth, offset + x)
        }
        octx.stroke();
    }
    
    console.log("cachedData")
    console.log(cachedData)

    // TODO use uri/imagedata encoding, though not sure if thats more performant than looping
    console.log("out canvas pixel dims " + outputCanvas.width / pixelSize + ", " + outputCanvas.height / pixelSize)
}

function renderPreview() {
    const previewTable = document.getElementById("preview-table")
    const chunkInputX = document.getElementById("chunk-input-x")
    const chunkInputY = document.getElementById("chunk-input-y")

    let chunkX = parseInt(chunkInputX.value) - 1
    let chunkY = parseInt(chunkInputY.value) - 1
    for (let y = 0, gy = chunkY * previewCellsDims; y < previewCellsDims - 1; y++, gy++) {
        for (let x = 0, gx = chunkX * previewCellsDims; x < previewCellsDims - 1; x++, gx++) {
            if (gy <= cachedData.length - 1 && gx <= cachedData[y].length - 1) {
                let selection = cachedData[gy][gx]
                previewCells[y][x].style.backgroundColor = "rgba(" + trimBrackets(selection['RGB']) + ", 255)"
                previewCells[y][x].src = selection['imageSource']
            } else {
                previewCells[y][x].style.backgroundColor = "transparent"
                previewCells[y][x].src = "images/tiles/empty.png"
            }
        }
    }
    previewTable.style.display = "table"
}

// #endregion
