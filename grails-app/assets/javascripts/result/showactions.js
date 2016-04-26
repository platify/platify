var experiment;
var grid;
var scatter;
var histogram;
var plateTable;
var scatterPlot;
var stdCurve;
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
	//this.on($("body"), "done_drawing", this.markAllCurrentOutliers); 
//	$("body").on("done_drawing", this.markAllCurrentOutliers);
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
                slider.slider( "value", plateIndex );
            },
        },
    });
    plateTableTools = TableTools.fnGetInstance('plateTable');

    // set up grid
    grid  = new Grid("resultGrid");
    
    slider = $( "#slider" ).slider({
        min: 0,
        max: (experiment.experiment.plates.length - 1),
        range: false,
        value: 0,
        slide: function( event, ui ) {
        	plateTableTools.fnSelect(plateTable.row(ui.value).nodes());
            //plateSelected(ui.value);
        }
    });

    //Set up scatterplot
    scatter = new Scatter();
    scatter.setData(experiment.data);

    //Set up std curve
    stdCurve = new StdCurve();
    stdCurve.init(experiment);

    // Set up histogram
    histogram = new Histogram(experiment.experiment);
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
        markAllCurrentOutliers();
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
    
    
    $("g.bar_group").on('click', 'rect', function(event){
    	markOutlierHistogramClick(event);
    });

    // add scatterplot outlier listener
    $(".circle").on('click', function(event){console.log(event);
    	markOutlierScatterClick(event);
    });

    // Std curve circle click listener
    $(".stdCurveGraph").on('click', 'circle', function(event){
        markOutlierStdCurveClick(event);
    });

    var resultUI = new ResultUI();
}

function markOutlierStdCurveClick(event) {console.log(event);
    console.log($(event.target).data());
    var data = $(event.target["__data__"]);
    var row = data["row"];
    var col = data["column"];

    if (data["outlier"] ==- "true") {
        data['outlier'] = "false";console.log(row + " " + col);
        markOutlierStatus(row, col, false);
    } else {
        markOutlierStatus(row, col, true);
    }
}

function markOutlierHistogramClick(event) {
	//Get the indexes of the samples that this bar represents 
	//in the format "row1,col1;ro2,col2;..."
	var indexes = $(event.target).attr('indexes');
	indexes = indexes.split(';');
	for(var i = 0; i < indexes.length; i++) {
		var rowCol = indexes[i].split(',');
		var row = rowCol[0];
		var col = rowCol[1];
		if(experiment.experiment.plates[0].rows[row].columns[col].outlier == "false") {
			markOutlierStatus(row, col, true);
		} else {
			markOutlierStatus(row, col, false);
		}
		
	}
	//Update entire outlier histogram here
	histogram.update_data(experiment.experiment);
	histogram.updateGraphOutlier();
	
}

function markOutlierScatterClick(event) {
	var eventObj = $(event.target);
	var indexVar = $(event.target).attr('index');
	var row = scatter.dotIndexes[indexVar][0];
	var col = scatter.dotIndexes[indexVar][1];
	
    //toggleClass and hasClass aren't working here...
    //$(event.target).closest("circle").toggleClass("outlier");
	var s = $(event.target).attr('class');

    if(s.indexOf('outlier')!==-1) {
    	//Already has 'outlier' unset it
    	markOutlierStatus(row, col, false);
    } else {
    	markOutlierStatus(row, col, true);
    }
//    experiment.savePlate();
    console.log("col: "+col+" row: "+row);
}

function markOutlierGridClick(e, args) {
	var col = args.cell;
    var row = args.row;
    //Toggle the outlier class for styling

    var isOutlier;
    if($(e.target).closest(".slick-cell").hasClass("outlier")) {
    	//Keep this in sync with what the outliers are
        isOutlier = false;
    } else {
//    	markOutlierStatus(row, col, true);
        isOutlier = true;
    }
    markOutlierStatus(row, col-1, isOutlier);
    console.log("col: "+col+" row: "+row);

}



//Marks outliers in all visualizations
function markOutlierStatus(row, col, isOutlier) {
	var colNum = col;
	if(isOutlier) {
		experiment.experiment.plates[0].rows[row].columns[colNum].outlier = "true";
	} else {
		experiment.experiment.plates[0].rows[row].columns[colNum].outlier = "false";
	}
	var rowNum = parseInt(row)+1;
	var colNum = parseInt(col)+1;
	var scatterPoint = $('circle[row="'+row+'"][col="'+col+'"]');
	if(isOutlier) {
		scatterPoint.attr("class", "outlier circle");
	} else {
		scatterPoint.attr("class", "circle");
	}

	  //Mark "rowIdx", "colIdx" as an outlier in the grid
	  var targetRow = grid.grid.getDataItem(row);
	  var targetCol = grid.grid.getColumns()[col];
	  var classname = grid.grid.getCellNode(row, colNum).className;
	  classname = classname.replace(/ /g, ".");
	  //Get the rowIdx slickrow
	  var cell = $(".slick-row:nth-of-type("+rowNum+") ."+classname);
	  
	  var selectedEntity = $(".slick-row:nth-of-type("+rowNum+") ."+classname);
	  if(isOutlier) {
		  //Add the outlier class
		$(".slick-row:nth-of-type("+rowNum+") ."+classname).addClass("outlier");
	  } else {
		  //Remove the outlier class if it exists
		$(".slick-row:nth-of-type("+rowNum+") ."+classname).removeClass("outlier");
	  }
	  //Send the result back to the database
	  experiment.toggleOutlier(row, col, isOutlier, "WELL");
	
}


/**
 * Marks all current outliers in the grid. This is done in the scatterplot
 * while it is being generated. slickgrid is a little more complicated, so 
 * let's let it do its thing first, and then go through and modify it
 */
function markAllCurrentOutliers() {
    //Iterate through wells and mark all outliers as "outlier"
    //experiment.experiment.plates[0].rows[row].columns[col].outlier = "false"
    $.each(experiment.experiment.plates[0].rows, function( rowIdx, row ) {
    	$.each(row.columns, function( colIdx, column ) {
    		//Add 1 to compensate for the headers on table
		  var rowNum = rowIdx+1;
		  //Mark "rowIdx", "colIdx" as an outlier
		  if(grid.grid != null) {
			  var targetRow = grid.grid.getDataItem(rowIdx);
			  var targetCol = grid.grid.getColumns()[colIdx+1];
			  var classname = grid.grid.getCellNode(rowIdx, colIdx+1).className;
			  classname = classname.replace(/ /g, ".");
			  //Get the rowIdx slickrow
			  var cell = $(".slick-row:nth-of-type("+rowIdx+") ."+classname);
			  var selectedEntity = $(".slick-row:nth-of-type("+rowNum+") ."+classname);
	      	  if(column.outlier == "true") {
	      		  //Add the outlier class
	      		$(".slick-row:nth-of-type("+rowNum+") ."+classname).addClass("outlier");
	      	  } else {
	      		  //Remove the outlier class if it exists
	      		$(".slick-row:nth-of-type("+rowNum+") ."+classname).removeClass("outlier");
	      	  }
		  }
		  
		  var scatterPoint = $('col[row="'+rowIdx+'"][col="'+colIdx+'"]');
		  if(scatterPoint != null) {
	      	  if(column.outlier == "true") {
	      		  //Add the outlier class
	      		$(".slick-row:nth-of-type("+rowNum+") ."+classname).addClass("outlier");
	      		scatterPoint.attr("class", "circle outlier");
	      	  } else {
	      		  //Remove the outlier class if it exists
	      		$(".slick-row:nth-of-type("+rowNum+") ."+classname).removeClass("outlier");
	      		scatterPoint.attr("class", "circle outlier");
	      	  }
			  
		  }
		  
		  //Update the outlier histogram. This, in effect updates the "CSS" for the histogram
		  //because it rebuilds the histogram representing the outliers, based on the current
		  //"outlier" set of data in var experiment
		  if(histogram != null) {
			  histogram.update_data(experiment.experiment);
			  histogram.updateGraphOutlier();
		  }

    	});
    });
}

function loadGrid(dataSet) {
    grid.setData(dataSet);
    scatter.setData(dataSet);
    grid.fillUpGrid(null, null, true, cellFormatter, 'result-cell');
    if (showHeatMap) {
        colorGrid(dataSet);
    }

    //Mark the appropriate cells as "outliers" on click
    grid.grid.onClick.subscribe(function(e, args) {
        markOutlierGridClick(e, args);
    });
}

function plateSelected(plateIndex) {
    experiment.selectPlate(plateIndex);
    loadGrid(showNormalized ? experiment.normalizedData : experiment.data);
    $('#rawDataLabel')[0].textContent = experiment.rawDataLabel();

    stdCurve.updateStdCurveWithoutRecalculate();
}


function reloadGrid() {
    if (showNormalized) {
        experiment.loadNormalizedDataForGrid();
        loadGrid(experiment.normalizedData);
    }
    else {
        loadGrid(experiment.data);
    }
}

window.onload = init;
