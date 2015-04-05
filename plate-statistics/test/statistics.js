if (typeof QUnit == 'undefined') // if your tests also run in the browser...
    QUnit = require('qunit-cli');
var stats = require('../statistics.js');
var d3 = require('d3');


var arrayToImportData = function (rawData, label) {
    var plate = {'rows': []};
    for (var r=0; r<rawData.length; r++) {
        plate.rows[r] = {'columns': []};
        for (var c=0; c<rawData[r].length; c++) {
            // NOTE: ugly two-line initializer thanks to javascript not
            //       accepting variables as keys in object literals.
            plate.rows[r].columns[c] = {'labels': {}};
            plate.rows[r].columns[c].labels[label] = rawData[r][c];
        }
    }
    return {'plates': [plate]};
};

var assertNormalizedControlsAndShape = function (importData,
                                                 normalized,
                                                 plateNum,
                                                 negativeControls,
                                                 positiveControls,
                                                 assert) {
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

    // check shape
    var plate = importData.plates[plateNum];
    assert.equal(plate.rows.length, normalized.length,
		 'Normalized data has the correct number of rows, '
                     + plate.rows.length);
    for (var i=0; i<normalized.length; i++) {
	assert.equal(normalized[i].length, plate.rows[i].columns.length,
		     'Normalized data has the correct number of cells, '
		         + plate.rows[i].columns.length + ' in row ' + i);
    }
};


QUnit.module('normalize');
QUnit.test('All normalized values between controls', function (assert) {
    var label = 'value';
    var negativeControls = [[0,0], [0,1]];
    var positiveControls = [[1,0], [1,1]];
    var rawData = [[0, 0, 50],
                   [100, 100, 90],
                   [12, 34, 56]];
    var importData = arrayToImportData(rawData, label);
    var normalized = stats.normalize(importData, 0, label,
                                     negativeControls, positiveControls);
    assertNormalizedControlsAndShape(importData, normalized, 0,
                                     negativeControls, positiveControls,
                                     assert);

    // verify range
    assert.ok(d3.merge(normalized).every(function (n) { return 1 <= n <= 1; }),
              'Normalized values fall outside range of 0,1');
});


QUnit.module("Z' factor");
QUnit.test('No deviation', function (assert) {
    var label = 'value';
    var negativeControls = [[0,0], [0,1]];
    var positiveControls = [[1,0], [1,1]];
    var rawData = [[0, 0],
                   [100, 100],
                   [50, 50]];
    var importData = arrayToImportData(rawData, label);
    var zPrime = stats.zPrimeFactor(importData, 0, label,
                                    negativeControls, positiveControls);
    assert.equal(zPrime, 1, "Z' factor not 1");
});


QUnit.module('Z factor');
QUnit.test('No deviation', function (assert) {
    var label = 'value';
    var negativeControls = [[0,0], [0,1]];
    var positiveControls = [[1,0], [1,1]];
    var rawData = [[0, 0],
                   [100, 100],
                   [50, 50]];
    var importData = arrayToImportData(rawData, label);
    var z = stats.zFactor(importData, 0, label,
                          negativeControls, positiveControls);
    assert.equal(z, 1, 'Z factor not 1');
});


QUnit.module('Z score');
QUnit.test('No deviation', function (assert) {
    var label = 'value';
    var negativeControls = [[0,0], [0,1]];
    var positiveControls = [[1,0], [1,1]];
    var rawData = [[0, 0],
                   [100, 100],
                   [50, 50]];
    var importData = arrayToImportData(rawData, label);
    var zScores = stats.zScore(importData, 0, label,
                               negativeControls, positiveControls);
    assert.deepEqual(zScores, [[null, null], [null, null], [Infinity, Infinity]]);
});
