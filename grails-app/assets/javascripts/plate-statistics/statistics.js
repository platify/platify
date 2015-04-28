if (typeof d3 === 'undefined') {
    var d3 = require('d3');
}

/*
 * Given an importData structure, a plate number, a label category,
 * and the coordinates of the negative and positive controls, this
 * will normalize the values for that label against the controls,
 * returning the results as a 2d array.
 */
var normalize = function(plate, label,
                          negativeControls, positiveControls) {
    var getRawValue = function(coords) {
        var well = plate.rows[coords[0]].columns[coords[1]];
        return (well.rawData) ? well.rawData[label] : null;
    }

    var negativeMean = d3.mean(negativeControls.map(getRawValue));
    var positiveMean = d3.mean(positiveControls.map(getRawValue));
    var scale = d3.scale.linear().domain([negativeMean, positiveMean])
        .range([0, 1]);

    var normalized = [];
    for (var i=0; i<plate.rows.length; i++) {
        normalized[i] = [];
        for (var j=0; j<plate.rows[i].columns.length; j++) {
            normalized[i][j] = scale(getRawValue([i,j]));
        }
    }

    return normalized;
}

/*
 * Calculates the Z' factor for a plate, according to the formula at
 *   https://support.collaborativedrug.com/entries/21220276-Plate-Quality-Control
 */
var zPrimeFactor = function(plate, label,
                            negativeControls, positiveControls) {
    var getRawValue = function(coords) {
        var well = plate.rows[coords[0]].columns[coords[1]];
        return (well.rawData) ? well.rawData[label] : null;
    }

    var positiveStdDev = d3.deviation(positiveControls.map(getRawValue));
    var positiveMean = d3.mean(positiveControls.map(getRawValue));
    var negativeStdDev = d3.deviation(negativeControls.map(getRawValue));
    var negativeMean = d3.mean(negativeControls.map(getRawValue));

    return 1 - (3 * (positiveStdDev + negativeStdDev)
            / Math.abs(positiveMean - negativeMean));
}

/*
 * Calculates the Z factor for a plate, according to the formula at
 *   https://support.collaborativedrug.com/entries/21220276-Plate-Quality-Control
 */
var zFactor = function(plate, label,
                       negativeControls, positiveControls) {
    var getRawValue = function(coords) {
        var well = plate.rows[coords[0]].columns[coords[1]];
        return (well.rawData) ? well.rawData[label] : null;
    }

    var positiveStdDev = d3.deviation(positiveControls.map(getRawValue));
    var positiveMean = d3.mean(positiveControls.map(getRawValue));

    // there *has* to be a cleaner way than this
    var controls = d3.set(d3.merge([negativeControls, positiveControls]));
    var nonControlValues = [];
    for (var i=0; i<plate.rows.length; i++) {
        for (var j=0; j<plate.rows[i].columns.length; j++) {
            if (!controls.has([i,j])) {
                nonControlValues.push(getRawValue([i,j]));
            }
        }
    }
    var wellsStdDev = d3.deviation(nonControlValues);
    var wellsMean = d3.mean(nonControlValues);

    return 1 - (3 * (positiveStdDev + wellsStdDev)
            / Math.abs(positiveMean - wellsMean));
}

/*
 * Calculates the Z scores for a plate, according to the formula at
 *   https://support.collaborativedrug.com/entries/21220276-Plate-Quality-Control
 *
 * TODO - implement variant where no controls are available.
 */
var zScore = function(plate, label,
                      negativeControls, positiveControls) {
    var getRawValue = function(coords) {
        var well = plate.rows[coords[0]].columns[coords[1]];
        return (well.rawData) ? well.rawData[label] : null;
    }

    var negativeStdDev = d3.deviation(negativeControls.map(getRawValue));
    var negativeMean = d3.mean(negativeControls.map(getRawValue));
    var controls = d3.set(d3.merge([negativeControls, positiveControls]));

    var zScores = [];
    for (var i=0; i<plate.rows.length; i++) {
        zScores[i] = [];
        for (var j=0; j<plate.rows[i].columns.length; j++) {
            if (controls.has([i,j])) {
                zScores[i][j] = null;
            } else {
                zScores[i][j] = (getRawValue([i,j]) - negativeMean)
                                / negativeStdDev;
            }
        }
    }

    return zScores;
}

if (typeof module !== 'undefined') {
    module.exports = {
        normalize: normalize,
        zPrimeFactor: zPrimeFactor,
        zFactor: zFactor,
        zScore: zScore,
    }
}
