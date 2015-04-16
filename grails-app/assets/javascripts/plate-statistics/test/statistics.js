if (typeof QUnit === 'undefined') {
    var QUnit = require('qunit-cli');
}
if (typeof d3 === 'undefined') {
    var d3 = require('d3');
}
var stats = require('../statistics.js');


/**
 * helper method that turns a 2d array into an importData plate format
 */
var arrayToPlate = function (rawData, label) {
    var plate = {'rows': []};
    for (var r=0; r<rawData.length; r++) {
        plate.rows[r] = {'columns': []};
        for (var c=0; c<rawData[r].length; c++) {
            // NOTE: ugly two-line initializer thanks to javascript not
            //       accepting variables as keys in object literals.
            plate.rows[r].columns[c] = {'rawData': {}};
            plate.rows[r].columns[c].rawData[label] = rawData[r][c];
        }
    }
    return plate;
};


/**
 * helper for normalize/zScore, checks the shape of the returned data
 */
var assertShape = function(plate, result, assert) {
    assert.equal(plate.rows.length, result.length,
		 'Results have an incorrect number of rows');
    for (var i=0; i<result.length; i++) {
	assert.equal(result[i].length, plate.rows[i].columns.length,
		     'Results have in incorrect number of cells in row ' + i);
    }
};


/**
 * Helper for normalize, verifies that control wells are mapped to 0 and 1.
 */
var assertNormalizedControls = function (plate, normalized,
                                         negativeControls, positiveControls,
                                         assert) {
    // check controls
    for (var i=0; i<negativeControls.length; i++) {
        var coords = negativeControls[i];
        assert.equal(normalized[coords[0]][coords[1]], 0,
                     'Negative control at ' + coords + ' is not 0');
    }
    for (var i=0; i<positiveControls.length; i++) {
        var coords = positiveControls[i];
        assert.equal(normalized[coords[0]][coords[1]], 1,
                     'Positive control at ' + coords + ' is not 1');
    }
};


QUnit.module('normalize', {
    'beforeEach': function () {
        this.label = 'value';
        this.negativeControls = [[0,0], [0,1]];
        this.positiveControls = [[1,0], [1,1]];
    },
    'afterEach': function () {
        assertShape(this.plate, this.normalized, this.assert);
        assertNormalizedControls(this.plate, this.normalized,
                                 this.negativeControls, this.positiveControls,
                                 this.assert);
    }
});
QUnit.test('All values between controls', function (assert) {
    this.assert = assert;
    var rawData = [[0, 0, 50],
                   [100, 100, 90],
                   [12, 34, 56]];
    this.plate = arrayToPlate(rawData, this.label);
    this.normalized = stats.normalize(this.plate, this.label,
                                      this.negativeControls,
                                      this.positiveControls);
    // verify range
    this.assert.ok(d3.merge(this.normalized).every(
                       function (n) { return (0 <= n) && (n <= 1); }),
                   'Normalized values fall outside range of 0,1');
});
QUnit.test('Some values outside controls', function (assert) {
    this.assert = assert;
    var rawData = [[0, 0, 50],
                   [100, 100, 90],
                   [112, -34, 56]];
    this.plate = arrayToPlate(rawData, this.label);
    this.normalized = stats.normalize(this.plate, this.label,
                                      this.negativeControls,
                                      this.positiveControls);
    // verify range
    this.assert.ok(!d3.merge(this.normalized).every(
                       function (n) { return (0 <= n) && (n <= 1) }),
                   'No normalized values fall outside range of 0,1');
});


QUnit.module("Z' factor");
QUnit.test('No deviation', function (assert) {
    var label = 'value';
    var negativeControls = [[0,0], [0,1]];
    var positiveControls = [[1,0], [1,1]];
    var rawData = [[0, 0],
                   [100, 100],
                   [50, 50]];
    var plate = arrayToPlate(rawData, label);
    var zPrime = stats.zPrimeFactor(plate, label,
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
    var plate = arrayToPlate(rawData, label);
    var z = stats.zFactor(plate, label,
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
    var plate = arrayToPlate(rawData, label);
    var zScores = stats.zScore(plate, label,
                               negativeControls, positiveControls);
    assert.deepEqual(zScores, [[null, null], [null, null], [Infinity, Infinity]]);
});
