var d3 = require('d3');

exports.normalize = function (importData, plateNum, label,
                              negativeControls, positiveControls) {
    var plate = importData.plates[plateNum];
    var negativeMean = d3.mean(negativeControls.map(function (a) {
        var well = plate.rows[a[0]].columns[a[1]];
        return well.labels.filter(function (obj) { return obj.key === label })[0].value;
    }));
    var positiveMean = d3.mean(positiveControls.map(function (a) {
        var well = plate.rows[a[0]].columns[a[1]];
        return well.labels.filter(function (obj) { return obj.key === label })[0].value;
    }));
    var scale = d3.scale.linear().domain([negativeMean, positiveMean])
	    	    .range([0, 1]);

    var normalized = [];
    for (var i=0; i<plate.rows.length; i++) {
        normalized[i] = []
	for (var j=0; j<plate.rows[i].columns.length; j++) {
            var well = plate.rows[i].columns[j];
            var raw_value = well.labels.filter(function (obj) { return obj.key === label })[0].value;

            console.log('raw[%d,%d] = %d', i, j, raw_value);
            var norm = scale(raw_value);
            normalized[i][j] = scale(raw_value);
            console.log('norm[%d,%d] = %d', i, j, norm);
        }
    }

    return normalized;
}
