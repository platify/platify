/*jslint browser:true */
/*global $, jQuery, alert*/

// constants
var DIMENSION = 100;
var CELL_HEIGHT = 25;
var CELL_WIDTH = 40;
var plateModel = {};
//var wellGroupings = [];
var grid;
var currentHighlightKeys = [];
var highlightKeyCounter = 0;
var currentHighlightColor = "#D5E3E3";
var highlightedCoords = [];
//var BLANK_CHAR = "-";

/**
 * A function that creates a blank data set for initializing the grid example
 * page. The data set is of dimension grid_height x grid_width.
 */
function createBlankData(grid_height, grid_width) {
	"use strict";
	var result, i, j;
	result = [];

	for (i = 0; i < grid_height; i++) {
		result[i] = [];
		for (j = 0; j < grid_width; j++) {
			result[i][j] = null;
		}
	}
	return result;
}

/**
 * A handler function for when the selected cells in the grid changes. This
 * function is registered to listen for these events in the createGrid
 * function using the registerSelectedCellsCallBack function of the Grid
 * Class. This function changes the background color of all selected cells
 * to the currentHighlightColor.
 */
function handleSelectedCells(startRow,startCol,endRow, endCol) {
	"use strict";
	var out, coordinatesToHighlight, i, j, key;
	// write to the selected cells div, the cells that are selected
	out = document.getElementById("cellRange");
	out.innerHTML = Grid.getRowLabel(startRow) + startCol + ":" + Grid.getRowLabel(endRow) + endCol;

	// highlight those cells with the current color
	coordinatesToHighlight = [];
	for (i = startRow; i <= endRow; i++) {
		for (j = startCol; j <= endCol; j++) {
			coordinatesToHighlight.push([i, j]);
			// set global record of highlights
			highlightedCoords.push([i, j]);
		}
	}
	key = "key" + highlightKeyCounter;
	grid.setCellColors(coordinatesToHighlight,currentHighlightColor, key);
	currentHighlightKeys.push(key);
	highlightKeyCounter++;
}


/**
 * This function creates a new grid applying it to the "myGrid" div on the
 * page. It then creates a blank data set and displays it in the grid.
 * It also registers the handleSelectedCells function as a listener for
 * the event that user selected cell ranges in the grid change.
 */
function createGrid() {
	"use strict";
	// construct the Grid object with the id of the html container element
	// where it should be placed (probably a div) as an argument
	grid  = new Grid("myGrid");

	// set the data to be displayed which must be in 2D array form
	grid.setData(createBlankData(DIMENSION, DIMENSION));

	// display the data
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT);

	// register a function to be called each time a new set of cells are
	// selected by a user
	grid.registerSelectedCellCallBack(handleSelectedCells);

}

function enableGridSelection() {
	"use strict";
	grid.enableCellSelection();
}

function disableGridSelection() {
	"use strict";
	grid.disableCellSelection();
}

/**
 * addEvent - This function adds an event handler to an html element in
 * a way that covers many browser types.
 * @param elementId - the string id of the element to attach the handler to
 * or a reference to the element itself.
 * @param eventType - a string representation of the event to be handled
 * without the "on" prefix
 * @param handlerFunction - the function to handle the event
 */
function addEvent(elementId, eventType, handlerFunction) {
	'use strict';
	var element;

	if (typeof elementId === "string") {
		element = document.getElementById(elementId);
	} else {
		element = elementId;
	}

	if (element.addEventListener) {
		element.addEventListener(eventType, handlerFunction, false);
	} else if (window.attachEvent) {
		element.attachEvent("on" + eventType, handlerFunction);
	}
} // end of function addEvent

//data format translation
function translateModelToOutputJson(pModel) {
	'use strict';
	var plateJson, plate, row, column, well, labels, catKey, labKey, label;
	plateJson = {};
	plate = {};
	plate.name = document.getElementById("templateName").value;
	plate.experimentID = window.expId;
	plate.labels = [];		// plate level labels, should set these if available already !!!
	plate.wells = [];
	for (row in pModel.rows) {
		for (column in pModel.rows[row].columns) {
			well = {};
			well.row = row - 1;
			well.column = column - 1;
			well.control = null;
			labels = [];
			for (catKey in pModel.rows[row].columns[column].categories) {
				for (labKey in pModel.rows[row].columns[column].categories[catKey]) {
					label = {};
					label.category = catKey;
					label.name = labKey;
					label.color = pModel.rows[row].columns[column].categories[catKey][labKey];
					labels.push(label);
				}
			}
			well.labels = labels;
			well.groupName = pModel.rows[row].columns[column].wellGroupName;
			plate.wells.push(well);
		}
	}
	plateJson.plate = plate;
	return plateJson;
}

// data format translation
function translateInputJsonToModel(plateJson) {
	'use strict';
	var pModel, plate, i, j, row, column, groupName, labels;
	pModel = {};
	pModel.rows = {};
	plate = plateJson.plate;
	
	pModel.grid_width = plate.width;
	pModel.grid_height = plate.height;
	
	for (i = 0; i < plate.wells.length; i++) {
		row = plate.wells[i].row + 1;
		column = plate.wells[i].column + 1;
		groupName = plate.wells[i].groupName;
		labels = plate.wells[i].labels;
		
		if (pModel.rows[row] === undefined) {
			pModel.rows[row] = {};
			pModel.rows[row].columns = {};
		}
		
		if (pModel.rows[row].columns[column] === undefined) {
			pModel.rows[row].columns[column] = {};
			pModel.rows[row].columns[column].wellGroupName = groupName;
			pModel.rows[row].columns[column].categories = {};
		}

		for (j = 0; j < labels.length; j++) {
			if (pModel.rows[row].columns[column].categories[labels[j].category] === undefined) {
				pModel.rows[row].columns[column].categories[labels[j].category] = {};
			}
			pModel.rows[row].columns[column].categories[labels[j].category][labels[j].name] = labels[j].color;
		}
	}

	return pModel;
}

// ajax save object call
function selectAndContinue() {
	"use strict";
	var pSelect = document.getElementById("plateSelect");
	if (pSelect.value !== undefined) {
		// use less hacky method !!
		window.location.href = hostname + "/experimentalPlateSet/createPlate" + '?expid=' + window.expId + '&tmpid=' + pSelect.value;
	} else {
		alert("An error while selecting the template. TemplateId is null");
	}
}

/**
 * Loads a json plate model and updates the grid and category legend
 */
function loadJsonData(plateJson) {
	"use strict";
	var g_height, g_width, newData, row, column, newContents;
	// assuming plate model has all empty rows ??
	plateModel = translateInputJsonToModel(plateJson);  // TMP	--> should only load plateModel instead,
	g_height = DIMENSION;
	g_width = DIMENSION;
	
	if (plateModel.grid_height !== null && plateModel.grid_height !== undefined) {
		g_height = plateModel.grid_height;
	}
	
	if (plateModel.grid_width !== null && plateModel.grid_width !== undefined) {
		g_width = plateModel.grid_width;
	}
	
	newData = createBlankData(g_height, g_width);
	
	for (row in plateModel.rows) {
		if (plateModel.rows.hasOwnProperty(row)) {
			for (column in plateModel.rows[row].columns) {
				if (plateModel.rows[row].columns.hasOwnProperty(column)) {
					newContents = plateModel.rows[row].columns[column].wellGroupName; 
					
					if (newContents !== null && newContents !== undefined) {
						newData[row - 1][column - 1] = newContents;
					}
				}
			}
		}
	}
	
	grid.setData(newData);

	// display the data
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT);
}

//ajax save object call
function fetchTemplateData(tId) {
	"use strict";
	var jqxhr = $.ajax({		// need to update to save plate instead of template
		url: hostname + "/plateTemplate/getPlate/" + tId,
		type: "POST",
		data: null,
		processData: false,
		contentType: "application/json; charset=UTF-8"
	}).done(function() {
		console.log("success");
	}).fail(function() {
		console.log("error");
	}).always(function() {
		console.log("complete");
	});
   
	// Set another completion function for the request above
	jqxhr.always(function(resData) {
		console.log( "second complete" );
		console.log("templateJson=" + JSON.stringify(resData));
		loadJsonData(resData);	// note may need to clear grid first !!!
	});
}

function onPlateSelectChange(selectEl) {
	"use strict";
	var tId = selectEl.value;
	console.log("selectEvent!:" + tId);
	fetchTemplateData(tId);
}

function updatePlateSelection() {
	"use strict";
	var pSelect, tId;
	pSelect = document.getElementById("plateSelect");
	tId = pSelect.value;
	console.log("tId!:" + tId);
	if (tId !== undefined && tId !== null && tId !== "") {
		fetchTemplateData(tId);
	}
}

/**
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers on the
 */
function init() {
	"use strict";
	createGrid();

	// allows for passing input Json, but it not used here. Perhaps refactor!
	//var testInputJson = {"plate":{"wells":[{"row":"2","column":"2","control":null,"labels":[{"category":"c1","name":"l1","color":"#ffff00"}],"groupName":"L67"},{"row":"2","column":"3","control":null,"labels":[{"category":"c1","name":"l2","color":"#4780b8"}],"groupName":"L5"},{"row":"3","column":"2","control":null,"labels":[{"category":"c1","name":"l1","color":"#ffff00"},{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L51"},{"row":"3","column":"3","control":null,"labels":[{"category":"c1","name":"l2","color":"#4780b8"},{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L17"},{"row":"4","column":"2","control":null,"labels":[{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L2"},{"row":"4","column":"3","control":null,"labels":[{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L47"}],"labels":[]}};
	//loadJsonData(testInputJson);
	
	addEvent("saveTemplate", "click", selectAndContinue);
	//addEvent("plateSelect", "change", onPlateSelectChange);

	// initially disable selection of grid cells
	disableGridSelection();
	
	var pSelect = document.getElementById("plateSelect");
	if (pSelect.value !== undefined && pSelect.value !== null) {
		fetchTemplateData(pSelect.value);
	}
}

window.onload = init;

$('#plateSelect').selectize({
    create: true,
    sortField: 'text'
});