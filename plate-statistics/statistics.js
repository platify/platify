var d3 = require('d3');

exports.normalize = function (data, negativeControls, positiveControls) {
    var negativeMean = d3.mean(negativeControls.map(function (a) {
        return data[a[0]][a[1]];
    }));
    var positiveMean = d3.mean(positiveControls.map(function (a) {
	   return data[a[0]][a[1]];
    }));
    var scale = positiveMean - negativeMean;

    var normalized = [];
    for (var i=0; i<data.length; i++) {
        normalized[i] = []
	for (var j=0; j<data[i].length; j++) {
            normalized[i][j] = (data[i][j] - negativeMean) / scale;
        }
    }

    return normalized;
}
