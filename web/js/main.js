// Written by Randy Panopio 
// import { getColorDict } from './modules/colordb.js'

// #region Globals
var colorDBCache = null;
var selectedColors = [];
var hasValidLoadedImage = false;
// #endregion

// #region Initialization and Hooked Event Listeners
function Initialize() {
    colorDBCache = getColorDict()
    console.log("Caching Color DB")
    console.log(colorDBCache)

    colorDBCache.forEach(element => {
        var str = element['RGB']
        // trim check
        if (str.startsWith("[") || str.startsWith("(")) {
            str = str.substring(1)
        }
        if (str.endsWith("]") || str.endsWith(")")) {
            str = str.slice(0, -1)
        }
        
        var n = str.split(",").map(Number)
        selectedColors.push(n)
    });

    console.log("Caching Selected Colors (all)")
    console.log(selectedColors)

    // console.log("test")
    // console.log(JSON.parse(selectedColors))
}

document.addEventListener("DOMContentLoaded", function(){
    Initialize()
});

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
    uploadedImage.crossOrigin = "Anonymous";
    const ictx = document.createElement('canvas').getContext('2d');
    ictx.drawImage(uploadedImage, 0, 0);
    loadedImageCanvasData = ictx.getImageData(0, 0, uploadedImage.naturalWidth, uploadedImage.naturalHeight);
    console.log("Loaded Image data: ")
    console.log(loadedImageCanvasData)

    let outputCanvas = document.getElementById("output-canvas")
    let octx = outputCanvas.getContext("2d")
    outputCanvas.style.backgroundColor = "white"
    outputCanvas.style.width = '35%'
    outputCanvas.style.height = '35%'
    
    // fit 500px width for pixel scale
    let pixelSize = Math.trunc(2000 / loadedImageCanvasData.width)
    outputCanvas.width = loadedImageCanvasData.width * pixelSize
    outputCanvas.height = loadedImageCanvasData.height * pixelSize

    // TODO optimize by just looping pixel data once. 
    // flatten array to rgb array
    let rgbArray = []
    for (var i = 0; i < loadedImageCanvasData.data.length; i += 4) {
        rgbArray.push([loadedImageCanvasData.data[i], loadedImageCanvasData.data[i + 1], loadedImageCanvasData.data[i + 2]])
    }
    console.log("rgbArray")
    console.log(rgbArray)
    
    // convert to 2d array
    let pixel2dArray = convertToMatrix(rgbArray, loadedImageCanvasData.width)
    // while(rgbArray.length) pixel2dArray.push(rgbArray.splice(0, loadedImageCanvasData.width))
    console.log("pixel2dArray")
    console.log(pixel2dArray)

    // iterate over 2d matrix and print each pixel after mapping
    for (var y = 0; y < loadedImageCanvasData.height; y++) {
        for (var x = 0; x < loadedImageCanvasData.width; x++) {
            let _r = pixel2dArray[y][x][0] //Math.floor(Math.random() * 256)
            let _g = pixel2dArray[y][x][1] //Math.floor(Math.random() * 256)
            let _b = pixel2dArray[y][x][2] //Math.floor(Math.random() * 256)
            // TODO optimize by caching already mapped color values instead of doing another loop of getting closest colour

            // map pixel based in input TODO add additional options, doing linear euclidean dist for now
            let mappedColor = getClosestValue([_r, _g, _b], selectedColors)
            octx.fillStyle = "rgba(" + mappedColor + ", 255)"
            // octx.fillStyle = "rgba("+ _r + "," + _g + "," + _b +", 255)" // Math.floor(Math.random() * 256)
            octx.fillRect(x * pixelSize, y * pixelSize, 1 * pixelSize, 1 * pixelSize)
        }
    }

    // TODO use uri/imagedata encoding, though not sure if thats more performant than looping
    console.log("out canvas pixel dims " + outputCanvas.width / pixelSize + ", " + outputCanvas.height / pixelSize)
}

function renderPreview() {

}

// #endregion
