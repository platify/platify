// constants
var DIMENSION = 100;
var CELL_HEIGHT = 50;
var CELL_WIDTH = 150;
var data;
//var categories = {};	// note declaring as an object ???
var plateModel = {};
var catLegend = {};
var grid;
var currentHighlightKeys = [];
var highlightKeyCounter = 0;
var currentHighlightColor = "#D5E3E3";
var highlightedCoords = [];

// tmp editlabel vars
var tmpEditOldLabel;
var tmpEditCat;

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

/**
 * This function loads random numeric data into the already created and
 * displayed Grid. It is a handler for the event that the "loadData" button
 * is clicked.
 */
function loadRandomData(){
	data = createRandomData();
	grid.setData(data);
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT);
}

function onCatColorChange(){
	var idArr = this.id.split("-");
	var cat = idArr[1];
	var label = idArr[2];
	updateCellColors(cat, label, this.value);	
}

function onEditLabelChange(){		// some issues here !! (when editing 1st label in cat, it actually changes 2nd !!)
	var idArr = this.id.split("-");
	tmpEditCat = idArr[1];
	tmpEditOldLabel = idArr[2];
	console.log("editLabel: "+ tmpEditCat + ";" + tmpEditOldLabel);
	$("#editLabelDialog").dialog("open");
}

function onDeleteLabelChange(){
	var idArr = this.id.split("-");
	var cat = idArr[1];
	var label = idArr[2];
	console.log("deleteLabel: "+ cat + ";" + label);
	removeLabel(cat, label)
}

function updateCellColors(cat, label, color) {
	// update all cells with cat and label (messy?)
	if (catLegend[cat] != undefined && catLegend[cat][label] != undefined) {
		for (var cellRef in catLegend[cat][label]["cellref"]) {			//change iteration method !!!
			// what are you doing here ??, define some sort of structure !!!
			var cellRefArr = catLegend[cat][label]["cellref"][cellRef].split("-");
			var row = cellRefArr[0];
			var column = cellRefArr[1];
			plateModel["rows"][row]["columns"][column]["categories"][cat] = {};
			plateModel["rows"][row]["columns"][column]["categories"][cat][label] = color;
			
			catLegend[cat][label]['color'] = color;
			
			// update actual grid cell
			var newContents = plateModel["rows"][row]["columns"][column]["wellGroupName"];
			for (var catKey in plateModel["rows"][row]["columns"][column]["categories"]) {
				for (var labKey in plateModel["rows"][row]["columns"][column]["categories"][catKey]) {
					newContents += "," + plateModel["rows"][row]["columns"][column]["categories"][catKey][labKey];
				}
			}
			grid.updateCellContents(row, column, newContents);
		}
	}
}

function createColorPicker(cat, label) {
	var cpDiv = document.createElement("span");
	var newInput = document.createElement("input");
	newInput.id = "color-" + cat + "-" + label;
	newInput.type = "color";
	newInput.defaultValue = catLegend[cat][label]['color'];
	newInput.value = catLegend[cat][label]['color'];
	//newInput.onchange = onCatColorChange;
	
	var editLabelBtn = document.createElement("input");
	editLabelBtn.id = "edit-" + cat + "-" + label;
	editLabelBtn.type = "button";
	editLabelBtn.value = "Edit Label"
	//editLabelBtn.onclick = onEditLabelChange;
	
	var deleteLabelBtn = document.createElement("input");
	deleteLabelBtn.id = "delete-" + cat + "-" + label;
	deleteLabelBtn.type = "button";
	deleteLabelBtn.value = "Delete Label"
	//deleteLabelBtn.onclick = onDeleteLabelChange;
	
	cpDiv.appendChild(newInput);
	cpDiv.appendChild(editLabelBtn);
	cpDiv.appendChild(deleteLabelBtn);
	
	return cpDiv;
}

function updateCategoryList() {
	var newDiv = document.createElement("div");
	var newH3 = document.createElement("h3");
	var h3Text = document.createTextNode('Categories:');
	newH3.appendChild(h3Text);
	newDiv.appendChild(newH3);
	for (var catKey in catLegend) {
		var newUl = document.createElement("ul");
		var newStrong = document.createElement("strong");
		newStrong.appendChild(document.createTextNode(catKey));
		newDiv.appendChild(newStrong);
		for (var labelKey in catLegend[catKey]) {
			var newLi = document.createElement("li");
			newLi.appendChild(document.createTextNode(labelKey));
			var newInput = createColorPicker(catKey, labelKey);
			newLi.appendChild(newInput);
			newUl.appendChild(newLi);
		}
		newDiv.appendChild(newUl);
	}
	document.getElementById("categoryList").innerHTML = newDiv.innerHTML;
	
	// apply events with a redundant nested loop. only seems to work when part of dom. fix!!(remove loop)
	for (var catKey in catLegend) {
		for (var labelKey in catLegend[catKey]) {
			$("#color-" + catKey + "-" + labelKey).change(onCatColorChange);
			$("#edit-" + catKey + "-" + labelKey).click(onEditLabelChange);
			$("#delete-" + catKey + "-" + labelKey).click(onDeleteLabelChange);
		}
	}
}

function enableGridSelection() {
	removeAllHighlightedCells();
	grid.enableCellSelection();
}

function disableGridSelection() {
	removeAllHighlightedCells();
	grid.disableCellSelection();
}

function cancelNewLabel() {
	hideLabelPanel();
}

function cancelDoseStep() {
	hideDosePanel();
}

// remove and cleanup references to cat and label
function removeLabel(cat, label) {
	delete catLegend[cat][label]['color'];
	
	// remove all cells with cat and label (messy?)
	for (var cellRef in catLegend[cat][label]["cellref"]) {			//change iteration method !!!
		// what are you doing here ??, define some sort of structure !!!
		var cellRefArr = catLegend[cat][label]["cellref"][cellRef].split("-");
		var row = cellRefArr[0];
		var column = cellRefArr[1];

		delete plateModel["rows"][row]["columns"][column]["categories"][cat];
		
		// update actual grid cell
		var newContents = plateModel["rows"][row]["columns"][column]["wellGroupName"];
		for (var catKey in plateModel["rows"][row]["columns"][column]["categories"]) {
			for (var labKey in plateModel["rows"][row]["columns"][column]["categories"][catKey]) {
				newContents += "," + plateModel["rows"][row]["columns"][column]["categories"][catKey][labKey];
			}
		}
		grid.updateCellContents(row, column, newContents);
	}
	
	// remove from color legend cell reverse lookup
	delete catLegend[cat][label];
	
	// referesh category elements
	updateCategoryList();
}

// remove and cleanup references to cat and label
function updateLabelName(cat, oldLabel, label) {	// should we allow for change of category also ??
	// update color legend cell reverse lookup				
	if (catLegend[cat][label] == null) {
		//catLegend[cat][label] = {};
		//catLegend[cat][label]["cellref"] = [];
		catLegend[cat][label] = catLegend[cat][oldLabel];

		console.log("Old color:"+catLegend[cat][oldLabel]['color']);
		console.log("New color:"+catLegend[cat][label]['color']);
		// remove old label
		delete catLegend[cat][oldLabel];
		
		// referesh category elements
		updateCategoryList();
	} else {
		// other label already exists , can't rename on label to another existing label !!
		// throw exception or something !!!
		// ERROR!!
		console.log("stop it !");
	}
}

// code sample from http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function shadeColor2(color, percent) {   
	var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
	return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function shade(color, percent) {
	if (color.length > 7 ) {
		return shadeRGBColor(color,percent);
	} else {
		return shadeColor2(color,percent);
	}
}

// SOME ISSUE OCCURS with dose step (Problem is with'.' in the name of label !!)
// replicates is realistically off by 1 probably as it should start at zero ??
function addDoseStep() {
	var selCells = highlightedCoords;
	console.log(selCells);
	var cat = "dosage";
	
	var topDose = document.getElementById("topDoseValue").value;
	var dilution = document.getElementById("stepDilutionValue").value;
	var replicates = document.getElementById("replicatesValue").value;
	var topColor = document.getElementById("tDoseColorValue").value;
	
	var wellGroupLength = selCells.length;
	var doseStepLength = wellGroupLength/replicates;		// need some validation !!
	var currentDose = topDose;
	var currentColor = topColor;
	
	for (var i = 0; i < wellGroupLength; i++) {
		for (var j = 0; j < replicates; j++) {
			console.log("i+j:" + (i+j));
			createNewLabel(cat, currentDose, currentColor, [selCells[i+j]]);
		}
		i += (replicates-1);
		currentColor = shade(currentColor, 0.2); // should we use 1/dilution instead ?? (might be too dramatic a difference !!
		currentDose = currentDose / dilution;
	}
				
	updateCategoryList();
	// disable selection of grid cells
	hideDosePanel();
}

function createNewLabel(cat, label, color, applyToCells) {
	// update catLegend color
	if (catLegend[cat] == null) {
		catLegend[cat] = {};
	}
	
	if (catLegend[cat][label] == null) {
		catLegend[cat][label] = {};
		catLegend[cat][label]['color'] = color;
	} else {
		catLegend[cat][label]['color'] = color;
		// category and label already exist, just changing color,
		// in this case cells which already have this label need their color updated also!!
		updateCellColors(cat, label, color);
	}
	
	// update selected grid cells with label
	for (var cell in applyToCells) {
		var row = applyToCells[cell][0];		// change iteration method !!!
		var column = applyToCells[cell][1];
		
		// messy hack	--> maybe not so bad for efficiency actually ?
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
			plateModel["rows"][row]["columns"][column]["categories"] = {};
		}
		
		plateModel["rows"][row]["columns"][column]["wellGroupName"] = data[row-1][column-1];
		plateModel["rows"][row]["columns"][column]["categories"][cat] = {};
		plateModel["rows"][row]["columns"][column]["categories"][cat][label] = color;
		var newContents = plateModel["rows"][row]["columns"][column]["wellGroupName"];

		for (var catKey in plateModel["rows"][row]["columns"][column]["categories"]) {
			for (var labKey in plateModel["rows"][row]["columns"][column]["categories"][catKey]) {
				newContents += "," + plateModel["rows"][row]["columns"][column]["categories"][catKey][labKey];
			}
		}
		
		grid.updateCellContents(row,column, newContents);
		
		// update color legend cell reverse lookup
		if (catLegend[cat][label]["cellref"] == null) {
			catLegend[cat][label]["cellref"] = [];
			catLegend[cat][label]["cellref"].push(row + "-" + column);
		} else {
			if (catLegend[cat][label]["cellref"].indexOf(row + "-" + column) == -1) {
				catLegend[cat][label]["cellref"].push(row + "-" + column);
			} else {
				console.log("already there");
			}
		}
	}
}

/**
 * This function changes the style of a particular cell
 */
function addNewLabel() {
	//var selCells = grid.getSelectedCells();
	var selCells = highlightedCoords;
	console.log(selCells);
	var cat = document.getElementById("newCatValue").value;
	var label = document.getElementById("newLabelValue").value;
	var color = document.getElementById("newColorValue").value;
	
	createNewLabel(cat, label, color, selCells);
	
	updateCategoryList();
	// disable selection of grid cells
	hideLabelPanel();
	// output current object model to console
	console.log("plateModel:" + JSON.stringify(plateModel));
	console.log("catLegend:" + JSON.stringify(catLegend));
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
	loadRandomData();
	addEvent("addNewLabel", "click", addNewLabel);
	addEvent("cancelNewLabel", "click", cancelNewLabel);
	addEvent("clearLastSelection", "click", removeHighlightedArea);
	addEvent("clearAllSelection", "click", removeAllHighlightedCells);
	addEvent("addDoseStep", "click", addDoseStep);
	addEvent("cancelDoseStep", "click", cancelDoseStep);
	addEvent("clearLastSelectionD", "click", removeHighlightedArea);	// duplication !!
	addEvent("clearAllSelectionD", "click", removeAllHighlightedCells);	// duplication !!

	// initially disable selection of grid cells
	disableGridSelection();
}

window.onload = init;

// jQuery ui stuff
$(function() {
	$( "#tabs-1" ).tabs();
	
	$("#addLabelPanel").hide();
		
	$("#addLabelButton").click(function() {
		showLabelPanel();
	});
	
	$("#addDosePanel").hide();
		
	$("#addDoseStepButton").click(function() {
		showDosePanel();
	});
	
	
	$("#editLabelDialog").dialog({
		autoOpen: false,
		resizable: false,
		height:140,
		modal: true,
		buttons: {
			"Save New Name": function() {
				updateLabelName(tmpEditCat, tmpEditOldLabel, document.getElementById("editNewLabelValue").value);
				delete tmpEdit;
				delete tmpEditOldLabel;
				$(this).dialog("close");
			},
			Cancel: function() {
				delete tmpEdit;
				delete tmpEditOldLabel;
				$(this).dialog("close");
			}
		}
	});
});

function showLabelPanel() {
	hideDosePanel();
	enableGridSelection();
	$("#addLabelPanel").show("drop", {direction: "right"}, 500 );
};

function hideLabelPanel() {
	disableGridSelection();
	$("#addLabelPanel").hide("drop", {direction: "right"}, 500 );
};

function showDosePanel() {
	hideLabelPanel();
	enableGridSelection();
	$("#addDosePanel").show("drop", {direction: "right"}, 500 );
};

function hideDosePanel() {
	disableGridSelection();
	$("#addDosePanel").hide("drop", {direction: "right"}, 500 );
};