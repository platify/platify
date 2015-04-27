// constants
var DIMENSION = 100;
var CELL_HEIGHT = 35;
var CELL_WIDTH = 75;
var data;
var plateModel = {};
var catLegend = {};
var groupNames = {};
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
function createBlankData() {
	var result = [];

	for (var i = 0; i < plateModel["grid_height"]; i++){
		result[i] = [];
		for (var j = 0; j < plateModel["grid_width"]; j++){
			result[i][j] = null;
		}
	}
	return result;
}

/**
 * A function that creates a random data set for displaying in the grid example
 * page. The data set is of dimension DIMENSION x DIMENSION.
 */
function createRandomData() {
	var result = [];
	for (var i = 0; i < plateModel["grid_height"]; i++){
		result[i] = [];
		for (var j = 0; j < plateModel["grid_width"]; j++){
			result[i][j] = "L" + Math.floor(Math.random()*100);
		}
	}
	return result;
}

/**
 * Loads a json plate model and updates the grid and category legend
 */
function loadJsonData(plateJson) {
	// translate the json received to the internal models structure
	plateModel = translateInputJsonToModel(plateJson);
	
	// create initial grid, based on template size
	if (plateModel["grid_width"] == null) {
		plateModel["grid_width"] = 100; // default value
	}
	
	if (plateModel["grid_height"] == null) {
		plateModel["grid_height"] = 100; // default value
	}
	
	createGrid();
	
	// load data into the grid
	for (var row in plateModel["rows"]) {
		for (var column in plateModel["rows"][row]["columns"]) {
		
			var wellgrp = plateModel["rows"][row]["columns"][column]["wellGroupName"];
			//groupNames[wellgrp] = "SOME_COMPOUND";
			groupNames[wellgrp] = "";
		
			var newContents = wellgrp;

			for (var catKey in plateModel["rows"][row]["columns"][column]["categories"]) {
				for (var labKey in plateModel["rows"][row]["columns"][column]["categories"][catKey]) {
					var color = plateModel["rows"][row]["columns"][column]["categories"][catKey][labKey]["color"];
					newContents += "," + color;
					
					// cat legend part !! --> only needed for assignlabels page ??
					// update catLegend color
					if (catLegend[catKey] == null) {
						catLegend[catKey] = {};
						catLegend[catKey]['labels'] = {};
						catLegend[catKey]['visible'] = true;
					}

					if (catLegend[catKey]['labels'][labKey] == null) {
						catLegend[catKey]['labels'][labKey] = {};
						catLegend[catKey]['labels'][labKey]['color'] = color;
					} else {
						catLegend[catKey]['labels'][labKey]['color'] = color;
						// category and label already exist, just changing color,
						// in this case cells which already have this label need their color updated also!!
						updateCellColors(catKey, labKey, color);
					}
					
					// update color legend cell reverse lookup
					if (catLegend[catKey]['labels'][labKey]["cellref"] == null) {
						catLegend[catKey]['labels'][labKey]["cellref"] = [];
						catLegend[catKey]['labels'][labKey]["cellref"].push(row + "-" + column);
					} else {
						if (catLegend[catKey]['labels'][labKey]["cellref"].indexOf(row + "-" + column) == -1) {
							catLegend[catKey]['labels'][labKey]["cellref"].push(row + "-" + column);
						} else {
							console.log("already there");
						}
					}
				}
			}
			
			grid.updateCellContents(row, column, newContents);
		}
	}
	
	updateCategoryList();
	updateCompoundList();
}

/**
 * A handler function for when the selected cells in the grid changes. This
 * function is registered to listen for these events in the createGrid
 * function using the registerSelectedCellsCallBack function of the Grid
 * Class. This function changes the background color of all selected cells
 * to the currentHighlightColor.
 */
function handleSelectedCells(startRow,startCol,endRow, endCol) {
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
function removeHighlightedArea() {
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
function removeAllHighlightedCells() {
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
function createGrid() {
	// construct the Grid object with the id of the html container element
	// where it should be placed (probably a div) as an argument
	grid = new Grid("myGrid");

	// set the data to be displayed which must be in 2D array form
	data = createBlankData();
	grid.setData(data);

	// display the data
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT);

	// register a function to be called each time a new set of cells are
	// selected by a user
	grid.registerSelectedCellCallBack(handleSelectedCells);
	
	enableGridSelection();
}

/**
 * This function loads random numeric data into the already created and
 * displayed Grid. It is a handler for the event that the "loadData" button
 * is clicked.
 */
function loadRandomData() {
	data = createRandomData();
	grid.setData(data);
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT);
}

function onCatColorChange() {
	var idArr = this.id.split("-");
	var cat = idArr[1];
	var label = idArr[2];
	updateCellColors(cat, label, this.value);	
}

function onCatVisCheck() {
	var idArr = this.id.split("-");
	var cat = idArr[1];
	catLegend[cat]['visible'] = this.checked;
	updateCatVisibility(cat);
}

function onEditLabelChange() {		// some issues here !! (when editing 1st label in cat, it actually changes 2nd !!)
	var idArr = this.id.split("-");
	tmpEditCat = idArr[1];
	tmpEditOldLabel = idArr[2];
	console.log("editLabel: "+ tmpEditCat + ";" + tmpEditOldLabel);
	$("#editLabelDialog").dialog("open");
}

function onDeleteLabelChange() {
	var idArr = this.id.split("-");
	var cat = idArr[1];
	var label = idArr[2];
	console.log("deleteLabel: "+ cat + ";" + label);
	removeLabel(cat, label)
}

function updateCellColors(cat, label, color) {
	// update all cells with cat and label (messy?)
	if (catLegend[cat] != undefined && catLegend[cat]['labels'][label] != undefined) {
		for (var cellRef in catLegend[cat]['labels'][label]["cellref"]) {			//change iteration method !!!
			// what are you doing here ??, define some sort of structure !!!
			var cellRefArr = catLegend[cat]['labels'][label]["cellref"][cellRef].split("-");
			var row = cellRefArr[0];
			var column = cellRefArr[1];
			plateModel["rows"][row]["columns"][column]["categories"][cat] = {};
			plateModel["rows"][row]["columns"][column]["categories"][cat][label] = {};
			plateModel["rows"][row]["columns"][column]["categories"][cat][label]["color"] = color;
			
			catLegend[cat]['labels'][label]['color'] = color;
			
			// update actual grid cell
			var newContents = plateModel["rows"][row]["columns"][column]["wellGroupName"];
			for (var catKey in plateModel["rows"][row]["columns"][column]["categories"]) {
				for (var labKey in plateModel["rows"][row]["columns"][column]["categories"][catKey]) {
					newContents += "," + plateModel["rows"][row]["columns"][column]["categories"][catKey][labKey]["color"];
				}
			}
			grid.updateCellContents(row, column, newContents);
		}
	}
}

function updateCatVisibility(cat) {
	// update all cells with cat
	if (catLegend[cat] != undefined) {
		for (var legLab in catLegend[cat]['labels']) {
			for (var cellRef in catLegend[cat]['labels'][legLab]["cellref"]) {
				
				var cellRefArr = catLegend[cat]['labels'][legLab]["cellref"][cellRef].split("-");
				var row = cellRefArr[0];
				var column = cellRefArr[1];
				
				// update actual grid cell
				var newContents = plateModel["rows"][row]["columns"][column]["wellGroupName"];
				for (var catKey in plateModel["rows"][row]["columns"][column]["categories"]) {
					if (catLegend[catKey]['visible'] == true) {
						for (var labKey in plateModel["rows"][row]["columns"][column]["categories"][catKey]) {
							newContents += "," + plateModel["rows"][row]["columns"][column]["categories"][catKey][labKey]["color"];
						}
					}
				}
				grid.updateCellContents(row, column, newContents);
			}
		}
	}
}

function createCompoundInput(wellGroup) {
	var newInput = document.createElement("input");
	newInput.id = "wellGroup-" + wellGroup;
	newInput.type = "text";
	//newInput.className = "btn-default";
	
	return newInput;
}

function createColorPicker(cat, label) {
	var cpDiv = document.createElement("span");
	var newInput = document.createElement("input");
	newInput.id = "color-" + cat + "-" + label;
	newInput.type = "color";
	newInput.className = "btn-default glyphicon color-p";
	newInput.defaultValue = catLegend[cat]['labels'][label]['color'];
	newInput.value = catLegend[cat]['labels'][label]['color'];
	//newInput.onchange = onCatColorChange;
	
	var editLabelBtn = document.createElement("button");
	editLabelBtn.id = "edit-" + cat + "-" + label;
	editLabelBtn.type = "button";
	editLabelBtn.className = "btn btn-default btn-xs glyphicon glyphicon-pencil";
	//editLabelBtn.onclick = onEditLabelChange;
	
	var deleteLabelBtn = document.createElement("button");
	deleteLabelBtn.id = "delete-" + cat + "-" + label;
	deleteLabelBtn.type = "button";
	deleteLabelBtn.value = "Delete Label"
	deleteLabelBtn.className = "btn btn-default btn-xs glyphicon glyphicon-trash";
	//deleteLabelBtn.onclick = onDeleteLabelChange;
	
	cpDiv.appendChild(newInput);
	cpDiv.appendChild(editLabelBtn);
	cpDiv.appendChild(deleteLabelBtn);
	
	return cpDiv;
}

function updateCompoundList() {
	var newDiv = document.createElement("div");
	for (var wellGroup in groupNames) {
		var innerDiv = document.createElement("div");
		innerDiv.className = "col-xs-12";
		var newLabel = document.createElement("label");
		newLabel.appendChild(document.createTextNode(wellGroup));
		
		var newInput = createCompoundInput(wellGroup);
		innerDiv.appendChild(newLabel);
		innerDiv.appendChild(newInput);
		newDiv.appendChild(innerDiv);
	}
	document.getElementById("compoundList").innerHTML = newDiv.innerHTML;
	
	// won't seem to take value for input until created ??
	for (var wellGroup in groupNames) {
		if (groupNames[wellGroup] != null) {
			document.getElementById("wellGroup-" + wellGroup).value = groupNames[wellGroup];
		}
	}
}

function updateCategoryList() {
	var newDiv = document.createElement("div");
	for (var catKey in catLegend) {
		newDiv.appendChild(createCatLabel(catKey));
		for (var labelKey in catLegend[catKey]['labels']) {
			var newLi = document.createElement("div");
			// if label has been converted from a decimal, then convert it back for display!!
			var convLab = labelKey.toString().split('__dot__').join('.');
			newLi.appendChild(document.createTextNode(convLab));
			
			var newInput = createColorPicker(catKey, labelKey);
			newLi.appendChild(newInput);
			newDiv.appendChild(newLi);
		}
	}
	document.getElementById("categoryList").innerHTML = newDiv.innerHTML;
	
	// apply events with a redundant nested loop. only seems to work when part of dom. fix!!(remove loop)
	for (var catKey in catLegend) {
		$("#vischeck-" + catKey).attr('checked', 'checked');
		$("#vischeck-" + catKey).change(onCatVisCheck);
		for (var labelKey in catLegend[catKey]['labels']) {
			$("#color-" + catKey + "-" + labelKey).change(onCatColorChange);
			$("#edit-" + catKey + "-" + labelKey).click(onEditLabelChange);
			$("#delete-" + catKey + "-" + labelKey).click(onDeleteLabelChange);
		}
	}
}

function updatePlateLabelList() {
	var pLabels = plateModel["labels"];
	var newDiv = document.createElement("div");
	
	for (var i = 0; i < pLabels.length; i++) {
		var newH = document.createElement("H5");
		newH.appendChild(document.createTextNode(pLabels[i].category + ": "));	// should null check !
		newH.appendChild(document.createTextNode(pLabels[i].name));
		newDiv.appendChild(newH);
	}

	document.getElementById("plateLabelList").innerHTML = newDiv.innerHTML;
}


function createCatLabel(catKey) {
	var labDiv = document.createElement("div");
	labDiv.className = "button-labels";
	var newCheckbox = document.createElement("input");
	newCheckbox.type = "checkbox";
	newCheckbox.checked = true;
	newCheckbox.id = "vischeck-" + catKey;
	labDiv.appendChild(newCheckbox);
	var newLabel = document.createElement("label");
	newLabel.setAttribute("for", "vischeck-" + catKey);
	// if category has been converted from a decimal, then convert it back for display!!
	var convCat = catKey.toString().split('__dot__').join('.');
	newLabel.appendChild(document.createTextNode(convCat));
	labDiv.appendChild(newLabel);
	
	return labDiv;
}

function enableGridSelection() {
	if (grid != null) {
		grid.enableCellSelection();
	}
}

function disableGridSelection() {
	if (grid != null) {
		removeAllHighlightedCells();
		grid.disableCellSelection();
	}
}

// remove and cleanup references to cat and label
function removeLabel(cat, label) {
	delete catLegend[cat]['labels'][label]['color'];
	
	// remove all cells with cat and label (messy?)
	for (var cellRef in catLegend[cat]['labels'][label]["cellref"]) {			//change iteration method !!!
		// what are you doing here ??, define some sort of structure !!!
		var cellRefArr = catLegend[cat]['labels'][label]["cellref"][cellRef].split("-");
		var row = cellRefArr[0];
		var column = cellRefArr[1];

		delete plateModel["rows"][row]["columns"][column]["categories"][cat];
		
		// update actual grid cell
		var newContents = plateModel["rows"][row]["columns"][column]["wellGroupName"];
		for (var catKey in plateModel["rows"][row]["columns"][column]["categories"]) {
			for (var labKey in plateModel["rows"][row]["columns"][column]["categories"][catKey]) {
				newContents += "," + plateModel["rows"][row]["columns"][column]["categories"][catKey][labKey]["color"];
			}
		}
		grid.updateCellContents(row, column, newContents);
	}
	
	// remove from color legend cell reverse lookup
	delete catLegend[cat]['labels'][label];
	
	if (Object.keys(catLegend[cat]['labels']).length == 0) {
		delete catLegend[cat];
	}
	
	// referesh category elements
	updateCategoryList();
}

// remove and cleanup references to cat and label
function updateLabelName(cat, oldLabel, label) {	// should we allow for change of category also ??
	// remove spaces from the names (replacing with '_')
	cat = cat.toString().split(' ').join('_');
	label = label.toString().split(' ').join('_');
	
	// remove decimal point from the names (replacing with '_|_')
	cat = cat.toString().split('.').join('__dot__');
	label = label.toString().split('.').join('__dot__');
	
	// update color legend cell reverse lookup				
	if (catLegend[cat]['labels'][label] == null) {
		//catLegend[cat][label] = {};
		//catLegend[cat][label]["cellref"] = [];
		catLegend[cat]['labels'][label] = catLegend[cat]['labels'][oldLabel];

		console.log("Old color:"+catLegend[cat]['labels'][oldLabel]['color']);
		console.log("New color:"+catLegend[cat]['labels'][label]['color']);
		// remove old label
		delete catLegend[cat]['labels'][oldLabel];
		
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
	console.log("selcells="+selCells);
	var cat = "dosage";
	
	var topDose = document.getElementById("topDoseValue").value;
	var units = document.getElementById("doseStepUnits").value;
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
			createNewLabel(cat, currentDose, units, currentColor, [selCells[i+j]]);
		}
		i += (replicates-1);
		currentColor = shade(currentColor, 0.2); // should we use 1/dilution instead ?? (might be too dramatic a difference !!
		currentDose = currentDose / dilution;
	}
				
	updateCategoryList();
	removeAllHighlightedCells();
}

function createNewLabel(cat, label, units, color, applyToCells) {
	// remove spaces from the names (replacing with '_')
	cat = cat.toString().split(' ').join('_');
	label = label.toString().split(' ').join('_');
	
	// remove decimal point from the names (replacing with '_|_')
	cat = cat.toString().split('.').join('__dot__');
	label = label.toString().split('.').join('__dot__');
	
	// update catLegend color
	if (catLegend[cat] == null) {
		catLegend[cat] = {};
		catLegend[cat]['labels'] = {};
		catLegend[cat]['visible'] = true;
	}
	
	if (catLegend[cat]['labels'][label] == null) {
		catLegend[cat]['labels'][label] = {};
		catLegend[cat]['labels'][label]['color'] = color;
	} else {
		catLegend[cat]['labels'][label]['color'] = color;
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
		
		if (plateModel["rows"][row]["columns"][column]["wellGroupName"] == null) {
			// shouldn't real be neccessary if json is loaded at init
			//plateModel["rows"][row]["columns"][column]["wellGroupName"] = data[row-1][column-1];
			plateModel["rows"][row]["columns"][column]["wellGroupName"] = "-";
		}
		
		// the case where we are overwriting a cell with a new value for the same category
		if (plateModel["rows"][row]["columns"][column]["categories"][cat] != null) {
			// if that is the case we should remove the old reference to the cell in the catLegend cellref
			for (var oldLab in plateModel["rows"][row]["columns"][column]["categories"][cat]) {
				var pos = catLegend[cat]['labels'][oldLab]["cellref"].indexOf(row + "-" + column);
				if (pos != -1) {
					catLegend[cat]['labels'][oldLab]["cellref"].splice(pos, 1);
				}
			}
		}
		
		plateModel["rows"][row]["columns"][column]["categories"][cat] = {};
		plateModel["rows"][row]["columns"][column]["categories"][cat][label] = {};
		plateModel["rows"][row]["columns"][column]["categories"][cat][label]["color"] = color;
		plateModel["rows"][row]["columns"][column]["categories"][cat][label]["units"] = units;
		var newContents = plateModel["rows"][row]["columns"][column]["wellGroupName"];

		for (var catKey in plateModel["rows"][row]["columns"][column]["categories"]) {
			for (var labKey in plateModel["rows"][row]["columns"][column]["categories"][catKey]) {
				newContents += "," + plateModel["rows"][row]["columns"][column]["categories"][catKey][labKey]["color"];
			}
		}
		
		grid.updateCellContents(row, column, newContents);
		
		// update color legend cell reverse lookup
		if (catLegend[cat]['labels'][label]["cellref"] == null) {
			catLegend[cat]['labels'][label]["cellref"] = [];
			catLegend[cat]['labels'][label]["cellref"].push(row + "-" + column);
		} else {
			if (catLegend[cat]['labels'][label]["cellref"].indexOf(row + "-" + column) == -1) {
				catLegend[cat]['labels'][label]["cellref"].push(row + "-" + column);
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
	var selCells = highlightedCoords;
	console.log(selCells);
	var cat = document.getElementById("newCatValue").value;
	var label = document.getElementById("newLabelValue").value;
	var color = document.getElementById("newColorValue").value;
	
	createNewLabel(cat, label, "", color, selCells);
	
	updateCategoryList();
	// output current object model to console
	console.log("plateModel:" + JSON.stringify(plateModel));
	console.log("catLegend:" + JSON.stringify(catLegend));
	
	var jsonplate = translateModelToOutputJson(plateModel);
	console.log("jsonplate:" + JSON.stringify(jsonplate));
	removeAllHighlightedCells();
}

function addNewPlateLabel() {
	var cat = document.getElementById("newPlateCatValue").value;
	var label = document.getElementById("newPlateLabelValue").value;
	
	if (plateModel["labels"] == null) {
		plateModel["labels"] = [];
	}
	
	var pLabel = {};
	pLabel.category = cat;
	pLabel.name = label;
	
	plateModel["labels"].push(pLabel);
	
	updatePlateLabelList();
}

/**
 * This function changes the style of a particular cell
 */
function addNewDose() {
	var selCells = highlightedCoords;
	console.log(selCells);
	var cat = "dosage";
	var label = document.getElementById("newDoseValue").value;
	var units = document.getElementById("newDoseUnits").value;
	var color = document.getElementById("newDoseColorValue").value;
	
	createNewLabel(cat, label, units, color, selCells);
	
	updateCategoryList();

	// output current object model to console
	console.log("plateModel:" + JSON.stringify(plateModel));
	console.log("catLegend:" + JSON.stringify(catLegend));
	
	var jsonplate = translateModelToOutputJson(plateModel);
	console.log("jsonplate:" + JSON.stringify(jsonplate));
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

	if (typeof(elementId) === "string") {
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
 * importCompoundsFromFile - Reads compounds from a local list, maps them to
 * well groupings for the current plate.
 */
function importCompoundsFromFile() {
    var importForm = $('#importCompoundsForm')[0];
    var fileInput = $('#compoundsFile')[0];
    var reader = new FileReader();
    reader.onload = function (progressEvent) {
        var parsed = Papa.parse(progressEvent.target.result,
                                {skipEmptyLines: true});
        switch (parsed.data[0].length) {
            case 1:
                Object.keys(groupNames).forEach(function (group) { groupNames[group] = null; });
                var compounds = parsed.data.map(function (obj) { return obj[0] });
                Object.keys(groupNames).forEach(function (group, i) {
                    groupNames[group] = compounds[i];
                });
                break;

            case 2:
                Object.keys(groupNames).forEach(function (group) { groupNames[group] = null; });
                parsed.data.forEach(function (row) {
                    groupNames[row[0]] = row[1];
                });
                break;

            default:
                alert('Compounds file can contain 1 column (matched in order) or 2 columns (first is well grouping, second is compound), but no more');
                return;
        }
        updateCompoundList();
        importForm.reset();
    };
    // TODO - check for loaded file
    reader.readAsText($('#compoundsFile')[0].files[0]);
}

// ajax save object call
function saveConfigToServer() {
	var plateJson = translateModelToOutputJson(plateModel);
	console.log("SendingToServer: " + JSON.stringify(plateJson));
   
	var jqxhr = $.ajax({		// need to update to save plate instead of template
		url: hostname + "/plate/save",
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
		console.log( "second complete" );
		console.log("result=" + JSON.stringify(resData));
		
		if (resData["plate"] !=null &&  resData["plate"]["id"] != null) {
			//plateModel["templateID"] = resData["plateTemplate"]["id"];
			// use less hacky method !!
			window.location.href = hostname + "/experimentalPlateSet/showactions/" + window.expId;
		} else {
			alert("An error while saving the template!");
		}
	});
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
		console.log("recievedFromServer:  " + JSON.stringify(resData));
		loadJsonData(resData);
	});
}


/**
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers on the
 */
function init() {
	hidePlateLabelCatPanel();
	hideDosePanel();
	hideDoseStepPanel();
	hidePlateLabelPanel();
	
	// fetch templateJson
	fetchTemplateData(window.templateId); // should set flag to say if recieved model was ok!, inform user otherwise
	console.log("templateId:" + window.templateId);

	addEvent("addNewLabel", "click", addNewLabel);
	addEvent("addNewDose", "click", addNewDose);
	addEvent("addDoseStep", "click", addDoseStep);
	addEvent("addNewPlateLabel", "click", addNewPlateLabel);
	addEvent("clearAllSelection", "click", removeAllHighlightedCells);

	enableGridSelection();
}

window.onload = init;

//data format translation
function translateModelToOutputJson(pModel) {
	var plateJson = {};
	var plate = {}
	plate["name"] = pModel["name"];
	plate["width"] = pModel["grid_width"];
	plate["height"] = pModel["grid_height"];
	plate["experimentID"] = window.expId;
	plate["templateID"] = window.templateId;
		
	plate["plateID"] = document.getElementById("barcode").value;
	plate["wells"] = [];
	
	if (pModel["labels"] != null) {
		plate["labels"] = pModel["labels"];
	} else {
		plate["labels"] = [];
	}
	
	// take the values from the compound input text fields (could do this at input onChange event also)
	for (var wellGroup in groupNames) {
		if (groupNames[wellGroup] != null) {
			var cmpdValue = document.getElementById("wellGroup-" + wellGroup).value;
			if (cmpdValue == null || cmpdValue == "") {
				// !!! THROW ERROR DIALOG HERE ASKING TO FILL OUT THIS FIELD !!!
				groupNames[wellGroup] = "SOME_COMPOUND";
			} else {
				groupNames[wellGroup] = cmpdValue;
			}
		}
	}
	
	// 
	for (var row in pModel["rows"]) {
		for (var column in pModel["rows"][row]["columns"]) {
			var well = {};
			well["row"] = row;
			well["column"] = column;
			
			well["groupName"] = pModel["rows"][row]["columns"][column]["wellGroupName"];
			var labels = [];
			for (var catKey in pModel["rows"][row]["columns"][column]["categories"]) {
				for (var labKey in pModel["rows"][row]["columns"][column]["categories"][catKey]) {
					var label = {};
					// if catKey, or labKey have been converted from a decimal, convert them back for output!
					var convCat = catKey.toString().split('__dot__').join('.');
					var convLab = labKey.toString().split('__dot__').join('.');
					label["category"] = convCat;
					label["name"] = convLab;
					label["value"] = pModel["rows"][row]["columns"][column]["categories"][catKey][labKey]["color"];
					label["units"] = pModel["rows"][row]["columns"][column]["categories"][catKey][labKey]["units"];
					labels.push(label);
				}
			}
			
			if (well["groupName"] != null) {
				var label = {};
				label["category"] = "compound";
				label["name"] = groupNames[well["groupName"]];
				labels.push(label);
				
				well["control"] = "compound";		// could also be a control !!!
			} else {
				well["control"] = "empty";
			}			
			well["labels"] = labels;
			plate["wells"].push(well);
		}
	}
	plateJson["plate"] = plate;
	return plateJson;
}

// data format translation
function translateInputJsonToModel(plateJson) {
	var pModel = {};
	groupNames = {};
	pModel["rows"] = {};
	var plate = plateJson["plate"];
	
	if (plateJson["labels"] != null) {
		pModel["labels"] = plateJson["labels"];
	} else {
		pModel["labels"] = [];
	}
	
	pModel["name"] = plate["name"];			// should also copy expId and plateId at this point !!
	pModel["grid_width"] = plate["width"];
	pModel["grid_height"] = plate["height"];
	
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
			// convert possible disruptive input to safer format !
			var convCat = labels[j].category.toString().split('.').join('__dot__');
			var convLab = labels[j].name.toString().split('.').join('__dot__');
			
			if (convCat == "compound") {
				// deal with special 'compound' category !
				groupNames[groupName] = convLab;		// should do null check ??
				
			} else {
				// other labels
				if (pModel["rows"][row]["columns"][column]["categories"][convCat] == null) {
					pModel["rows"][row]["columns"][column]["categories"][convCat] = {};
				}
				
				if (pModel["rows"][row]["columns"][column]["categories"][convCat][convLab] == null) {
					pModel["rows"][row]["columns"][column]["categories"][convCat][convLab] = {};
				}
				pModel["rows"][row]["columns"][column]["categories"][convCat][convLab]["color"] = labels[j].value;
				pModel["rows"][row]["columns"][column]["categories"][convCat][convLab]["units"] = labels[j].units;
			}
		}
	}

	return pModel;
}


// jQuery ui stuff
$(function() {	

	$("input[name=labeltype]").on("change", function () {
	    if ($(this).prop('id') == "catLabType") {
	    	showLabelPanel();
	    } else if ($(this).prop('id') == "doseLabType") {
	    	showDosePanel();
	    } else if ($(this).prop('id') == "doseStepLabType") {
	    	showDoseStepPanel();
	    } else if ($(this).prop('id') == "plateLabType") {
	    	showPlateLabelPanel();
	    } 
	});
	
	$('[data-toggle="popover"]').popover({
		trigger: 'hover',
			'placement': 'top'
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

function txtFieldFocus() {
	if ($("#addLabelPanel").is(":visible")) {
		$("#newCatValue").focus();
	} else if ($("#addDosePanel").is(":visible")) {
		$("#topDoseValue").focus();
	}
};

function showLabelPanel() {
	hideDosePanel();
	hideDoseStepPanel();
	hidePlateLabelPanel();
	hidePlateLabelCatPanel();
	$("#addLabelPanel").show();
	enableGridSelection();
	showCategoryPanel();
};

function showDosePanel() {
	hideLabelPanel();
	hideDoseStepPanel();
	hidePlateLabelPanel();
	hidePlateLabelCatPanel();
	$("#addDosePanel").show();
	enableGridSelection();
	showCategoryPanel();
};

function showDoseStepPanel() {
	hideLabelPanel();
	hideDosePanel();
	hidePlateLabelPanel();
	hidePlateLabelCatPanel();
	$("#addDoseStepPanel").show();
	enableGridSelection();
	showCategoryPanel();
};

function showPlateLabelPanel() {
	hideLabelPanel();
	hideDosePanel();
	hideDoseStepPanel();
	hideCategoryPanel();
	$("#addPlateLabelPanel").show();
	
	// disable grid selection !! (labels only apply to plate level)
	disableGridSelection();
	showPlateLabelCatPanel();
};

function showCategoryPanel() {
	$("#categoryPanel").show();
};

function showPlateLabelCatPanel() {
	$("#plateLabelCatPanel").show();
};

function hideLabelPanel() {
	$("#addLabelPanel").hide();
};

function hideDosePanel() {
	$("#addDosePanel").hide();
};

function hideDoseStepPanel() {
	$("#addDoseStepPanel").hide();
};

function hidePlateLabelPanel() {
	$("#addPlateLabelPanel").hide();
};

function hideCategoryPanel() {
	$("#categoryPanel").hide();
};

function hidePlateLabelCatPanel() {
	$("#plateLabelCatPanel").hide();
};
