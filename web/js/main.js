// Written by Randy Panopio 
colorDict = {
    'dirt ground': (127, 95, 50),
    'turf ground': (86, 128, 99),
    'sand ground': (212, 185, 90),
    'clay ground': (232, 139, 105),
    'stone ground': (104, 131, 151),
    'larva ground': (199, 117, 99),
    'grass ground': (61, 155, 64),
    'mold ground': (108, 188, 224),
    'wood bridge': (140, 88, 38),
    'wood floor': (199, 148, 79),
    'paintable floor (unpainted)': (159, 180, 236),
    'stone bridge': (124, 117, 108),
    'stone floor': (129, 132, 140),
    'scarlet bridge': (168, 28, 46),
    'scarlet floor': (178, 53, 38),
    'caveling floor tile': (130, 130, 130),
    'dark caveling floor tile': (130, 130, 130),
    'woven mat': (59, 139, 64),
    'blue paint': (42, 108, 228),
    'green paint': (85, 182, 38),
    'yellow paint': (255, 232, 46),
    'white paint': (129, 173, 224),
    'purple paint': (139, 79, 167),
    'red paint': (223, 0, 0),
    'brown paint': (151, 75, 38),
    'black paint': (75, 85, 85),
}

availableColors = [
    [127, 95, 50],
    [86, 128, 99],
    [212, 185, 90],
    [232, 139, 105],
    [104, 131, 151],
    [199, 117, 99],
    [61, 155, 64],
    [108, 188, 224],
    [140, 88, 38],
    [199, 148, 79],
    [159, 180, 236],
    [124, 117, 108],
    [129, 132, 140],
    [168, 28, 46],
    [178, 53, 38],
    [130, 130, 130],
    [130, 130, 130],
    [59, 139, 64],
    [42, 108, 228],
    [85, 182, 38],
    [255, 232, 46],
    [129, 173, 224],
    [139, 79, 167],
    [223, 0, 0],
    [151, 75, 38],
    [75, 85, 85]
]


// draw canvas - CamanJS?
// get pixel data from canvas - CanvasRenderingContext2D.getImageData()
// apply data mapping - for now all front end with naive euclidean dist on rgb
// iterate over new pixel data and render table dom 
//TODO delta E interpretation
// TODO db/python color mapping/interpretation?


// #region Core Utility funcs

// linear eunclidean space, RGB, but extend to be any colorspace value?
function getClosestValue(color, map) {
    var closest = {}
    var dist
    for (var i = 0; i < map.length; i++) {
        dist = Math.pow(map[i][0] - color[0], 2)
        dist += Math.pow(map[i][1] - color[1], 2)
        dist += Math.pow(map[i][2] - color[2], 2)
        // dist = Math.sqrt(dist) // can skip this and use approximate relative distance

        if (!closest.dist || closest.dist > dist) {
            closest.dist = dist
            closest.color = map[i]
        }
    }
    // returns closest match as RGB array without alpha
    return closest.color
}

function convertToMatrix(array, width) {
    var matrix = [], i, k;
    for (i = 0, k = -1; i < array.length; i++) {
        if (i % width === 0) {
            k++;
            matrix[k] = [];
        }
        matrix[k].push(array[i]);
    }
    return matrix;
}


// #endregion


// #region Core Functions

function processImage() {
    console.log("Processing currently uploaded image")

    let loadedImageCanvasData //TODO rename me 
    // get the uploaded image from the dom and draw it on a hidden canvas NOTE maybe replace the img to this canvas instead?
    const uploadedImage = document.getElementById("upload-preview")
    // do this so we can read image
    uploadedImage.crossOrigin = "Anonymous";
    const ictx = document.createElement('canvas').getContext('2d');
    ictx.drawImage(uploadedImage, 0, 0);
    loadedImageCanvasData = ictx.getImageData(0, 0, uploadedImage.naturalWidth, uploadedImage.naturalHeight);
    console.log("Loaded Image data: ")
    console.log(loadedImageCanvasData)

    // uploadedImage.onload = () => {
    //     // draw image on a canvas to read pixel data
    //     const context = document.createElement('canvas').getContext('2d');
    //     context.drawImage(uploadedImage, 0, 0);
    //     loadedImageCanvasData = context.getImageData(0, 0, uploadedImage.naturalWidth, uploadedImage.naturalHeight);
    //     console.log("Loaded Image data: ")
    //     console.log(loadedImageCanvasData)
    // }

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
            // map pixel based in input TODO add additional options, doing linear euclidean dist for now
            let mappedColor = getClosestValue([_r, _g, _b], availableColors)
            octx.fillStyle = "rgba(" + mappedColor + ", 255)"
            // octx.fillStyle = "rgba("+ _r + "," + _g + "," + _b +", 255)" // Math.floor(Math.random() * 256)
            octx.fillRect(x * pixelSize, y * pixelSize, 1 * pixelSize, 1 * pixelSize)
        }
    }

    // TODO use uri/imagedata encoding, though not sure if thats more performant than looping
    console.log("out canvas pixel dims " + outputCanvas.width / pixelSize + ", " + outputCanvas.height / pixelSize)
}

// #endregion

// #region EVENT LISTENERS

const imageInput = document.getElementById("image-input")
imageInput.addEventListener("change", function () {
    console.log("Image input change event triggered, opening fs")
    const reader = new FileReader()

    reader.addEventListener("load", () => {
        const uploaded_image = reader.result
        console.log("uploaded image result")
        console.log(uploaded_image)
        document.getElementById("upload-preview").src = `${uploaded_image}`
    })

    reader.readAsDataURL(this.files[0])
})

// #endregion

// #region gomi
function renderHDGrid() {
    let inputCanvas = document.getElementById("input-canvas")
    let ctx = inputCanvas.getContext("2d")
    inputCanvas.style.backgroundColor = "white"

    //
    image = document.getElementById("prev")
    image.crossOrigin = "Anonymous"

    let trueImageWidth = image.width
    let trueImageHeight = image.height

    inputCanvas.style.width = '10%'
    inputCanvas.style.height = '10%'
    inputCanvas.width = trueImageWidth
    inputCanvas.height = trueImageHeight

    ctx.imageSmoothingEnabled = false
    ctx.drawImage(image, 0, 0)

    // grid stuff
    // canvas.innerHTML = ""

    // gridDimensions = [4,5]

    // for (var i = 0; i < gridDimensions[0]; i++) {
    //     let row = document.createElement("tr")
    //     row.id = "row-" + i

    //     table.appendChild(row)
    //     let rowBlock = document.getElementById(row.id)

    //     for (var j = 0; j < gridDimensions[1]; j++){
    //         let cell = document.createElement("td")
    //         var img = document.createElement("img")
    //         img.src = "images/full-tiles/dirt_ground.png"
    //         img.alt = "dirt"

    //         cell.appendChild(img)
    //         rowBlock.append(cell)
    //     }
    // }
}


function test() {

    console.log('calling test function')

    console.log('reading pixel data of canvas')

    let inputCanvas = document.getElementById("input-canvas")
    let outputCanvas = document.getElementById("output-canvas")
    let ictx = inputCanvas.getContext("2d")
    let octx = outputCanvas.getContext("2d")
    octx.imageSmoothingEnabled = true
    outputCanvas.style.backgroundColor = "white"

    outputCanvas.style.width = '35%'
    outputCanvas.style.height = '35%'

    // fit 500px width for pixel scale
    let pixelSize = Math.trunc(2000 / loadedImageCanvasData.width)

    outputCanvas.width = loadedImageCanvasData.width * pixelSize
    outputCanvas.height = loadedImageCanvasData.height * pixelSize

    // ictx.setAttribute('crossOrigin', '')

    let dataArray = loadedImageCanvasData.data



    console.log("loadedImageCanvasData")
    console.log(loadedImageCanvasData)


    // loop through the entire loop

    var pushedPixel = []
    // first create loop of a an image's full row
    //row acts as y
    // let rowSize = imgData.width * 4
    // let pixelChunk = 4
    // for (let y = 1; y < imgData.height + 1; y++) {
    //     for (let row = 0; row < rowSize; row += pixelChunk) {
    //         let _r = dataArray[row] * y
    //         let _g = dataArray[row + 1] * y
    //         let _b = dataArray[row + 2] * y
    //         // discard alpha
    //         let mappedPixel = getClosestValue([_r, _g, _b], availableColors)
    //         // _r = Math.floor(Math.random() * 256)
    //         // _b = Math.floor(Math.random() * 256)
    //         // _g = Math.floor(Math.random() * 256)

    //         octx.fillStyle = "rgba("+ _r + "," + _g + "," + _b +", 255)"
    //         octx.fillRect(row, y - 1, 1 ,1)
    //         octx.fillRect(row + 1, y - 1, 1 ,1)
    //         octx.fillRect(row + 2, y - 1, 1 ,1)
    //         octx.fillRect(row + 3, y - 1, 1 ,1)
    //         pushedPixel.push(mappedPixel)
    //     }
    // }






    // TODO optimize by just looping pixel data once. 


    // flatten array to rgb array
    let rgbArray = []
    for (var i = 0; i < dataArray.length; i += 4) {
        rgbArray.push([dataArray[i], dataArray[i + 1], dataArray[i + 2]])
    }

    console.log("rgbArray")
    console.log(rgbArray)

    // convert to 2d array
    let pixel2dArray = convertToMatrix(rgbArray, loadedImageCanvasData.width)
    // while(rgbArray.length) pixel2dArray.push(rgbArray.splice(0, loadedImageCanvasData.width))

    console.log("pixel2dArray")
    console.log(pixel2dArray)

    // iterate over 2d matrix and print each pixel after mapping

    // the pixel way of iteration
    for (var y = 0; y < loadedImageCanvasData.height; y++) {
        for (var x = 0; x < loadedImageCanvasData.width; x++) {
            let _r = pixel2dArray[y][x][0] //Math.floor(Math.random() * 256)
            let _g = pixel2dArray[y][x][1] //Math.floor(Math.random() * 256)
            let _b = pixel2dArray[y][x][2] //Math.floor(Math.random() * 256)
            // map pixel based in input TODO add additional options, doing linear euclidean dist for now
            let mappedColor = getClosestValue([_r, _g, _b], availableColors)
            octx.fillStyle = "rgba(" + mappedColor + ", 255)"
            // octx.fillStyle = "rgba("+ _r + "," + _g + "," + _b +", 255)" // Math.floor(Math.random() * 256)
            octx.fillRect(x * pixelSize, y * pixelSize, 1 * pixelSize, 1 * pixelSize)
        }
    }

    // the array way of iteration
    // for(var i = 0; i < pixel2dArray.length; i++) {
    //     var row = pixel2dArray[i];
    //     for(var j = 0; j < row.length; j++) {
    //         let _r = row[j][0]
    //         let _g = row[j][1]
    //         let _b = row[j][2]
    //         octx.fillStyle = "rgba("+ _r + "," + _g + "," + _b +", 255)" // Math.floor(Math.random() * 256)
    //         octx.fillRect(i * pixelSize, j  * pixelSize, 1  * pixelSize, 1  * pixelSize)
    //     }
    // }

    // for (let x = 0; x < imgData.width; x++){
    //     for (let y = 1; y < imgData.height + 1; y++) {
    //         let _r = dataArray[x * y]
    //         let _g = dataArray[x * y + 1]
    //         let _b = dataArray[x * y + 2]
    //         let mappedPixel = getClosestValue([_r, _g, _b], availableColors)

    //         octx.fillStyle = "rgba("+ _r + "," + _g + "," + _b +", 255)" // Math.floor(Math.random() * 256)
    //         octx.fillRect(x,y - 1, 1, 1)
    //         pushedPixel.push(mappedPixel)
    //     }
    // }


    // TODO use uri/imagedata encoding, though not sure if thats more performant than looping



    // convert linear array to 2d 
    // let width = imgData.width
    // let height = imgData.height

    // let pixel2dArray = []
    // while(rgbArray.length) pixel2dArray.push(rgbArray.splice(0, width))

    // console.log("matrix")
    // console.log(pixel2dArray)

    // console.log("mapped")
    // console.log(mappedArray)


    // THE UNCOMPRESSED VERSION 

    // get pixeldata from canvas
    // convert pixeldata to 2d matrix
    // remap 2d matrix
    // iterate over image dims and draw per pixel or iterate over 2d matrix with correct iterators

    console.log("out canvas pixel dims " + outputCanvas.width / pixelSize + ", " + outputCanvas.height / pixelSize)
}





function loadImage() {
    console.log('loading image')
    //     let loadedImage = new Image()
    //     loadedImage.src = 'images/test/new.png'
    //     loadedImage.crossOrigin = 'Anonymous'
    //     console.log(loadedImage)

    //     console.log('loaded image width: ' + loadedImage.width)
    //     console.log('loaded image height: ' + loadedImage.height)

    //     loadedImage.onload = () => {
    //         console.log('generating image data')
    //         const canvas = document.createElement('inputcanvas')
    //         const ctx = canvas.getContext("2d")
    //         // loadedImageCanvasData = ctx.getImageData(0,0, loadedImage.width,inputCanvas.height)

    //         const {
    //             data
    //           } = ctx.getImageData(10, 10, 1, 1);
    //           console.log(data)
    //     }

    const uploadedImage = document.getElementById("upload-preview")
    // const uploadedImage = new Image();
    // uploadedImage.src = 'images/test/new.png';
    uploadedImage.crossOrigin = "Anonymous";
    uploadedImage.onload = () => {
        // draw image on a canvas to read pixel data
        const context = document.createElement('canvas').getContext('2d');
        context.drawImage(uploadedImage, 0, 0);
        const data = context.getImageData(0, 0, uploadedImage.naturalWidth, uploadedImage.naturalHeight);
        loadedImageCanvasData = data // pass pixel data back
        console.log("Loaded Image data: ")
        console.log(data)
    }

    return loadedImageCanvasData
}

  // #endregion