if (typeof QUnit == 'undefined') // if your tests also run in the browser...
    QUnit = require('qunit-cli');
stats = require('../statistics.js');

function generateDummyData(dimension, negativeControls, positiveControls) {
    var data = [];
    for (var i=0; i<dimension; i++) {
        data[i] = [];
        for (var j=0; j<dimension; j++) {
            data[i][j] = Math.random() * 100;
        }
    }

    // make sure negative controls are 0, positive are 100
    for (var i=0; i<negativeControls.length; i++) {
        coords = negativeControls[i];
        data[coords[0]][coords[1]] = 0;
    }
    for (var i=0; i<positiveControls.length; i++) {
        coords = positiveControls[i];
        data[coords[0]][coords[1]] = 100;
    }

    return data;
}


QUnit.test('normalize test', function(assert) {
    var negativeControls = [[0,0], [0,1]];
    var positiveControls = [[1,0], [1,1]];
    var data = generateDummyData(5, negativeControls, positiveControls);
    var normalized = stats.normalize(data, negativeControls, positiveControls);

    for (var i=0; i<negativeControls.length; i++) {
        coords = negativeControls[i];
        assert.equal(normalized[coords[0]][coords[1]], 0,
                     'Negative control at ' + coords + ' is 0');
    }
    for (var i=0; i<positiveControls.length; i++) {
        coords = positiveControls[i];
        assert.equal(normalized[coords[0]][coords[1]], 1,
                     'Positive control at ' + coords + ' is 1');
    }
    for (var i=0; i<normalized.length; i++) {
        assert.ok(normalized[i].every(function (a) { return 0 <= a <= 1; }),
                  'Row ' + i + ' falls within 0 and 1');
    }
});
