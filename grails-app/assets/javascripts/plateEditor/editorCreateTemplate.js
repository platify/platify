// constants
var DIMENSION = 100;
var CELL_HEIGHT = 25;
var CELL_WIDTH = 40;
var data;
var cellValues = {};
var wellGroupings = [];
var grid;
var currentHighlightKeys = [];
var highlightKeyCounter = 0;
var currentHighlightColor = "#D5E3E3";
var highlightedCoords = [];

/**
 * A function that creates a blank data set for initializing the grid example
 * page. The data set is of dimension DIMENSION x DIMENSION.
 */
function createBlankData(){
	var result = [];

	for (var i=0; i<DIMENSION; i++){
		result[i] = [];
		for (var j=0; j<DIMENSION; j++){
			result[i][j] = null;
		}
	}
	return result;
}

/**
 * A function that creates a random data set for displaying in the grid example
 * page. The data set is of dimension DIMENSION x DIMENSION.
 */
function createRandomData(){
	var result = [];
	for (var i=0; i<DIMENSION; i++){
		result[i] = [];
		for (var j=0; j<DIMENSION; j++){
			result[i][j] = "L" + Math.floor(Math.random()*100);
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
function handleSelectedCells(startRow,startCol,endRow, endCol){
	// write to the selected cells div, the cells that are selected
	var out = document.getElementById("cellRange");
	out.innerHTML = Grid.getRowLabel(startRow)+startCol+":"
					+Grid.getRowLabel(endRow)+endCol;


	// highlight those cells with the current color
	var coordinatesToHighlight = [];
	for (var i=startRow; i<=endRow; i++){
		for (var j=startCol; j<=endCol; j++){
			coordinatesToHighlight.push([i, j]);
			// set global record of highlights
			highlightedCoords.push([i, j]);
		}
	}
	var key = "key" + highlightKeyCounter;
	grid.setCellColors(coordinatesToHighlight,currentHighlightColor, key);
	currentHighlightKeys.push(key);
	highlightKeyCounter++;
}

/**
 * This function handles the event that the removeHighlighting button is
 * clicked by removing the most recent cell background color change. This
 * is achieved by calling the removeCellColors method of the Grid class with
 * the most key used to create the most recent background color change as
 * stored in the currentHighlightKeys array.
 */
function removeHighlightedArea(){
	if (currentHighlightKeys.length > 0) {
		grid.removeCellColors(currentHighlightKeys.pop());
		
		// need to decrement highlightedCoords here !! 
		//(not the same number of items removed !!!)
		highlightedCoords.pop();	// need to fix !!
	}
}

/**
 * This function handles the event that the removeHighlighting button is
 * clicked by removing the most recent cell background color change. This
 * is achieved by calling the removeCellColors method of the Grid class with
 * the most key used to create the most recent background color change as
 * stored in the currentHighlightKeys array.
 */
function removeAllHighlightedCells(){
	while (currentHighlightKeys.length > 0) {
		grid.removeCellColors(currentHighlightKeys.pop());
	}
	// removing all selected cells, so global count disappears
	highlightedCoords = [];
}

/**
 * This function creates a new grid applying it to the "myGrid" div on the
 * page. It then creates a blank data set and displays it in the grid.
 * It also registers the handleSelectedCells function as a listener for
 * the event that user selected cell ranges in the grid change.
 */
function createGrid(){
	// construct the Grid object with the id of the html container element
	// where it should be placed (probably a div) as an argument
	grid  = new Grid("myGrid");

	// set the data to be displayed which must be in 2D array form
	data = createBlankData();
	grid.setData(data);

	// display the data
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT);

	// register a function to be called each time a new set of cells are
	// selected by a user
	grid.registerSelectedCellCallBack(handleSelectedCells);

}

function enableGridSelection() {
	removeAllHighlightedCells();
	grid.enableCellSelection();
}

function disableGridSelection() {
	removeAllHighlightedCells();
	grid.disableCellSelection();
}

/**
 * This function changes the style of a particular cell
 */
function addTemplateValue() {
	//var selCells = grid.getSelectedCells();
	var selCells = highlightedCoords;
	console.log(selCells);
	var cellValue = document.getElementById("newLabelValue").value;
	
	// just keeping list of well values
	if (wellGroupings.indexOf(cellValue) == -1) {
		wellGroupings.push(cellValue);
	}
	
	// update selected grid cells with label
	for (var cell in selCells) {
		var row = selCells[cell][0];
		var column = selCells[cell][1];
		
		if (cellValues[row] == null) {
			cellValues[row] = [];
		}
		if (cellValues[row][column] == null) {
			cellValues[row][column] = cellValue;
		}
		
		grid.updateCellContents(row, column, cellValue);
	}
	
	var wgs = document.getElementById("wellGroupSpan");
	wgs.innerHTML = wellGroupings;
	
	// clear current selection
	removeAllHighlightedCells();
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

	if (typeof(elementId) === "string"){
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


/**
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers on the
 */
function init(){
	createGrid();
	addEvent("addTemplateValueBtn", "click", addTemplateValue);
	addEvent("clearLastSelection", "click", removeHighlightedArea);
	addEvent("clearAllSelection", "click", removeAllHighlightedCells);

	// initially disable selection of grid cells
	enableGridSelection();
}

window.onload = init;