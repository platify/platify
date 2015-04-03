if (typeof QUnit == 'undefined') // if your tests also run in the browser...
    QUnit = require('qunit-cli');
stats = require('../statistics.js');

function generateDummyData(dimension, negativeControls, positiveControls) {
    var plate = {'rows': []};
    for (var i=0; i<dimension; i++) {
        plate.rows.append([]);
        for (var j=0; j<dimension; j++) {
	    plate.rows[i].columns[j] = {
		'labels': [{'key': 'value', 'value': Math.random() * 100}],
	    };
     	}
    }

    // make sure negative controls are 0, positive are 100
    for (var i=0; i<negativeControls.length; i++) {
        coords = negativeControls[i];
	plate.rows[coords[0]].columns[coords[1]].labels['value'] = 0;
    }
    for (var i=0; i<positiveControls.length; i++) {
        coords = positiveControls[i];
	plate.rows[coords[0]].columns[coords[1]].labels['value'] = 100;
    }

    return {'plates': [plate]};
}


QUnit.test('normalize test', function(assert) {
    var negativeControls = [[0,0], [0,1]];
    var positiveControls = [[1,0], [1,1]];
    var importData = generateDummyData(5, negativeControls, positiveControls);
    var normalized = stats.normalize(importData, 0, 'value',
		    		     negativeControls, positiveControls);

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
