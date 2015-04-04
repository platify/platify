if (typeof QUnit == 'undefined') // if your tests also run in the browser...
QUnit = require('qunit-cli');
stats = require('../statistics.js');

function generateDummyData(dimension, label, negativeControls, positiveControls) {
    var plate = {'rows': []};
    for (var i=0; i<dimension; i++) {
        plate.rows[i] = {'columns': []};
        for (var j=0; j<dimension; j++) {
            plate.rows[i].columns[j] = {
                'labels': {label: Math.random() * 100},
            };
        }
    }

    // make sure negative controls are 0, positive are 100
    for (var i=0; i<negativeControls.length; i++) {
        var coords = negativeControls[i];
        plate.rows[coords[0]].columns[coords[1]].labels[label] = 0;
    }
    for (var i=0; i<positiveControls.length; i++) {
        var coords = positiveControls[i];
        plate.rows[coords[0]].columns[coords[1]].labels[label] = 100;
    }

    return {'plates': [plate]};
}


QUnit.test('normalize test', function (assert) {
    var dimension = 5;
    var label = 'value';
    var negativeControls = [[0,0], [0,1]];
    var positiveControls = [[1,0], [1,1]];
    var importData = generateDummyData(dimension, label,
		                       negativeControls, positiveControls);
    var normalized = stats.normalize(importData, 0, label,
                                     negativeControls, positiveControls);

    // check controls
    for (var i=0; i<negativeControls.length; i++) {
        var coords = negativeControls[i];
        assert.equal(normalized[coords[0]][coords[1]], 0,
                     'Negative control at ' + coords + ' is 0');
    }
    for (var i=0; i<positiveControls.length; i++) {
        var coords = positiveControls[i];
        assert.equal(normalized[coords[0]][coords[1]], 1,
                     'Positive control at ' + coords + ' is 1');
    }

    // check shape and range
    assert.equal(dimension, normalized.length,
		 'Normalized data has the correct number of rows, ' + dimension);
    for (var i=0; i<normalized.length; i++) {
	assert.equal(normalized[i].length, dimension,
		     'Normalized data has the correct number of cells, '
		     + dimension + ' in row ' + i);
        assert.ok(normalized[i].every(function (a) { return 0 <= a <= 1; }),
                  'Row ' + i + ' falls within 0 and 1');
    }
});


QUnit.test("Z' test", function (assert) {
    var dimension = 5;
    var label = 'value';
    var negativeControls = [[0,0], [0,1]];
    var positiveControls = [[1,0], [1,1]];
    var importData = generateDummyData(dimension, label,
		                       negativeControls, positiveControls);
    var zPrime = stats.zprime(importData, 0, label,
                              negativeControls, positiveControls);
    assert.equal(zPrime, 1);
});
