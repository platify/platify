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
function createRandomData() {
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
	
	plateModel = translateInputJsonToModel(plateJson);

	for (var row in plateModel["rows"]) {
		for (var column in plateModel["rows"][row]["columns"]) {
		
			var wellgrp = plateModel["rows"][row]["columns"][column]["wellGroupName"];
			groupNames[wellgrp] = "SOME_COMPOUND";
		
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
	newInput.className = "btn-default";
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
}

function updateCategoryList() {
	var newDiv = document.createElement("div");
	for (var catKey in catLegend) {
		var newUl = document.createElement("ul");
		
		newDiv.appendChild(createCatLabel(catKey));
		
		for (var labelKey in catLegend[catKey]['labels']) {
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
		$("#vischeck-" + catKey).attr('checked', 'checked');
		$("#vischeck-" + catKey).change(onCatVisCheck);
		for (var labelKey in catLegend[catKey]['labels']) {
			$("#color-" + catKey + "-" + labelKey).change(onCatColorChange);
			$("#edit-" + catKey + "-" + labelKey).click(onEditLabelChange);
			$("#delete-" + catKey + "-" + labelKey).click(onDeleteLabelChange);
		}
	}
}


function createCatLabel(catKey) {
	var newStrong = document.createElement("strong");
	var newCheckbox = document.createElement("input");
	newCheckbox.type = "checkbox";
	newCheckbox.checked = true;
	newCheckbox.id = "vischeck-" + catKey;
	newStrong.appendChild(newCheckbox);
	newStrong.appendChild(document.createTextNode(catKey));
	
	return newStrong;
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
	
	// referesh category elements
	updateCategoryList();
}

// remove and cleanup references to cat and label
function updateLabelName(cat, oldLabel, label) {	// should we allow for change of category also ??
	// remove spaces from the names (replacing with '_')
	cat = cat.split(' ').join('_');
	label = label.split(' ').join('_');
	
	// remove decimal point from the names (replacing with '_|_')
	cat = cat.split('.').join('__dot__');
	label = label.split('.').join('__dot__');
	
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
	// disable selection of grid cells
	//hideDosePanel();
	removeAllHighlightedCells();
}

function createNewLabel(cat, label, units, color, applyToCells) {
	// remove spaces from the names (replacing with '_')
	cat = cat.split(' ').join('_');
	label = label.split(' ').join('_');
	
	// remove decimal point from the names (replacing with '_|_')
	cat = cat.split('.').join('__dot__');
	label = label.split('.').join('__dot__');
	
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
	//var selCells = grid.getSelectedCells();
	var selCells = highlightedCoords;
	console.log(selCells);
	var cat = document.getElementById("newCatValue").value;
	var label = document.getElementById("newLabelValue").value;
	var color = document.getElementById("newColorValue").value;
	
	createNewLabel(cat, label, "", color, selCells);
	
	updateCategoryList();
	// disable selection of grid cells
	//hideLabelPanel();
	// output current object model to console
	console.log("plateModel:" + JSON.stringify(plateModel));
	console.log("catLegend:" + JSON.stringify(catLegend));
	
	var jsonplate = translateModelToOutputJson(plateModel);
	console.log("jsonplate:" + JSON.stringify(jsonplate));
	removeAllHighlightedCells();
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

// ajax save object call
function saveConfigToServer() {
	var plateJson = translateModelToOutputJson(plateModel);
	console.log(JSON.stringify(plateJson));
   
	var jqxhr = $.ajax({		// need to update to save plate instead of template
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
		console.log( "second complete" );
		console.log("result=" + JSON.stringify(resData));
		
		if (resData["plateTemplate"] !=null &&  resData["plateTemplate"]["id"] != null) {
			plateModel["templateID"] = resData["plateTemplate"]["id"];
			// use less hacky method !!
			window.location.href = hostname + "/experimentalPlateSet/showactions/1"; // need to add correct experimentID !!!
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
		console.log("templateJson=" + JSON.stringify(resData));
		loadJsonData(resData);
	});
}


/**
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers on the
 */
function init(){
	createGrid();		// maybe need template size before creating grid !!
	
	//var testInputJson = {"plate":{"wells":[{"row":"2","column":"2","control":null,"labels":[{"category":"c1","name":"l1","color":"#ffff00"}],"groupName":"L67"},{"row":"2","column":"3","control":null,"labels":[{"category":"c1","name":"l2","color":"#4780b8"}],"groupName":"L5"},{"row":"3","column":"2","control":null,"labels":[{"category":"c1","name":"l1","color":"#ffff00"},{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L51"},{"row":"3","column":"3","control":null,"labels":[{"category":"c1","name":"l2","color":"#4780b8"},{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L17"},{"row":"4","column":"2","control":null,"labels":[{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L2"},{"row":"4","column":"3","control":null,"labels":[{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L47"}],"labels":[]}};
	// fetch templateJson
	console.log("templateId:" + window.templateId);
	//fetchTemplateData(window.templateId);
	fetchTemplateData(window.templateId);
	//loadJsonData(inputJson);
	//loadRandomData();
	
	addEvent("addNewLabel", "click", addNewLabel);
	addEvent("addNewDose", "click", addNewDose);
	addEvent("addDoseStep", "click", addDoseStep);
	addEvent("clearAllSelection", "click", removeAllHighlightedCells);
	addEvent("savePlate", "click", saveConfigToServer);

	enableGridSelection();
}

window.onload = init;

//data format translation
function translateModelToOutputJson(pModel) {
	var plateJson = {};
	var plate = {}
	plate["name"] = pModel["name"];
	plate["plateID"] = document.getElementById("barcode").value;
	plate["wells"] = [];
	plate["labels"] = [];		// plate level labels, should set these if available already !!!
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
					label["category"] = catKey;
					label["name"] = labKey;
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
	pModel["rows"] = {};
	var plate = plateJson["plate"];
	
	pModel["name"] = plate["name"];			// should also copy expId and plateId at this point !!
	
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
				pModel["rows"][row]["columns"][column]["categories"][labels[j].category][labels[j].name] = {};
			}
			pModel["rows"][row]["columns"][column]["categories"][labels[j].category][labels[j].name]["color"] = labels[j].value;
			pModel["rows"][row]["columns"][column]["categories"][labels[j].category][labels[j].name]["units"] = labels[j].units;
		}
	}

	return pModel;
}

// jQuery ui stuff
$(function() {	
	$("#addDosePanel").hide();
	$("#addDoseStepPanel").hide();
	
	$("input[name=labeltype]").on("change", function () {
	    if ($(this).prop('id') == "catLabType") {
	    	showLabelPanel();
	    } else if ($(this).prop('id') == "doseLabType") {
	    	showDosePanel();
	    } else if ($(this).prop('id') == "doseStepLabType") {
	    	showDoseStepPanel();
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
	$("#addLabelPanel").show();
};

function showDosePanel() {
	hideLabelPanel();
	hideDoseStepPanel();
	$("#addDosePanel").show();
};

function showDoseStepPanel() {
	hideLabelPanel();
	hideDosePanel();
	$("#addDoseStepPanel").show();
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