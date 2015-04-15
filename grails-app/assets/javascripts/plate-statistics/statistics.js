var d3 = require('d3');

/*
 * Given an importData structure, a plate number, a label category,
 * and the coordinates of the negative and positive controls, this
 * will normalize the values for that label against the controls,
 * returning the results as a 2d array.
 */
exports.normalize = function (plate, label,
                              negativeControls, positiveControls) {
    var negativeMean = d3.mean(negativeControls.map(function (a) {
        return plate.rows[a[0]].columns[a[1]].rawData[label];
    }));
    var positiveMean = d3.mean(positiveControls.map(function (a) {
        return plate.rows[a[0]].columns[a[1]].rawData[label];
    }));
    var scale = d3.scale.linear().domain([negativeMean, positiveMean])
	    	    .range([0, 1]);

    var normalized = [];
    for (var i=0; i<plate.rows.length; i++) {
        normalized[i] = []
	for (var j=0; j<plate.rows[i].columns.length; j++) {
            var raw_value = plate.rows[i].columns[j].rawData[label];
            normalized[i][j] = scale(raw_value);
        }
    }

    return normalized;
}

/*
 * Calculates the Z' factor for a plate, according to the formula at
 *   https://support.collaborativedrug.com/entries/21220276-Plate-Quality-Control
 */
exports.zPrimeFactor = function (plate, label,
			         negativeControls, positiveControls) {
    var positiveStdDev = d3.deviation(positiveControls.map(function (a) {
        return plate.rows[a[0]].columns[a[1]].rawData[label];
    }));
    var positiveMean = d3.mean(positiveControls.map(function (a) {
        return plate.rows[a[0]].columns[a[1]].rawData[label];
    }));

    var negativeStdDev = d3.deviation(negativeControls.map(function (a) {
        return plate.rows[a[0]].columns[a[1]].rawData[label];
    }));
    var negativeMean = d3.mean(negativeControls.map(function (a) {
        return plate.rows[a[0]].columns[a[1]].rawData[label];
    }));

    return 1 - (3 * (positiveStdDev + negativeStdDev)
                / Math.abs(positiveMean - negativeMean));
}

/*
 * Calculates the Z factor for a plate, according to the formula at
 *   https://support.collaborativedrug.com/entries/21220276-Plate-Quality-Control
 */
exports.zFactor = function (plate, label,
			    negativeControls, positiveControls) {
    var positiveStdDev = d3.deviation(positiveControls.map(function (a) {
        return plate.rows[a[0]].columns[a[1]].rawData[label];
    }));
    var positiveMean = d3.mean(positiveControls.map(function (a) {
        return plate.rows[a[0]].columns[a[1]].rawData[label];
    }));

    // there *has* to be a cleaner way than this
    var controls = d3.set(d3.merge([negativeControls, positiveControls]))
    var nonControlValues = [];
    for (var i=0; i<plate.rows.length; i++) {
        for (var j=0; j<plate.rows[i].columns.length; j++) {
            if (!controls.has([i,j])) {
                nonControlValues.push(plate.rows[i].columns[j].rawData[label]);
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
exports.zScore = function (plate, label,
		           negativeControls, positiveControls) {
    var negativeStdDev = d3.deviation(negativeControls.map(function (a) {
        return plate.rows[a[0]].columns[a[1]].rawData[label];
    }));
    var negativeMean = d3.mean(negativeControls.map(function (a) {
        return plate.rows[a[0]].columns[a[1]].rawData[label];
    }));

    var controls = d3.set(d3.merge([negativeControls, positiveControls]))
    var zScores = [];
    for (var i=0; i<plate.rows.length; i++) {
        zScores[i] = [];
        for (var j=0; j<plate.rows[i].columns.length; j++) {
            if (controls.has([i,j])) {
                zScores[i][j] = null;
            } else {
                zScores[i][j] = 
                    (plate.rows[i].columns[j].rawData[label] - negativeMean)
                    / negativeStdDev;
            }
        }
    }

    return zScores;
}
