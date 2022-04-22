// linear euclidean distance comparison. Takes in three values
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
