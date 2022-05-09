// Written by Randy Panopio 
// import { getColorDict } from './modules/colordb.js'

// NOTE
// so I could convert the db to override it to have keys based on current selected colorspace. EG key would be rgba
// this means when doing  color tone mapping, we have an rgb/color value and use that key to lookup which image to render on preview cells

// #region Globals
var colorDB = null
// var selectedColors = [] // TODO build me when doing color selection feature

// var colorIdsToExclude = []


// Loaded image's processed data
var cachedData = []

// Table previews
var previewCells = []
// var previewCellsDims = 5 //parseInt(gridSizeDOM.value)

const maxDims = 500

var showImageInputs = true
var showSelections = true
var showCounters = true
// #endregion

// #region DOM selectors

const chunkInputX = document.getElementById("chunk-input-x")
const chunkInputY = document.getElementById("chunk-input-y")
const showGridLinesDOM = document.getElementById("show-grid-lines")
const gridThicknessInput = document.getElementById("grid-thickness")
const imageUpload = document.getElementById("image-upload")
const imgDom = document.getElementById("upload-preview")
const previewTable = document.getElementById("preview-table")
const uploadedImage = document.getElementById("upload-preview")
const gridSizeDOM = document.getElementById("grid-size")
const imageInputsDOM = document.getElementById("image-inputs")
const itemSelectionsDOM = document.getElementById("item-selections")
const itemCountersDOM = document.getElementById("item-counters")

// #endregion

// #region Initialization and Hooked Event Listeners
function Initialize() {
    colorDB = getColorDB()
    // should this be async?
    generateItemSelection()

    let previewCellsDims = parseInt(gridSizeDOM.value) > 25 ? 25 : parseInt(gridSizeDOM.value)
    // populate previewCells
    for (let y = 0; y < previewCellsDims; y++) {
        for (let x = 0; x < previewCellsDims; x++) {
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


        //i dun like this
    // hook event listeners to checkboxes
    // itemSelectionCheckboxes.forEach(function (checkbox) {
    //     checkbox.addEventListener('change', e => {
    //         if(e.target.checked){
    //             // colorIdsToExclude.push(parseInt(e.getAttribute("guid")))
    //             removeColorFromExclusion(parseInt(e.getAttribute("guid")))
    //         } else {
    //             addToColorExclusion(parseInt(e.getAttribute("guid")))
    //         }
    //     })
    // })
}

document.addEventListener("DOMContentLoaded", function(){
     Initialize()
})

imageUpload.addEventListener("change", function () {
    console.log("Image input change event triggered, opening fs")
    const reader = new FileReader()

    reader.addEventListener("load", () => {
        resetPreviews()
        const uploaded_image = reader.result

        imgDom.src = `${uploaded_image}`
        
        console.log("Uploaded W: " + imgDom.naturalWidth + ", H: " + imgDom.naturalHeight)
    })

    reader.readAsDataURL(this.files[0])
})
// #endregion

// #region Core Functions
function processImage() {
    if (imgDom.naturalWidth > maxDims || imgDom.naturalHeight > maxDims) {  
        console.error("Image too large / not supported!")
        window.alert("Image too large / not supported!")
        return
    }
    console.log("Processing currently uploaded image")

    let previewCellsDims = parseInt(gridSizeDOM.value) > 25 ? 25 : parseInt(gridSizeDOM.value)
    // get the uploaded image from the dom and draw it on a hidden canvas, this is how we get pixel data
    uploadedImage.crossOrigin = "Anonymous" // CORS
    const hiddenCanvas = document.createElement('canvas')
    hiddenCanvas.width = maxDims
    hiddenCanvas.height = maxDims
    const ictx = hiddenCanvas.getContext('2d')
    ictx.drawImage(uploadedImage, 0, 0)
    let loadedImageCanvasData = ictx.getImageData(0, 0, uploadedImage.naturalWidth, uploadedImage.naturalHeight);
    console.log("Loaded Image data: ")
    console.log(loadedImageCanvasData)

    let width = loadedImageCanvasData.width
    let height = loadedImageCanvasData.height

    let outputCanvas = document.getElementById("output-canvas")
    let octx = outputCanvas.getContext("2d")
    
    // fit width for pixel scale
    let pixelSize = 1 + Math.trunc(2000 / width)
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
    for (let i = 0; i < loadedImageCanvasData.data.length; i += 4) {
        rgbArray.push([loadedImageCanvasData.data[i], loadedImageCanvasData.data[i + 1], loadedImageCanvasData.data[i + 2]])
    }
    console.log("rgbArray")
    console.log(rgbArray)
    
    // convert to 2d array
    let pixel2dArray = convertToMatrix(rgbArray, width)
    // while(rgbArray.length) pixel2dArray.push(rgbArray.splice(0, width))
    console.log("pixel2dArray")
    console.log(pixel2dArray)
    //===== array remap finsih

    // Color/Item selection 
    //=====================
    //TODO i dont have time to figure out a solution so doing it this way
    // items to remove from db by collecting all guid (in reality they are indexes) to remove
    // this is done by iterating over the checkboxes of the item selection (which should have a guid attribute) and create an array from it
    // rearrange this array to remove to ascending
    // then use that arranged idexes to start splicing a copy of the colordb
    let colorIdsToExclude = []
    //NOTE I had another idea where instead of looping, you add and remove colors from the exckdue array, but this is fine
    const itemSelectionCheckboxes = document.querySelectorAll("input[type=checkbox][name=item-selection]")
    itemSelectionCheckboxes.forEach(element => {
        if (!element.checked) {
            let guid = parseInt(element.getAttribute("guid"))
            console.log("removing guid : " + guid)
            colorIdsToExclude.push(guid)
        }
    })
    // TODO figure out why its not updating this again after claling this function after the first time
    colorIdsToExclude.sort()
    let colorDBCache = getExcludedColorDB(colorDB, colorIdsToExclude) // pass colordb to to remove selected items

    //========FINAL LOOP======///
    // iterate over 2d matrix and print each pixel after mapping
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
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
    if (showGridLinesDOM.checked) {
        octx.lineWidth = parseInt(gridThicknessInput.value)
        octx.strokeStyle = "black"

        for (let x = 0; x < canvasPixelWidth; x += pixelSize * previewCellsDims) {
            octx.moveTo(offset + x, 0)
            octx.lineTo(offset + x, canvasPixelHeight)
        }   
    
        for (let x = 0; x < canvasPixelHeight; x += pixelSize * previewCellsDims) {
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
    let chunkX = parseInt(chunkInputX.value) - 1
    let chunkY = parseInt(chunkInputY.value) - 1
    let previewCellsDims = parseInt(gridSizeDOM.value) > 25 ? 25 : parseInt(gridSizeDOM.value)
    for (let y = 0, gy = chunkY * previewCellsDims; y < previewCellsDims; y++, gy++) {
        for (let x = 0, gx = chunkX * previewCellsDims; x < previewCellsDims; x++, gx++) {
            if (gy <= cachedData.length -1 && gx <= cachedData[y].length -1) {
                let selection = cachedData[gy][gx]
                previewCells[y][x].style.backgroundColor = "rgba(" + trimBrackets(selection['RGB']) + ", 255)"
                previewCells[y][x].src = selection['imageSource']
            } else {
                previewCells[y][x].style.backgroundColor = "transparent"
                previewCells[y][x].src = "images/misc/empty.png"
            }
        }
    }
}


function generateItemSelection () {
    // In case active db is dirtied, use cache to make sure all items are made
    colorDB.forEach(element => {
        let container = document.createElement("div")
        container.setAttribute("class", "item-selection")
        let checkBox = document.createElement("input")
        let label = document.createElement("label")
        checkBox.type = "checkbox"
        checkBox.checked = true
        checkBox.setAttribute("name", "item-selection")
        checkBox.setAttribute("guid", element["GUID"])

        let image = document.createElement("img")
        image.src = element["imageSource"]
        image.style.backgroundColor = "rgba(" + trimBrackets(element['RGB']) + ", 255)"

        //TODO add splice function from chechbox by using event delegation

        container.appendChild(image)
        container.appendChild(checkBox)
        container.appendChild(label)
        itemSelectionsDOM.appendChild(container)

        label.appendChild(document.createTextNode(element["Name"]))
    })
}

function addToColorExclusion(guid) {
    if (colorIdsToExclude.indexOf(guid) < -1){
        colorIdsToExclude.push(guid)
        console.log("adding from exlcusion: " + guid)
    }
}

function removeColorFromExclusion (guid) {
    if (colorIdsToExclude.indexOf(guid) > -1){
        colorIdsToExclude.splice(guid, -1)
        console.log("removing from exlcusion: " + guid)
    }
}

function getExcludedColorDB(db, exclusions) {
    let result = db
    let counter = 0
    exclusions.forEach(element => {
        result.splice(element + counter, 1)
        counter--
    })
    console.log("spliced result")
    console.log(result)
    return result
}




///====  togglers

function toggleImages() {
    if (showImageInputs){
        imageInputsDOM.setAttribute("style", "display:none !important")
    } else {
        imageInputsDOM.setAttribute("style", "")
    }
    showImageInputs = !showImageInputs
}

function toggleColorSelection(){
    if (showSelections){
        itemSelectionsDOM.setAttribute("style", "display:none !important")
    } else {
        itemSelectionsDOM.setAttribute("style", "")
    }
    showSelections = !showSelections
}

function toggleCounterSelection() {
    if (showCounters){
        itemCountersDOM.setAttribute("style", "display:none !important")
    } else {
        itemCountersDOM.setAttribute("style", "")
    }
    showCounters = !showCounters
}

// TODO
function resetPreviews() {
    // if (!previewCells === undefined || !previewCells.length == 0) {
    //     console.log("Resetting previews")
    //     previewCells.forEach(element => {
    //         element.src = "images/misc/empty.png"
    //         element.style.backgroundColor = "transparent"
    //     })
    // }
}
// #endregion
