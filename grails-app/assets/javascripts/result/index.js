var experiment;
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


/**
 * Colors each cell in the grid.  The color is determined by the value
 * in the cell.
 */
function colorGrid(dataSet) {
    // first get a color quantizer
    var flattened = dataSet.reduce(function(a, b) {
        return a.concat(b);
    });
    var colorScale = d3.scale.linear().domain([d3.min(flattened),
                                               d3.max(flattened)]).rangeRound([0,8]);

    var valueStyles = {};
    for (var x=0; x<grid.rowsSize; x++) {
        valueStyles[x] = {};
        for (var y=1; y<=grid.colsSize; y++) {
            var value = grid.getDataPoint(x+1, y);
            valueStyles[x][y] = "q" + colorScale(value) + "-9";
        }
    }
    grid.grid.setCellCssStyles("valueStyles", valueStyles);
}


function createGrid() {
    grid  = new Grid("resultGrid");
    loadGrid(createBlankData(100,100));
}


function experimentSelected(experimentId) {
    experiment = new ExperimentModel(experimentId);
    experiment.getData().done(function () {
        var select = $('#plateSelect');
        select.children('option').remove();
        if (Object.keys(experiment.plates).length > 0) {
            var options = $.map(experiment.plates, function(p) {
                var option = $('<option />').text(p.plateID);
                if (p.plateID === experiment.currentPlateBarcode) {
                    option[0].selected = true;
                }
                return option;
            });
            select.append(options);
            plateSelected(experiment.currentPlateBarcode);
        }
        else {
            loadGrid([]);
        }
    });
}


function init() {
    // set up handlers
    $('#rawNormToggle').change(function() {
        toggleRawOrNorm($(this).prop('checked') ? 'raw' : 'norm');
    });

    // set up grid
    createGrid();
    var experimentId = $('#experimentSelect option:selected')[0].value;
    experimentSelected(experimentId); // calls plateSelected for us
}


function loadGrid(dataSet) {
    grid.setData(dataSet);
    grid.fillUpGrid();
    colorGrid(dataSet);
}


function plateSelected(plateID) {
    experiment.selectPlate(plateID);
    loadGrid(experiment.data);

    $('#rawNormToggle').bootstrapToggle('on');
    $('#zFactor').text(experiment.zFactor());
    $('#zPrimeFactor').text(experiment.zPrimeFactor());
}


function toggleRawOrNorm(value) {
    if (value === 'norm') {
        loadGrid(experiment.normalizedData);
    }
    else {
        loadGrid(experiment.data);
    }
}

window.onload = init;
