

function updatePlateList(experimentId) {
    var select = $('#plateSelect')[0];
    // TODO - don't hardcode this
    var url = 'http://localhost:8080/capstone/experimentalPlateSet/barcodes/' + experimentId;
    $.getJSON(url, function(result) {
        $.each(result.barcodes, function() {
            console.log('adding option for experiment ' + experimentId + ' plate ' + this);
            $('<option />').text(this).appendTo(select);
        });
    });
}

function init() {
    var experimentId = $('#experimentSelect option:selected')[0].value;
    updatePlateList(experimentId);
}
window.onload = init;
