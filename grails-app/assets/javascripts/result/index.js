var data;
var experimentResult;
var grid;


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
    reloadGrid();
}

function getLabel(plate) {
    // TODO - this is fragile as hell
    return Object.keys(plate.rows[0].columns[0].rawData).sort()[0];
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

function reloadGrid() {
    grid.setData(data);
    grid.fillUpGrid();
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

	var barcode = (plates.length > 0) ? plates[0].barcode : "";
	updateResults(barcode);
    });
}

function updateResults(barcode) {
    var plate = {}
    if (experimentResult) {
        plate = $.grep(experimentResult.plates, function(plate) {
	    return plate.barcode === barcode;
	})[0];
        data = plateToArray(plate);
    }
    else {
        data = [];
    }
    reloadGrid();
    $('#dump').text(JSON.stringify(plate, null, 4));
}


function init() {
    createGrid();
    var experimentId = $('#experimentSelect option:selected')[0].value;
    updatePlateList(experimentId);
}
window.onload = init;
