// constants
var DIMENSION = 100;
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
 * Loads a json plate model and updates the grid and category legend
 */
function loadJsonData(plateJson) {
	clearCurrentGridValues();
	plateModel = translateInputJsonToModel(plateJson);
	
	for (var row in plateModel["rows"]) {
		for (var column in plateModel["rows"][row]["columns"]) {
			var newContents = plateModel["rows"][row]["columns"][column]["wellGroupName"];		// perhaps use return result, like random data instead !! ??
			
			grid.updateCellContents(row, column, newContents);
		}
	}
}

/**
 * Replaces the values in the grid with blanks, for rows/columns in the current plateModel
 */
function clearCurrentGridValues() {
	// for each existing value, overwrite with blank label
	for (var row in plateModel["rows"]) {
		for (var column in plateModel["rows"][row]["columns"]) {
			var newContents = "-";
			
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
	grid.enableCellSelection();
}

function disableGridSelection() {
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
	plate["name"] = document.getElementById("templateName").value;
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
function selectAndContinue() {

	var pSelect = document.getElementById("plateSelect");
	if (pSelect.value != null) {
		// use less hacky method !!
		window.location.href = hostname + "/experimentalPlateSet/createPlate/" + pSelect.value;
	} else {
		alert("An error while selecting the template. TemplateId is null");
	}
}

//ajax save object call
function fetchTemplateData(tId){
	
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

function onPlateSelectChange(){
	// NEED TO CLEAR Grid DATA HERE, or pass a template with all values !!??
	// in theory if template has value for all cells this is not needed. plateModel needs to change to ensure this ??!!

	var tId = this.value;
	fetchTemplateData(tId);
}


/**
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers on the
 */
function init(){
	createGrid();

	// allows for passing input Json, but it not used here. Perhaps refactor!
	//var testInputJson = {"plate":{"wells":[{"row":"2","column":"2","control":null,"labels":[{"category":"c1","name":"l1","color":"#ffff00"}],"groupName":"L67"},{"row":"2","column":"3","control":null,"labels":[{"category":"c1","name":"l2","color":"#4780b8"}],"groupName":"L5"},{"row":"3","column":"2","control":null,"labels":[{"category":"c1","name":"l1","color":"#ffff00"},{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L51"},{"row":"3","column":"3","control":null,"labels":[{"category":"c1","name":"l2","color":"#4780b8"},{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L17"},{"row":"4","column":"2","control":null,"labels":[{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L2"},{"row":"4","column":"3","control":null,"labels":[{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L47"}],"labels":[]}};
	//loadJsonData(testInputJson);
	
	addEvent("saveTemplate", "click", selectAndContinue);
	addEvent("plateSelect", "change", onPlateSelectChange);

	// initially disable selection of grid cells
	disableGridSelection();
	
	var pSelect = document.getElementById("plateSelect");
	if (pSelect.value != null) {
		fetchTemplateData(pSelect.value);
	}
}

window.onload = init;

$('#plateSelect').selectize({
    create: true,
    sortField: 'text'
});