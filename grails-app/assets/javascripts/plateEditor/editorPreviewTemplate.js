// constants
var DIMENSION = 100;
var CELL_HEIGHT = 25;
var CELL_WIDTH = 40;
// var data;
var plateModel = {};
var wellGroupings = [];
var grid;
var currentHighlightKeys = [];
var highlightKeyCounter = 0;
var currentHighlightColor = "#D5E3E3";
var highlightedCoords = [];
var BLANK_CHAR = "-"

/**
 * A function that creates a blank data set for initializing the grid example
 * page. The data set is of dimension grid_height x grid_width.
 */
function createBlankData(grid_height, grid_width) {
	var result = [];

	for (var i = 0; i < grid_height; i++) {
		result[i] = [];
		for (var j = 0; j < grid_width; j++) {
			result[i][j] = null;
		}
	}
	return result;
}

/**
 * Loads a json plate model and updates the grid and category legend
 */
function loadJsonData(plateJson) {
	// assuming plate model has all empty rows ??
	plateModel = translateInputJsonToModel(plateJson); 		// TMP	--> should only load plateModel instead, 
	var g_height = DIMENSION;
	var g_width = DIMENSION;
	
	if (plateModel["grid_height"] != null) {
		g_height = plateModel["grid_height"];
	}
	
	if (plateModel["grid_width"] != null) {
		g_width = plateModel["grid_width"];
	}
	
	var newData = createBlankData(g_height, g_width);
	
	for (var row in plateModel["rows"]) {
		for (var column in plateModel["rows"][row]["columns"]) {
			var newContents = plateModel["rows"][row]["columns"][column]["wellGroupName"]; 
			
			if (newContents != null) {
				newData[row - 1][column - 1] = newContents;
			}
		}
	}
	
	grid.setData(newData);

	// display the data
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT);
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
	var data = createBlankData(DIMENSION, DIMENSION);
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
	
	pModel["grid_width"] = plate["width"];
	pModel["grid_height"] = plate["height"];
	
	for (var i = 0; i < plate["wells"].length; i++) {
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

		for (var j = 0; j < labels.length; j++) {
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
		window.location.href = hostname + "/experimentalPlateSet/createPlate"
			+ '?expid=' + expId + '&tmpid=' + pSelect.value;
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

function onPlateSelectChange(selectEl){
	var tId = selectEl.value;
	console.log("selectEvent!:" + tId);
	fetchTemplateData(tId);
}

function updatePlateSelection() {
	var pSelect = document.getElementById("plateSelect");
	var tId = pSelect.value;
	console.log("tId!:" + tId);
	if (tId != null && tId != "") {
		fetchTemplateData(tId);
	}
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
	//addEvent("plateSelect", "change", onPlateSelectChange);

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