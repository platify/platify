// constants
var DIMENSION = 100;
var GRID_HEIGHT = 100;
var GRID_WIDTH = 100;
var CELL_HEIGHT = 25;
var CELL_WIDTH = 40;
var data;
var plateModel = {};
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

	for (var i = 0; i < GRID_HEIGHT; i++){
		result[i] = [];
		for (var j = 0; j < GRID_WIDTH; j++){
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
	for (var i=0; i < GRID_HEIGHT; i++){
		result[i] = [];
		for (var j=0; j < GRID_WIDTH; j++){
			result[i][j] = "L" + Math.floor(Math.random()*100);
		}
	}
	return result;
}

/**
 * Loads a json plate model and updates the grid and category legend
 */
function loadJsonData(plateJson) {
	
	plateModel = translateInputJsonToModel(plateJson);
	
	for (var row in plateModel["rows"]) {
		for (var column in plateModel["rows"][row]["columns"]) {
			var newContents = plateModel["rows"][row]["columns"][column]["wellGroupName"];		// perhaps use return result, like random data instead !! ??
			
			grid.updateCellContents(row, column, newContents);
		}
	}
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
	txtFieldFocus();
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
		
		if (plateModel["rows"] == null) {
			plateModel["rows"] = {};
		}
		
		if (plateModel["rows"][row] == null) {
			plateModel["rows"][row] = {};
		}
		
		if (plateModel["rows"][row]["columns"] == null) {
			plateModel["rows"][row]["columns"] = {};
		}
		
		if (plateModel["rows"][row]["columns"][column] == null) {
			plateModel["rows"][row]["columns"][column] = {};
			plateModel["rows"][row]["columns"][column]["wellGroupName"] = cellValue;
		}
		
		grid.updateCellContents(row, column, cellValue);
	}
	
	console.log("plateModel1:" + JSON.stringify(plateModel));
	
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

//data format translation
function translateModelToOutputJson(pModel) {
	var plateJson = {};
	var plate = {};
	plate["name"] = window.tName;			// should do null check ???
	plate["width"] = GRID_WIDTH;
	plate["height"] = GRID_HEIGHT;
	
	plate["experimentID"] = window.expId;
	plate["labels"] = [];		// plate level labels, should set these if available already !!!
	plate["wells"] = [];
	for (var row in pModel["rows"]) {
		for (var column in pModel["rows"][row]["columns"]) {
			var well = {};
			well["row"] = row;
			well["column"] = column;
			well["control"] = null;
			var labels = [];
			for (var catKey in pModel["rows"][row]["columns"][column]["categories"]) {
				for (var labKey in pModel["rows"][row]["columns"][column]["categories"][catKey]) {
					var label = {};
					label["category"] = catKey;
					label["name"] = labKey;
					label["color"] = pModel["rows"][row]["columns"][column]["categories"][catKey][labKey];
					labels.push(label);
				}
			}
			well["labels"] = labels;
			well["groupName"] = pModel["rows"][row]["columns"][column]["wellGroupName"];
			plate["wells"].push(well);
		}
	}
	plateJson["plate"] = plate;
	return plateJson;
}

// data format translation
function translateInputJsonToModel(plateJson) {
	var pModel = {};
	pModel["rows"] = {};
	var plate = plateJson["plate"];
	
	for (var i=0; i < plate["wells"].length; i++) {
		var row = plate["wells"][i]["row"];
		var column = plate["wells"][i]["column"];
		var groupName = plate["wells"][i]["groupName"];
		var labels = plate["wells"][i]["labels"];
		
		if (pModel["rows"][row] == null) {
			pModel["rows"][row] = {};
			pModel["rows"][row]["columns"] = {};
		}
		
		if (pModel["rows"][row]["columns"][column] == null) {
			pModel["rows"][row]["columns"][column] = {};
			pModel["rows"][row]["columns"][column]["wellGroupName"] = groupName;
			pModel["rows"][row]["columns"][column]["categories"] = {};
		}

		for (var j=0; j < labels.length; j++) {
			if (pModel["rows"][row]["columns"][column]["categories"][labels[j].category] == null) {
				pModel["rows"][row]["columns"][column]["categories"][labels[j].category] = {};
			}
			pModel["rows"][row]["columns"][column]["categories"][labels[j].category][labels[j].name] = labels[j].color;
		}
	}

	return pModel;
}

// ajax save object call
function saveConfigToServer(){
	var plateJson = translateModelToOutputJson(plateModel);
	console.log("SendingToServer:" + JSON.stringify(plateJson));
   
	var jqxhr = $.ajax({
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
		console.log( "second complete" );
		console.log("result=" + storedTemplate);		// should parse for id
		console.log("storedTemplate['plateTemplate']=" + resData["plateTemplate"]);
		console.log("storedTemplate['plateTemplate']['id']=" + resData["plateTemplate"]["id"]);
		
		if (resData["plateTemplate"] !=null &&  resData["plateTemplate"]["id"] != null) {
			plateModel["templateID"] = resData["plateTemplate"]["id"];
			// use less hacky method !!
			if (window.expId != null) {
				// if we're in an experiment, then continue to assignlabels page
				window.location.href = hostname + "/experimentalPlateSet/createPlate" 
					+ '?expid=' + window.expId + '&tmpid=' + plateModel["templateID"];
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
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers on the
 */
function init(){

	if (window.tWidth != null) {
		GRID_WIDTH = window.tWidth;
	}
	
	if (window.tHeight != null) {
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

// jQuery ui stuff
function txtFieldFocus() {
	$("#newLabelValue").focus();
};
