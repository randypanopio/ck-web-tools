// in charge of drawing DOM elements


function renderSelectionGrid(count, width) {
    const mainElement = document.querySelector('#navigation-grid');
    const tableElement = document.createElement('table');

    // chunk count
    for (var i = 0; i < count; i++) {
        if (i % width == 0){
            
        }
    }


    for (let i = 0; i < height; i++) {

        const trElement = document.createElement('tr');
        for (let x = 0; x < width; x++) {
            let tdElement = document.createElement('td')
            trElement.appendChild(tdElement)
            tdElement.innerText = "hi"
        }
        tableElement.appendChild(trElement);
    }
    mainElement.innerHTML = '';
    mainElement.appendChild(tableElement);
}


//storing trashed code for now lool


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