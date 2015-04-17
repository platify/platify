var data;
var normalizedData;
var experimentResult;
var grid;
var plate;
var label;
var controls; // [negative, positive]


function createBlankData(width, height) {
    var result = [];
    for (var i=0; i<width; i++) {
        result[i] = [];
        for (var j=0; j<height; j++) {
            result[i][j] = null;
        }
    }
    return result;
}

function createGrid() {
    grid  = new Grid("resultGrid");

    // set the data to be displayed which must be in 2D array form
    data = createBlankData(100, 100);
    normalizedData = createBlankData(100, 100);
    reloadGrid(data);
}

function getControls() {
    var negative = [];
    var positive = [];

    for (var i=0; i<plate.rows.length; i++) {
        for (var j=0; j<plate.rows[i].columns.length; j++) {
            switch (plate.rows[i].columns[j].control) {
                case 'NEGATIVE':
                    negative.push([i, j]);
                    break;
                case 'POSITIVE':
                    positive.push([i, j]);
                    break;
            }
        }
    }

    return [negative, positive];
}

function getLabel() {
    // TODO - this is fragile as hell
    return Object.keys(plate.rows[0].columns[0].rawData).sort()[0];
}

function getNormalizedData() {
    var normd = normalize(plate, label, controls[0], controls[1]);
    return $.map(normd, function(row) { return [$.map(row, function(val) { return val.toString(); })] });
}

function plateToArray(plate, label) {
    if (label === undefined) {
        label = getLabel(plate);
    }

    result = [];
    for (var i=0; i<plate.rows.length; i++) {
        result[i] = [];
        for (var j=0; j<plate.rows[i].columns.length; j++) {
            result[i][j] = plate.rows[i].columns[j].rawData[label];
        }
    }
    return result;
}

function reloadGrid(dataSet) {
    grid.setData(dataSet);
    grid.fillUpGrid();
}

function toggleRawOrNorm(input) {
    if (input.value === 'norm' && input) {
	reloadGrid(normalizedData);
    }
    else {
	reloadGrid(data);
    }
}

function updatePlateList(experimentId) {
    var url = READ_EXPERIMENT_URL + '/' + experimentId;
    $.getJSON(url, function(result) {
        var select = $('#plateSelect');
	select.children('option').remove();

	try {
	    experimentResult = result.ImportData;
	}
	catch (e) {
	    console.log('updatePlateList got unexpected ajax response ' + result);
	    experimentResult = null;
	}

	var plates = experimentResult ? experimentResult.plates : [];
	var options = $.map(plates, function(p) {
	    return $('<option />').text(p.barcode);
	});
	select.append(options);
	if (experimentResult) {
	    select[0].firstChild.selected = true;
        }
	var barcode = (plates.length > 0) ? plates[0].barcode : "";
	updateResults(barcode);
    });
}

function updateResults(barcode) {
    plate = {};
    controls = [];

    if (experimentResult) {
        plate = $.grep(experimentResult.plates, function(plate) {
	    return plate.barcode === barcode;
	})[0];
        label = getLabel();
        controls = getControls();
        data = plateToArray(plate);
	normalizedData = getNormalizedData();
        $('#zFactor').text(zFactor(plate, label, controls[0], controls[1]));
        $('#zPrimeFactor').text(zPrimeFactor(plate, label, controls[0], controls[1]));
    }
    else {
        data = [];
        $('#zFactor').text('');
        $('#zPrimeFactor').text('');
    }
    reloadGrid(data);
    $('#dump').text(JSON.stringify(plate, null, 4));
}


function init() {
    createGrid();
    var experimentId = $('#experimentSelect option:selected')[0].value;
    updatePlateList(experimentId);
}
window.onload = init;
