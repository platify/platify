/*jslint browser:true */
/*global $, jQuery, alert*/

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
			result[i][j] = null;
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
function createRandomData(grid_height, grid_width) {		// TODO - perhaps remove (only used for testing)
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
	txtFieldFocus();						// TODO - may need to have this as common also ??
}

/**
 * Removes the most recent cell background color change. This
 * is achieved by calling the removeCellColors method of the Grid class with
 * the most key used to create the most recent background color change as
 * stored in the currentHighlightKeys array.
 */
function removeHighlightedArea() {					// TODO -- need grid reference here ?? maybe not common ??
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
function createGrid() { // TODO -- change to be common, and support grid name ?? -- maybe return grid object ???
	"use strict";
	// construct the Grid object with the id of the html container element
	// where it should be placed (probably a div) as an argument
	grid  = new Grid("myGrid");

	// set the data to be displayed which must be in 2D array form
	grid.setData(createBlankData());

	// display the data
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT);

	// register a function to be called each time a new set of cells are
	// selected by a user
	grid.registerSelectedCellCallBack(handleSelectedCells);

}


/**
 * Removes the current selection of cells and enables
 * the ability to make selections on the grid. 
 */
function enableGridSelection() {			// TODO maybe pass grid object ???
	"use strict";
	removeAllHighlightedCells();
	grid.enableCellSelection();
}

/**
 * Removes the current selection of cells and enables
 * the ability to make selections on the grid. 
 */
function disableGridSelection() {			// TODO maybe pass grid object ???
	"use strict";
	removeAllHighlightedCells();
	grid.disableCellSelection();
}

// TODO - others, maybe fetchTemplate ?? -- saveConfig ?? -- translate input /output ??