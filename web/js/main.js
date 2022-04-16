
console.log('hello')

colorDict = {
    'dirt ground' : (127, 95, 50),
    'turf ground' : (86, 128, 99),
    'sand ground' : (212, 185, 90),
    'clay ground' : (232, 139, 105),
    'stone ground' : (104, 131, 151),
    'larva ground' : (199, 117, 99),
    'grass ground' : (61, 155, 64),
    'mold ground' : (108, 188, 224),
    'wood bridge' : (140, 88, 38),
    'wood floor' : (199, 148, 79),
    'paintable floor (unpainted)' : (159, 180, 236),
    'stone bridge' : (124, 117, 108),
    'stone floor' : (129, 132, 140),
    'scarlet bridge' : (168, 28, 46),
    'scarlet floor' : (178, 53, 38),
    'caveling floor tile' : (130, 130, 130),
    'dark caveling floor tile' : (130, 130, 130),
    'woven mat' : (59, 139, 64),
    'blue paint' : (42, 108, 228),
    'green paint' : (85, 182, 38),
    'yellow paint' : (255, 232, 46),
    'white paint' : (129, 173, 224),
    'purple paint' : (139, 79, 167),
    'red paint' : (223, 0, 0),
    'brown paint' : (151, 75, 38),
    'black paint' : (75, 85, 85),
}

function test() {
    console.log('calling test function')

    console.log('reading pixel data of canvas')

    let canvas = document.getElementById("hd-canvas")
    let ctx = canvas.getContext("2d")
    
    // ctx.setAttribute('crossOrigin', '')

    let imgData = ctx.getImageData(0,0,100,100)
    let dataArray = imgData.data
    let rgbArray = []
    for (var i = 0; i < dataArray.length; i+=4) {
        rgbArray.push([dataArray[i], dataArray[i+1], dataArray[i+2]])
    }

    //NOTE can merge with step above for optimization
    
    //map rgb data to new dict
    rgbArray.forEach(element => {
        
    });

    console.log(rgbArray)
    // convert linear array to 2d 
    let width = imgData.width
    let height = imgData.height

    let pixel2dArray = []
    while(rgbArray.length) pixel2dArray.push(rgbArray.splice(0, width))
    


    console.log("matrix")
    console.log(pixel2dArray)
}

function renderHDGrid() {
    let canvas = document.getElementById("hd-canvas")
    let ctx = canvas.getContext("2d")

    //
    image = document.getElementById("prev")
    image.crossOrigin = "Anonymous";

    ctx.drawImage(
        image, 0, 0
    )

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

function clearContent(tag, type = id){
    document.getElementById(tag).innerHTML = ""
}

// draw canvas - CamanJS?
// get pixel data from canvas - CanvasRenderingContext2D.getImageData()
// apply data mapping - for now all front end with naive euclidean dist on rgb
// iterate over new pixel data and render table dom 



// linear eunclidean space, RGB, but extend to be any colorspace value?
function getClosestValue ([r2,g2,b2], map){
    const [[closest_color_id]] = (
        map
        .map(([id, r1,g1,b1]) => (
          [id, (r2-r1)**2 + (g2-g1)**2 + (b2-b1)**2]
        //   [id, Math.sqrt((r2-r1)**2 + (g2-g1)**2 + (b2-b1)**2)]
        ))
        .sort(([, d1], [, d2]) => d1 - d2)
      );
      return map.find(([id]) => id == closest_color_id);
}

//TODO delta E interpretation

// TODO db/python color mapping/interpretation?