var experiment;
var grid;
var scatter;
var plateTable;
var scatterPlot;
var plateTableTools;
var showHeatMap = true;
var showNormalized = false;


function cellFormatter(row, cell, value, columnDef, dataContext) {
    var finalValue = value;
    var well = experiment.currentPlate.rows[row].columns[cell-1];

    switch (well.control) {
        case 'NEGATIVE':
        case 'POSITIVE':
            finalValue += ',' + well.control.toLowerCase();
            break;
    }

    return Grid.editorCellFormatter(row, cell, finalValue, columnDef, dataContext);
}

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
    flattened = $.map(flattened, Number);
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
 * Format the experiment data as a csv and trigger a download of it in the
 * browser.
 */
function downloadExperiment(fileformat) {
    // TODO - HACK - the ImportData library expected a parsingID, but never
    //               uses it.  supply a dummy one for now.
    experiment.experiment.parsingID = -1;
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

        case 'json':
            generator.forceJSONDownload(filename);
            break;

        case 'csv':
        default:
            generator.forceCSVDownload(filename);
            break;
    }
}


function init() {
    // init the experiment object
    experiment = new ExperimentModel();
    experiment.fromJson(IMPORT_DATA_JSON);

    // set up plate table
    plateTable = $('#plateTable').DataTable({
        bootstrap: true,
        dom: 'T<"clear">lfrtip',
        info: false,
        paging: false,
        scrollY: '150px',
        searching: false,
        columnDefs: [{
            targets: 3,
            render: function (data, type, full, meta) {
                // color the z'-factor per good/maybe/bad bucketing defined on
                // https://support.collaborativedrug.com/entries/21220276-Plate-Quality-Control
                var bucket;
                if ((data < 0) || (data > 1)) {
                    bucket = 'unacceptable';
                }
                else if (data <= 0.5) {
                    bucket = 'acceptable';
                }
                else if (data <= 1) {
                    bucket = 'excellent';
                }
                return '<span class="results-z-prime-' + bucket
                       + '">' + data + '</span>';
            },
        }],
        tableTools: {
            aButtons: [],
            sRowSelect: 'single',
            fnRowSelected: function (nodes) {
                var row = plateTableTools.fnGetSelectedData()[0];
                var plateIndex = row[row.length-1];
                plateSelected(plateIndex);
            },
        },
    });
    plateTableTools = TableTools.fnGetInstance('plateTable');

    // set up grid
    grid  = new Grid("resultGrid");

    //Set up scatterplot
    scatter = new Scatter();
    scatter.setData(experiment.data);

    // Set up histogram
    histogram = new Histogram(IMPORT_DATA_JSON, experiment);
    histogram.initiateVis();

    // process experiment object
    if (Object.keys(experiment.experiment.plates).length > 0) {
        var plateData = Object.keys(experiment.experiment.plates).map(function(plateIndex) {
            var row = [
                       experiment.experiment.plates[plateIndex].plateID,
                       experiment.experiment.plates[plateIndex].resultCreated,
                       experiment.zFactor(plateIndex),
                       experiment.zPrimeFactor(plateIndex),
                       experiment.meanNegativeControl(plateIndex),
                       experiment.meanPositiveControl(plateIndex),
                       plateIndex];
            return row;
        });
        plateTable.clear().rows.add(plateData).draw();
        plateTableTools.fnSelect(plateTable.row(0).nodes()); // triggers plateSelect()
    }
    else {
        loadGrid(createBlankData(experiment.numRows,
                                 experiment.numColumns),
                 false);
        plateTable.clear().draw();
    }

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

    // add histogram button listener
    $('#histogramButton').on('click', function(event) {
            histogram.updateGraph();
        });
    
    var resultUI = new ResultUI();
}


function loadGrid(dataSet) {
    grid.setData(dataSet);
    grid.fillUpGrid(null, null, true, cellFormatter, 'result-cell');
    if (showHeatMap) {
        colorGrid(dataSet);
    }
}


function plateSelected(plateIndex) {
    experiment.selectPlate(plateIndex);
    loadGrid(showNormalized ? experiment.normalizedData : experiment.data);
    $('#rawDataLabel')[0].textContent = experiment.rawDataLabel();
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
