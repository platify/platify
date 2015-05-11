/*jslint browser:true */
/*global $, jQuery, alert*/

var DIMENSION = 100;					// default grid height/width
var grid;								// reference to the instantiated grid object
var groupNames = {};					// tracks imported compounds/wellgroup relationship 
var currentHighlightKeys = [];			// array of references to current highlighted grid cells
var highlightedCoords = [];				// array of currently selected coordinates
var currentHighlightColor = "#D5E3E3";	// default selection color
var highlightKeyCounter  = 0;			// counter for number of grid selections

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

	if (typeof element !== 'undefined' && element != null){
		if (element.addEventListener) {
			element.addEventListener(eventType, handlerFunction, false);
		} else if (window.attachEvent) {
			element.attachEvent("on" + eventType, handlerFunction);
		}		
	}
}

/**
 * Creates a blank data set for initializing the grid data set. 
 * The data set is of dimension grid_height x grid_width.
 * @param grid_height - number of rows on the grid
 * @param grid_width - number of columns on the grid
 */
function createBlankData(grid_height, grid_width) {
	"use strict";
	var result, i, j;
	result = [];

	for (i = 0; i < grid_height; i++) {
		result[i] = [];
		for (j = 0; j < grid_width; j++) {
			result[i][j] = "";
		}
	}
	return result;
}

/**
 * Creates a random data set for displaying in the grid example
 * page. The data set is of dimension grid_height x grid_width.
 * @param grid_height - number of rows on the grid
 * @param grid_width - number of columns on the grid
 */
function createRandomData(grid_height, grid_width) {
	"use strict";
	var i, j, result;
	result = [];

	for (i = 0; i < grid_height; i++) {
		result[i] = [];
		for (j = 0; j < grid_width; j++) {
			result[i][j] = "L" + Math.floor(Math.random() * 100);
		}
	}
	return result;
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
	var pModel, plate, i, j, row, column, groupName, wellType, labels, convCat, convLab;
	pModel = {};
	groupNames = {};
	pModel.rows = {};
	plate = plateJson.plate;

	if (plateJson.labels !== undefined) {
		pModel.labels = plateJson.labels;
	} else {
		pModel.labels = [];
	}
	
	if (plate.name === undefined || plate.name === null) {
		alert("An error occurred while loading the data for the stored plate received from the server. Please ensure you have specified a correct template/plate id.");
	} else {
		pModel.name = plate.name;
		pModel.grid_width = plate.width;
		pModel.grid_height = plate.height;

		for (i = 0; i < plate.wells.length; i++) {
			row = plate.wells[i].row + 1;
			column = plate.wells[i].column + 1;
			
			if (plate.wells[i].groupName !== undefined && plate.wells[i].groupName !== null) {
				groupName = plate.wells[i].groupName;
				if (plate.wells[i].control !== undefined && plate.wells[i].control !== null) {
					wellType = plate.wells[i].control;
				} else {
					wellType = "compound";		// fail back to compound
				}
			} else {
				groupName = "";
				wellType = "empty";
			}
			
			labels = plate.wells[i].labels;

			if (pModel.rows[row] === undefined) {
				pModel.rows[row] = {};
				pModel.rows[row].columns = {};
			}

			if (pModel.rows[row].columns[column] === undefined) {
				pModel.rows[row].columns[column] = {};
				pModel.rows[row].columns[column].wellGroupName = groupName;
				pModel.rows[row].columns[column].wellType = wellType;
				pModel.rows[row].columns[column].categories = {};
			}

			for (j = 0; j < labels.length; j++) {
				// convert possible disruptive input to safer format !
				convCat = labels[j].category.toString().split('.').join('__dot__');
				convLab = labels[j].name.toString().split('.').join('__dot__');

				if (convCat === "compound") {
					if (groupName !== null && groupName !== "") {
						groupNames[groupName] = convLab;
					}
				} else {
					// other labels
					if (pModel.rows[row].columns[column].categories[convCat] === undefined) {
						pModel.rows[row].columns[column].categories[convCat] = {};
					}

					if (pModel.rows[row].columns[column].categories[convCat][convLab] === undefined) {
						pModel.rows[row].columns[column].categories[convCat][convLab] = {};
					}
					pModel.rows[row].columns[column].categories[convCat][convLab].color = labels[j].value;
					pModel.rows[row].columns[column].categories[convCat][convLab].units = labels[j].units;
				}
			}
		}
	}

	return pModel;
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
 * Enables the ability to make selections on the grid.
 */
function enableGridSelection() {
	"use strict";
	if (grid !== undefined) {
		grid.enableCellSelection();
	}
}

/**
 * Disables the ability to make selections on the grid.
 */
function disableGridSelection() {
	"use strict";
	if (grid !== undefined) {
		grid.disableCellSelection();
	}
}

/**
 * Creates a new grid applying it to the "myGrid" div on the
 * page. It then creates a blank data set and displays it in the grid.
 * It also registers the handleSelectedCells function as a listener for
 * the event that user selected cell ranges in the grid change.
 */
function createGrid(gridName, cell_width, cell_height, grid_width, grid_height) {
	"use strict";
	// construct the Grid object with the id of the html container element
	// where it should be placed (probably a div) as an argument
	grid = new Grid(gridName);

	// set the data to be displayed which must be in 2D array form
	grid.setData(createBlankData(grid_height, grid_width));

	// display the data
	grid.fillUpGrid(cell_width, cell_height, true, Grid.editorCellFormatter, "editor-cell");

	// register a function to be called each time a new set of cells are
	// selected by a user
	grid.registerSelectedCellCallBack(handleSelectedCells);
}
