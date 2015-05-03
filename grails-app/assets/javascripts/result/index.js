var experiment;
var grid;
var plateTable;
var plateTableTools;
var showHeatMap = true;
var showNormalized = false;


/**
 * Colors each cell in the grid.  The color is determined by the value
 * in the cell.
 */
function colorGrid(dataSet) {
    // short-circuit if there's no data
    if (dataSet.length === 0) {
        return;
    }

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


/**
 * Generate a set of blank data.
 */
function createBlankData(width, height) {
    var result = [];
    for (var x=0; x<width; x++) {
        result[x] = [];
        for (var y=0; y<height; y++) {
            result[x][y] = null;
        }
    }
    return result;
}


/**
 * Create a Grid object, and load in blank data.
 */
function createGrid() {
    grid  = new Grid("resultGrid");
    loadGrid(createBlankData(100,100), false);
}


/**
 * Format the experiment data as a csv and trigger a download of it in the
 * browser.
 */
function downloadExperiment(fileformat) {
    var importData = ImportData.createImportDataObjectFromJSON(experiment.experiment);
    var generator = new ImportDataFileGenerator();
    //generator.createIntergroupInterchangeFormatMatrix(importData);
    generator.createImportDataMatrix(importData);

    fileformat = fileformat || 'csv';
    var filename = 'assay_results.' + fileformat;
    switch (fileformat) {
        case 'tsv':
            generator.forceTSVDownload(filename);
            break;

        case 'csv':
        default:
            generator.forceCSVDownload(filename);
            break;
    }
}


/**
 * Read the data for the indicated experiment from the server, display
 * the plates on the page, and select the first one.
 */
function experimentSelected(experimentId) {
    experiment = new ExperimentModel(experimentId);
    experiment.getData().always(function () {
        if (Object.keys(experiment.plates).length > 0) {
            plateData = Object.keys(experiment.plates).map(function(plateID) {
                var row = [
                           plateID,
                           experiment.zFactor(plateID),
                           experiment.zPrimeFactor(plateID),
                           experiment.meanNegativeControl(plateID),
                           experiment.meanPositiveControl(plateID)];
                return row;
            });
            plateTable.clear().rows.add(plateData).draw();
            plateTableTools.fnSelect(plateTable.row(0).nodes());
        }
        else {
            loadGrid(createBlankData(experiment.numRows,
                                     experiment.numColumns),
                     false);
            plateTable.clear().draw();
        }
    });
}


function init() {
    // set up plate table
    plateTable = $('#plateTable').DataTable({
        bootstrap: true,
        dom: 'T<"clear">lfrtip',
        info: false,
        paging: false,
        scrollY: '150px',
        searching: false,
        tableTools: {
            aButtons: [],
            sRowSelect: 'single',
            fnRowSelected: function (nodes) {
                plateSelected(nodes[0].children[0].textContent);
            },
        },
    });
    plateTableTools = TableTools.fnGetInstance('plateTable');

    // set up grid
    createGrid();
    var experimentId = $('#experimentSelect option:selected')[0].value;
    experimentSelected(experimentId); // calls plateSelected for us

    // add download buttons listener
    $('#downloadButtons button').on('click', function(event) {
        downloadExperiment(event.target.dataset.fileformat);
    });

    // add normalize button listener
    $('#normalizeButton').on('click', function(event) {
        showNormalized = $(event.target)[0].checked;
        reloadGrid();
    });

    // add heatmap button listener
    $('#heatMapButton').on('click', function(event) {
        showHeatMap = $(event.target)[0].checked;
        reloadGrid();
    });
}


function loadGrid(dataSet) {
    grid.setData(dataSet);
    grid.fillUpGrid();
    if (showHeatMap) {
        colorGrid(dataSet);
    }
}


function plateSelected(plateID) {
    experiment.selectPlate(plateID);
    loadGrid(showNormalized ? experiment.normalizedData : experiment.data);
}


function reloadGrid() {
    if (showNormalized) {
        loadGrid(experiment.normalizedData);
    }
    else {
        loadGrid(experiment.data);
    }
}

window.onload = init;
