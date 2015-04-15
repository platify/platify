var experimentResult;

function updatePlateList(experimentId) {
    // TODO - don't hardcode this
    var url = 'http://localhost:8080/capstone/result/readExperiment/' + experimentId;
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
    }
    $('#dump').text(JSON.stringify(plate, null, 4));
}

function init() {
    var experimentId = $('#experimentSelect option:selected')[0].value;
    updatePlateList(experimentId);
}
window.onload = init;
