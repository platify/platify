/*jslint browser: true*/
/*global $, jQuery, alert*/

// constants
var DIMENSION = 100;
var GRID_HEIGHT = 100;
var GRID_WIDTH = 100;
var CELL_HEIGHT = 25;
var CELL_WIDTH = 40;
var plateModel = {};
var wellGroupings = [];
var grid;
var currentHighlightKeys = [];
var highlightKeyCounter = 0;
var currentHighlightColor = "#D5E3E3";
var highlightedCoords = [];

/**
 * Creates a blank data set for initializing the grid data set. 
 * The data set is of dimension GRID_HEIGHT x GRID_WIDTH.
 */
function createBlankData() {
	"use strict";
	var i, j, result;
	result = [];

	for (i = 0; i < GRID_HEIGHT; i++) {
		result[i] = [];
		for (j = 0; j < GRID_WIDTH; j++) {
			result[i][j] = "";
		}
	}
	return result;
}

/**
 * Creates a random data set for displaying in the grid example
 * page. The data set is of dimension GRID_HEIGHT x GRID_WIDTH.
 */
function createRandomData() {
	"use strict";
	var i, j, result;
	result = [];

	for (i = 0; i < GRID_HEIGHT; i++) {
		result[i] = [];
		for (j = 0; j < GRID_WIDTH; j++) {
			result[i][j] = "L" + Math.floor(Math.random() * 100);
		}
	}
	return result;
}

/**
 * Focuses on the text field 'newlabelValue'.
 */
function txtFieldFocus() {
	"use strict";
	$("#newLabelValue").focus();
}

/**
 * A handler function for when the selected cells in the grid changes. This
 * function is registered to listen for these events in the createGrid
 * function using the registerSelectedCellsCallBack function of the Grid
 * Class. This function changes the background color of all selected cells
 * to the currentHighlightColor. 
 * Then causes the cursor to focus in the textField.
 * @param startRow - the row index of top left cell of the selecting box
 * @param startCol - the column index of top left cell of the selecting box
 * @param endRow - the row index of bottom right cell of the selecting box
 * @param endCol - the column index of bottom right cell of the selecting box
 */
function handleSelectedCells(startRow, startCol, endRow, endCol) {
	"use strict";
	var out, i, j, key, coordinatesToHighlight;
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
	grid.setCellColors(coordinatesToHighlight, currentHighlightColor, key);
	currentHighlightKeys.push(key);
	highlightKeyCounter++;
	txtFieldFocus();
}

/**
 * Removes the most recent cell background color change. This
 * is achieved by calling the removeCellColors method of the Grid class with
 * the most key used to create the most recent background color change as
 * stored in the currentHighlightKeys array.
 */
function removeHighlightedArea() {
	"use strict";
	if (currentHighlightKeys.length > 0) {
		grid.removeCellColors(currentHighlightKeys.pop());

		// need to decrement highlightedCoords here !! 
		//(not the same number of items removed !!!)
		highlightedCoords.pop();	// need to fix !!
	}
}

/**
 * Removes all the current cell selections and related background color 
 * change. This is achieved by calling the removeCellColors method of the Grid class with
 * the most key used to create the most recent background color change as
 * stored in the currentHighlightKeys array.
 */
function removeAllHighlightedCells() {
	"use strict";
	while (currentHighlightKeys.length > 0) {
		grid.removeCellColors(currentHighlightKeys.pop());
	}
	// removing all selected cells, so global count disappears
	highlightedCoords = [];
}

/**
 * Creates a new grid applying it to the "myGrid" div on the
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
	grid.setData(createBlankData());

	// display the data
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT, true, Grid.editorCellFormatter, "editor-cell");

	// register a function to be called each time a new set of cells are
	// selected by a user
	grid.registerSelectedCellCallBack(handleSelectedCells);

}

/**
 * Removes the current selection of cells and enables
 * the ability to make selections on the grid. 
 */
function enableGridSelection() {
	"use strict";
	removeAllHighlightedCells();
	grid.enableCellSelection();
}

/**
 * Removes the current selection of cells and enables
 * the ability to make selections on the grid. 
 */
function disableGridSelection() {
	"use strict";
	removeAllHighlightedCells();
	grid.disableCellSelection();
}

/**
 * This function reads the current value in 'newLabelValue'. This value
 * is then added to the plateModel as the groupName for any currently selected
 * grid cells. It then removes any highlighting/selection from the grid.
 */
function addTemplateValue() {
	"use strict";
	var selCells, cellValue, wellType, cell, row, column, wgs;
	selCells = highlightedCoords;
	// console.log(selCells);
	cellValue = document.getElementById("newLabelValue").value;
	
	// validate input
	if( /[^a-zA-Z0-9]/.test(cellValue)) {
       alert('Input is not alphanumeric');
    } else {
		wellType = $("input[name=wellType]:checked").val();

		// just keeping list of well values
		if (wellGroupings.indexOf(cellValue) === -1) {
			wellGroupings.push(cellValue);
		}

		// update selected grid cells with label
		for (cell in selCells) {
			if (selCells.hasOwnProperty(cell)) {
				row = selCells[cell][0];
				column = selCells[cell][1];

				if (plateModel.rows === undefined) {
					plateModel.rows = {};
				}

				if (plateModel.rows[row] === undefined) {
					plateModel.rows[row] = {};
				}

				if (plateModel.rows[row].columns === undefined) {
					plateModel.rows[row].columns = {};
				}

				if (plateModel.rows[row].columns[column] === undefined) {
					plateModel.rows[row].columns[column] = {};
				}
				plateModel.rows[row].columns[column].wellGroupName = cellValue;
				plateModel.rows[row].columns[column].wellType = wellType;

				// add control to well
				var wellStr = cellValue + "," + wellType;
				
				grid.updateCellContents(row, column, wellStr);
			}
		}

		console.log("plateModel1:" + JSON.stringify(plateModel));		// TODO Remove console log

		wgs = document.getElementById("wellGroupSpan");		// TODO WHAT IS THIS USED FOR ???
		wgs.innerHTML = wellGroupings;

		// clear current selection
		removeAllHighlightedCells();
	}
}


/**
 * This function adds an event handler to an html element in
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
}


/**
 * This function is used to convert the internal data structure json format into
 * a data structure json format that is expected by the server when sending the 
 * template json to be saved by the back-end. This allows for differences between
 * the 2 models. The internal model providing a more efficient referencing structure
 * for the client-side tasks, and allows for quick changes to either model while
 * maintaining the contract with the server.
 * @param pModel - a data structure in the format of the internal data model.
 * @returns plateJson - a data structure in the format excepted by the server.
 */
function translateModelToOutputJson(pModel) {
	'use strict';
	var plateJson, plate, i, j, well, labels, catKey, labKey, label;
	plateJson = {};
	plate = {};
	plate.name = window.tName;			// should do null check ???
	plate.width = GRID_WIDTH;
	plate.height = GRID_HEIGHT;

	plate.experimentID = window.expId;
	plate.labels = [];		// plate level labels, should set these if available already !!!
	plate.wells = [];

	// Send all values for the grid
	for (i = 1; i <= plate.height; i++) {
		for (j = 1; j <= plate.width; j++) {
			well = {};
			well.row = i - 1;
			well.column = j - 1;
			
			labels = [];
			if (pModel.rows[i] !== undefined && pModel.rows[i].columns[j] !== undefined) {
				// RECONSIDER what you are doing here. Are labels even present at template stage ??
				for (catKey in pModel.rows[i].columns[j].categories) {
					for (labKey in pModel.rows[i].columns[j].categories[catKey]) {
						label = {};
						label.category = catKey;
						label.name = labKey;
						label.color = pModel.rows[i].columns[j].categories[catKey][labKey];
						labels.push(label);
					}
				}
				
				well.groupName = pModel.rows[i].columns[j].wellGroupName;
				well.control = pModel.rows[i].columns[j].wellType;
			} else {
				well.control = "empty";
			}

			well.labels = labels;
			plate.wells.push(well);
		}
	}
	plateJson.plate = plate;
	return plateJson;
}


/**
 * This function is used to convert a json data structure in the format that is 
 * sent by the server, into the json data structure that is expected by the
 * client-side JavaScript. This allows for differences between
 * the 2 models. This is used when loading data received from the server into 
 * the grid and associated internal data model. The internal model providing a 
 * more efficient referencing structure for the client-side tasks, and allows 
 * for quick changes to either model while maintaining the contract with the server.
 * @param plateJson - a data structure in the format sent by the server.
 * @returns pModel - a data structure in the format expected by the internal data model.
 */
function translateInputJsonToModel(plateJson) {
	"use strict";
	var pModel, plate, i, j, row, column, groupName, labels;
	pModel = {};
	pModel.rows = {};
	plate = plateJson.plate;

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


/**
 * Ajax call to the server. Translates the current saved data model to a format
 * expected by the server. Then sends the template data to be saved.
 * If successfully saved it transitions to the next page.
 * If saving fails it displays and appropriate indication to the user.
 */
function saveConfigToServer() {
	"use strict";
	var plateJson, jqxhr;
	plateJson = translateModelToOutputJson(plateModel);
	console.log("SendingToServer:" + JSON.stringify(plateJson));

	jqxhr = $.ajax({
		url: hostname + "/plateTemplate/save",
		type: "POST",
		data: JSON.stringify(plateJson),
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
		var storedTemplate = JSON.stringify(resData);
		console.log("second complete");
		console.log("result=" + storedTemplate);		// should parse for id
		console.log("storedTemplate['plateTemplate']=" + resData.plateTemplate);
		console.log("storedTemplate['plateTemplate']['id']=" + resData.plateTemplate.id);

		if (resData.plateTemplate !== undefined &&  resData.plateTemplate.id !== undefined) {
			plateModel.templateID = resData.plateTemplate.id;
			// use less hacky method !!
			if (window.expId !== undefined) {
				// if we're in an experiment, then continue to assignlabels page
				window.location.href = hostname + "/experimentalPlateSet/createPlate" + '?expid=' + window.expId + '&tmpid=' + plateModel.templateID;
			} else {
				// if we're not in an experiment, then return to homepage
				window.location.href = hostname + "/";
			}
		} else {
			alert("An error while saving the template: " + storedTemplate);
		}

	});
}

/**
 * Loads a json data structure received from the server. It is translated into 
 * a format understood by the local internal plate model and updates the grid
 * with the data received.
 * @param plateJson - a data structure in the format sent by the server.
 */
function loadJsonData(plateJson) {
	"use strict";
	var row, column, newContents;
	plateModel = translateInputJsonToModel(plateJson);

	for (row in plateModel.rows) {
		if (plateModel.rows.hasOwnProperty(row)) {
			for (column in plateModel.rows[row].columns) {
				if (plateModel.rows[row].columns.hasOwnProperty(column)) {
					newContents = plateModel.rows[row].columns[column].wellGroupName;

					grid.updateCellContents(row, column, newContents);
				}
			}
		}
	}
}

/**
 * jQuery setup commands.
 */
$(function() {
	"use strict";
	$("input[name=wellType]").on("change", function () {
		if ($(this).prop('id') === "emptyType") {
			document.getElementById("newLabelValue").value = "";
			document.getElementById("newLabelValue").disabled = true;
		} else {
			document.getElementById("newLabelValue").disabled = false;
		}
	});
});

/**
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers.
 */
function init() {
	"use strict";
	if (window.tWidth !== undefined) {
		GRID_WIDTH = window.tWidth;
	}

	if (window.tHeight !== undefined) {
		GRID_HEIGHT = window.tHeight;
	}
	createGrid();

	// allows for passing input Json, but it not used here. Perhaps refactor!
	//var testInputJson = {"plate":{"wells":[{"row":"2","column":"2","control":null,"labels":[{"category":"c1","name":"l1","color":"#ffff00"}],"groupName":"L67"},{"row":"2","column":"3","control":null,"labels":[{"category":"c1","name":"l2","color":"#4780b8"}],"groupName":"L5"},{"row":"3","column":"2","control":null,"labels":[{"category":"c1","name":"l1","color":"#ffff00"},{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L51"},{"row":"3","column":"3","control":null,"labels":[{"category":"c1","name":"l2","color":"#4780b8"},{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L17"},{"row":"4","column":"2","control":null,"labels":[{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L2"},{"row":"4","column":"3","control":null,"labels":[{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L47"}],"labels":[]}};
	//loadJsonData(testInputJson);

	addEvent("addTemplateValueBtn", "click", addTemplateValue);
	addEvent("clearAllSelection", "click", removeAllHighlightedCells);
	addEvent("saveTemplate", "click", saveConfigToServer);

	// initially disable selection of grid cells
	enableGridSelection();
}

window.onload = init;
