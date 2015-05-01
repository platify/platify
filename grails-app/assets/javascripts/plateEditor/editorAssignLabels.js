/*jslint browser:true */
/*global $, jQuery, alert, console, Grid*/

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
	"use strict";
	var result, i, j;
	result = [];

	for (i = 0; i < plateModel.grid_height; i++) {
		result[i] = [];
		for (j = 0; j < plateModel.grid_width; j++) {
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
	"use strict";
	var result, i, j;
	result = [];

	for (i = 0; i < plateModel.grid_height; i++) {
		result[i] = [];
		for (j = 0; j < plateModel.grid_width; j++) {
			result[i][j] = "L" + Math.floor(Math.random() * 100);
		}
	}
	return result;
}

function txtFieldFocus() {
	"use strict";
	if ($("#addLabelPanel").is(":visible")) {
		$("#newCatValue").focus();
	} else if ($("#addDosePanel").is(":visible")) {
		$("#topDoseValue").focus();
	}
}

/**
 * A handler function for when the selected cells in the grid changes. This
 * function is registered to listen for these events in the createGrid
 * function using the registerSelectedCellsCallBack function of the Grid
 * Class. This function changes the background color of all selected cells
 * to the currentHighlightColor.
 */
function handleSelectedCells(startRow, startCol, endRow, endCol) {
	"use strict";
	var out, coordinatesToHighlight, i, j, key;
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
 * This function handles the event that the removeHighlighting button is
 * clicked by removing the most recent cell background color change. This
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
 * This function handles the event that the removeHighlighting button is
 * clicked by removing the most recent cell background color change. This
 * is achieved by calling the removeCellColors method of the Grid class with
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
 * This function loads random numeric data into the already created and
 * displayed Grid. It is a handler for the event that the "loadData" button
 * is clicked.
 */
function loadRandomData() {
	"use strict";
	data = createRandomData();
	grid.setData(data);
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT);
}



function updateCellColors(cat, label, color) {
	"use strict";
	var cellRef, cellRefArr, row, column, newContents, catKey, labKey;
	// update all cells with cat and label (messy?)
	if (catLegend[cat] !== undefined && catLegend[cat] !== null && catLegend[cat].labels[label] !== undefined && catLegend[cat].labels[label] !== null) {
		for (cellRef in catLegend[cat].labels[label].cellref) {			//change iteration method !!!
			// what are you doing here ??, define some sort of structure !!!
			cellRefArr = catLegend[cat].labels[label].cellref[cellRef].split("-");
			row = cellRefArr[0];
			column = cellRefArr[1];
			plateModel.rows[row].columns[column].categories[cat] = {};
			plateModel.rows[row].columns[column].categories[cat][label] = {};
			plateModel.rows[row].columns[column].categories[cat][label].color = color;

			catLegend[cat].labels[label].color = color;

			// update actual grid cell
			newContents = plateModel.rows[row].columns[column].wellGroupName;
			for (catKey in plateModel.rows[row].columns[column].categories) {
				for (labKey in plateModel.rows[row].columns[column].categories[catKey]) {
					newContents += "," + plateModel.rows[row].columns[column].categories[catKey][labKey].color;
				}
			}
			grid.updateCellContents(row, column, newContents);
		}
	}
}

function updateCatVisibility(cat) {
	"use strict";
	var legLab, cellRef, cellRefArr, row, column, newContents, catKey, labKey;
	// update all cells with cat
	if (catLegend[cat] !== undefined && catLegend[cat] !== null) {
		for (legLab in catLegend[cat].labels) {
			for (cellRef in catLegend[cat].labels[legLab].cellref) {
				cellRefArr = catLegend[cat].labels[legLab].cellref[cellRef].split("-");
				row = cellRefArr[0];
				column = cellRefArr[1];

				// update actual grid cell
				newContents = plateModel.rows[row].columns[column].wellGroupName;
				for (catKey in plateModel.rows[row].columns[column].categories) {
					if (catLegend[catKey].visible === true) {
						for (labKey in plateModel.rows[row].columns[column].categories[catKey]) {
							newContents += "," + plateModel.rows[row].columns[column].categories[catKey][labKey].color;
						}
					}
				}
				grid.updateCellContents(row, column, newContents);
			}
		}
	}
}

function createCompoundInput(wellGroup) {
	"use strict";
	var newInput = document.createElement("input");
	newInput.id = "wellGroup_-_" + wellGroup;
	newInput.type = "text";
	return newInput;
}

function createColorPicker(cat, label) {
	"use strict";
	var cpDiv, newInput, editLabelBtn, deleteLabelBtn;
	cpDiv = document.createElement("span");
	newInput = document.createElement("input");
	newInput.id = "color_-_" + cat + "_-_" + label;
	newInput.type = "color";
	newInput.className = "btn-default glyphicon color-p";
	newInput.defaultValue = catLegend[cat].labels[label].color;
	newInput.value = catLegend[cat].labels[label].color;

	editLabelBtn = document.createElement("button");
	editLabelBtn.id = "edit_-_" + cat + "_-_" + label;
	editLabelBtn.type = "button";
	editLabelBtn.className = "btn btn-default btn-xs glyphicon glyphicon-pencil";

	deleteLabelBtn = document.createElement("button");
	deleteLabelBtn.id = "delete_-_" + cat + "_-_" + label;
	deleteLabelBtn.type = "button";
	deleteLabelBtn.value = "Delete Label";
	deleteLabelBtn.className = "btn btn-default btn-xs glyphicon glyphicon-trash";

	cpDiv.appendChild(newInput);
	cpDiv.appendChild(editLabelBtn);
	cpDiv.appendChild(deleteLabelBtn);

	return cpDiv;
}

function updateCompoundList() {
	"use strict";
	var newDiv, wellGroup, innerDiv, newLabel, newInput;
	newDiv = document.createElement("div");
	for (wellGroup in groupNames) {
		if (wellGroup !== null) {
			innerDiv = document.createElement("div");
			innerDiv.className = "col-xs-12";
			newLabel = document.createElement("label");
			newLabel.appendChild(document.createTextNode(wellGroup));

			newInput = createCompoundInput(wellGroup);
			innerDiv.appendChild(newLabel);
			innerDiv.appendChild(newInput);
			newDiv.appendChild(innerDiv);
		}
	}
	document.getElementById("compoundList").innerHTML = newDiv.innerHTML;

	// won't seem to take value for input until created ??
	for (wellGroup in groupNames) {			// USED a second time ?? // does this need to be re-inited ?? ( it's prob ok?)
		if (wellGroup !== null) {
			if (groupNames[wellGroup] !== undefined && groupNames[wellGroup] !== null) {
				document.getElementById("wellGroup_-_" + wellGroup).value = groupNames[wellGroup];
			}
		}
	}
}


function updatePlateLabelList() {
	"use strict";
	var pLabels, newDiv, i, newH;
	pLabels = plateModel.labels;
	newDiv = document.createElement("div");

	for (i = 0; i < pLabels.length; i++) {
		newH = document.createElement("H5");
		newH.appendChild(document.createTextNode(pLabels[i].category + ": "));	// should null check !
		newH.appendChild(document.createTextNode(pLabels[i].name));
		newDiv.appendChild(newH);
	}

	document.getElementById("plateLabelList").innerHTML = newDiv.innerHTML;
}


function createCatLabel(catKey) {
	"use strict";
	var labDiv, newCheckbox, newLabel, convCat;
	labDiv = document.createElement("div");
	labDiv.className = "button-labels";
	newCheckbox = document.createElement("input");
	newCheckbox.type = "checkbox";
	newCheckbox.checked = true;
	newCheckbox.id = "vischeck_-_" + catKey;
	labDiv.appendChild(newCheckbox);
	newLabel = document.createElement("label");
	newLabel.setAttribute("for", "vischeck_-_" + catKey);
	// if category has been converted from a decimal, then convert it back for display!!
	convCat = catKey.toString().split('__dot__').join('.');
	newLabel.appendChild(document.createTextNode(convCat));
	labDiv.appendChild(newLabel);

	return labDiv;
}

// event handlers
function onCatColorChange(event) {
	"use strict";
	var idArr, cat, label;
	idArr = event.currentTarget.id.split("_-_");
	cat = idArr[1];
	label = idArr[2];
	updateCellColors(cat, label, event.currentTarget.value);
}

function onCatVisCheck(event) {
	"use strict";
	var idArr, cat;
	idArr = event.currentTarget.id.split("_-_");		// investigate use of "event.currentTarget"
	cat = idArr[1];
	catLegend[cat].visible = event.currentTarget.checked;
	updateCatVisibility(cat);
}

function onEditLabelChange(event) {	// some issues here !! (when editing 1st label in cat, it actually changes 2nd !!)
	"use strict";
	var idArr = event.currentTarget.id.split("_-_");		// investigate use of "event.currentTarget"
	tmpEditCat = idArr[1];
	tmpEditOldLabel = idArr[2];
	console.log("editLabel: " + tmpEditCat + ";" + tmpEditOldLabel);
	$("#editLabelDialog").dialog("open");
}

function onDeleteLabelChange(event) {
	"use strict";
	var idArr, cat, label;
	idArr = event.currentTarget.id.split("_-_");
	cat = idArr[1];
	label = idArr[2];
	console.log("deleteLabel: " + cat + ";" + label);
	removeLabel(cat, label);
}

function updateCategoryList() {
	"use strict";
	var newDiv, catKey, labelKey, newLi, convLab, newInput;
	newDiv = document.createElement("div");
	for (catKey in catLegend) {
		newDiv.appendChild(createCatLabel(catKey));
		for (labelKey in catLegend[catKey].labels) {
			newLi = document.createElement("div");
			// if label has been converted from a decimal, then convert it back for display!!
			convLab = labelKey.toString().split('__dot__').join('.');
			newLi.appendChild(document.createTextNode(convLab));

			newInput = createColorPicker(catKey, labelKey);
			newLi.appendChild(newInput);
			newDiv.appendChild(newLi);
		}
	}
	document.getElementById("categoryList").innerHTML = newDiv.innerHTML;

	// apply events with a redundant nested loop. only seems to work when part of dom. fix!!(remove loop)
	for (catKey in catLegend) {
		$("#vischeck_-_" + catKey).attr('checked', 'checked');
		$("#vischeck_-_" + catKey).change(onCatVisCheck);
		for (labelKey in catLegend[catKey].labels) {
			$("#color_-_" + catKey + "_-_" + labelKey).change(onCatColorChange);
			$("#edit_-_" + catKey + "_-_" + labelKey).click(onEditLabelChange);
			$("#delete_-_" + catKey + "_-_" + labelKey).click(onDeleteLabelChange);
		}
	}
}

function enableGridSelection() {
	"use strict";
	if (grid !== undefined) {
		grid.enableCellSelection();
	}
}

function disableGridSelection() {
	"use strict";
	if (grid !== undefined) {
		removeAllHighlightedCells();
		grid.disableCellSelection();
	}
}

// remove and cleanup references to cat and label
function removeLabel(cat, label) {
	"use strict";
	var cellRef, cellRefArr, row, column, newContents, catKey, labKey;
	delete catLegend[cat].labels[label].color;

	// remove all cells with cat and label (messy?)
	for (cellRef in catLegend[cat].labels[label].cellref) {			//change iteration method !!!
		// what are you doing here ??, define some sort of structure !!!
		cellRefArr = catLegend[cat].labels[label].cellref[cellRef].split("-");
		row = cellRefArr[0];
		column = cellRefArr[1];

		delete plateModel.rows[row].columns[column].categories[cat];

		// update actual grid cell
		newContents = plateModel.rows[row].columns[column].wellGroupName;
		for (catKey in plateModel.rows[row].columns[column].categories) {
			for (labKey in plateModel.rows[row].columns[column].categories[catKey]) {
				newContents += "," + plateModel.rows[row].columns[column].categories[catKey][labKey].color;
			}
		}
		grid.updateCellContents(row, column, newContents);
	}

	// remove from color legend cell reverse lookup
	delete catLegend[cat].labels[label];

	if (Object.keys(catLegend[cat].labels).length === 0) {
		delete catLegend[cat];
	}

	// referesh category elements
	updateCategoryList();
}

// remove and cleanup references to cat and label
function updateLabelName(cat, oldLabel, label) {	// should we allow for change of category also ??
	"use strict";
	// remove spaces from the names (replacing with '_')
	cat = cat.toString().split(' ').join('_');
	label = label.toString().split(' ').join('_');

	// remove decimal point from the names (replacing with '_|_')
	cat = cat.toString().split('.').join('__dot__');
	label = label.toString().split('.').join('__dot__');

	// update color legend cell reverse lookup				
	if (catLegend[cat].labels[label] === undefined) {
		//catLegend[cat][label] = {};
		//catLegend[cat][label].cellref = [];
		catLegend[cat].labels[label] = catLegend[cat].labels[oldLabel];

		console.log("Old color:" + catLegend[cat].labels[oldLabel].color);
		console.log("New color:" + catLegend[cat].labels[label].color);
		// remove old label
		delete catLegend[cat].labels[oldLabel];

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
	"use strict";
	var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
	return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

function shade(color, percent) {
	"use strict";
	if (color.length > 7) {
		//return shadeRGBColor(color, percent);		// THIS FUNCTION is not defined !!, need to throw exception instead !!
		return "0x0000FF";		// some default / or shoudl be null ???
	} else {
		return shadeColor2(color, percent);
	}
}


function createNewLabel(cat, label, units, color, applyToCells) {
	"use strict";
	var cell, row, column, oldLab, pos, newContents, catKey, labKey;
	// remove spaces from the names (replacing with '_')
	cat = cat.toString().split(' ').join('_');
	label = label.toString().split(' ').join('_');

	// remove decimal point from the names (replacing with '_|_')
	cat = cat.toString().split('.').join('__dot__');
	label = label.toString().split('.').join('__dot__');

	// update catLegend color
	if (catLegend[cat] === undefined) {
		catLegend[cat] = {};
		catLegend[cat].labels = {};
		catLegend[cat].visible = true;
	}

	if (catLegend[cat].labels[label] === undefined) {
		catLegend[cat].labels[label] = {};
		catLegend[cat].labels[label].color = color;
	} else {
		catLegend[cat].labels[label].color = color;
		// category and label already exist, just changing color,
		// in this case cells which already have this label need their color updated also!!
		updateCellColors(cat, label, color);
	}

	// update selected grid cells with label
	for (cell in applyToCells) {
		row = applyToCells[cell][0];		// change iteration method !!!
		column = applyToCells[cell][1];

		// messy hack	--> maybe not so bad for efficiency actually ?
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
			plateModel.rows[row].columns[column].categories = {};
		}

		if (plateModel.rows[row].columns[column].wellGroupName === undefined) {
			// shouldn't real be neccessary if json is loaded at init
			//plateModel.rows[row].columns[column].wellGroupName = data[row-1][column-1];
			plateModel.rows[row].columns[column].wellGroupName = "-";
		}

		// the case where we are overwriting a cell with a new value for the same category
		if (plateModel.rows[row].columns[column].categories[cat] !== undefined) {
			// if that is the case we should remove the old reference to the cell in the catLegend cellref
			for (oldLab in plateModel.rows[row].columns[column].categories[cat]) {
				pos = catLegend[cat].labels[oldLab].cellref.indexOf(row + "-" + column);
				if (pos !== -1) {
					catLegend[cat].labels[oldLab].cellref.splice(pos, 1);
				}
			}
		}

		plateModel.rows[row].columns[column].categories[cat] = {};
		plateModel.rows[row].columns[column].categories[cat][label] = {};
		plateModel.rows[row].columns[column].categories[cat][label].color = color;
		plateModel.rows[row].columns[column].categories[cat][label].units = units;
		newContents = plateModel.rows[row].columns[column].wellGroupName;

		for (catKey in plateModel.rows[row].columns[column].categories) {
			for (labKey in plateModel.rows[row].columns[column].categories[catKey]) {
				newContents += "," + plateModel.rows[row].columns[column].categories[catKey][labKey].color;
			}
		}

		grid.updateCellContents(row, column, newContents);

		// update color legend cell reverse lookup
		if (catLegend[cat].labels[label].cellref === undefined) {
			catLegend[cat].labels[label].cellref = [];
			catLegend[cat].labels[label].cellref.push(row + "-" + column);
		} else {
			if (catLegend[cat].labels[label].cellref.indexOf(row + "-" + column) === -1) {
				catLegend[cat].labels[label].cellref.push(row + "-" + column);
			} else {
				console.log("already there");
			}
		}
	}
}

// SOME ISSUE OCCURS with dose step (Problem is with'.' in the name of label !!)
// replicates is realistically off by 1 probably as it should start at zero ??
function addDoseStep() {
	"use strict";
	var selCells, cat, topDose, units, dilution, replicates, topColor, wellGroupLength, doseStepLength, currentDose, currentColor, i, j;

	selCells = highlightedCoords;
	console.log("selcells=" + selCells);
	cat = "dosage";

	topDose = document.getElementById("topDoseValue").value;
	units = document.getElementById("doseStepUnits").value;
	dilution = document.getElementById("stepDilutionValue").value;
	replicates = document.getElementById("replicatesValue").value;
	topColor = document.getElementById("tDoseColorValue").value;

	wellGroupLength = selCells.length;
	doseStepLength = wellGroupLength / replicates;		// need some validation !!
	currentDose = topDose;
	currentColor = topColor;

	for (i = 0; i < wellGroupLength; i++) {
		for (j = 0; j < replicates; j++) {
			console.log("i+j:" + (i + j));
			createNewLabel(cat, currentDose, units, currentColor, [selCells[i + j]]);
		}
		i += (replicates - 1);
		currentColor = shade(currentColor, 0.2); // should we use 1/dilution instead ?? (might be too dramatic a difference !!
		currentDose = currentDose / dilution;
	}

	updateCategoryList();
	removeAllHighlightedCells();
}


/**
 * This function changes the style of a particular cell
 */
function addNewLabel() {
	"use strict";
	var selCells, cat, label, color;
	selCells = highlightedCoords;
	console.log(selCells);
	cat = document.getElementById("newCatValue").value;
	label = document.getElementById("newLabelValue").value;
	color = document.getElementById("newColorValue").value;

	createNewLabel(cat, label, "", color, selCells);

	updateCategoryList();
	// output current object model to console
	console.log("plateModel:" + JSON.stringify(plateModel));
	console.log("catLegend:" + JSON.stringify(catLegend));

	//var jsonPlate = translateModelToOutputJson(plateModel);
	//console.log("jsonPlate:" + JSON.stringify(jsonPlate));
	removeAllHighlightedCells();
}

function addNewPlateLabel() {
	"use strict";
	var cat, label, pLabel;
	cat = document.getElementById("newPlateCatValue").value;
	label = document.getElementById("newPlateLabelValue").value;

	if (plateModel.labels === undefined) {
		plateModel.labels = [];
	}

	pLabel = {};
	pLabel.category = cat;
	pLabel.name = label;

	plateModel.labels.push(pLabel);

	updatePlateLabelList();
}

/**
 * This function changes the style of a particular cell
 */
function addNewDose() {
	"use strict";
	var selCells, cat, label, units, color;
	selCells = highlightedCoords;
	console.log(selCells);
	cat = "dosage";
	label = document.getElementById("newDoseValue").value;
	units = document.getElementById("newDoseUnits").value;
	color = document.getElementById("newDoseColorValue").value;

	createNewLabel(cat, label, units, color, selCells);

	updateCategoryList();

	// output current object model to console
	console.log("plateModel:" + JSON.stringify(plateModel));
	console.log("catLegend:" + JSON.stringify(catLegend));

	//var jsonPlate = translateModelToOutputJson(plateModel);
	//console.log("jsonPlate:" + JSON.stringify(jsonPlate));
	removeAllHighlightedCells();
}

function addNewControlLabel() {
	"use strict";
	var selCells, cat, label, color;
	selCells = highlightedCoords;
	console.log(selCells);
	cat = "control";
	
	if (document.getElementById("negWellType").checked) {
		label = "negative";
	} else {
		label = "positive";
	}
	//label = document.getElementById("newControlWellType").value;
	color = document.getElementById("newControlWellValue").value;

	createNewLabel(cat, label, "", color, selCells);

	updateCategoryList();
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

	if (typeof elementId  === "string") {
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
	"use strict";
	var fileInput, reader, parsed;
    fileInput = $('#compoundsFile')[0];
    reader = new FileReader();
    reader.onload = function (progressEvent) {
		parsed = Papa.parse(progressEvent.target.result, {skipEmptyLines: true});
		switch (parsed.data[0].length) {
			case 1:
                Object.keys(groupNames).forEach(function (group) { groupNames[group] = null; });
                var compounds = parsed.data.map(function (obj) { return obj[0]; });
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
    };
    // TODO - check for loaded file
    reader.readAsText($('#compoundsFile')[0].files[0]);
}



//data format translation
function translateModelToOutputJson(pModel) {
	"use strict";
	var plateJson, plate, wellGroup, cmpdValue, row, column, well, labels, catKey, labKey, label, convCat, convLab, cmpdLabel, i, j;
	plateJson = {};
	plate = {};
	plate.name = pModel.name;
	plate.width = pModel.grid_width;
	plate.height = pModel.grid_height;
	plate.experimentID = window.expId;
	plate.templateID = window.templateId;

	plate.plateID = document.getElementById("barcode").value;
	plate.wells = [];

	if (pModel.labels !== undefined) {
		plate.labels = pModel.labels;
	} else {
		plate.labels = [];
	}

	// take the values from the compound input text fields (could do this at input onChange event also)
	for (wellGroup in groupNames) {
		if (groupNames[wellGroup] !== undefined && groupNames[wellGroup] !== null) {
			cmpdValue = document.getElementById("wellGroup_-_" + wellGroup).value;
			if (cmpdValue === undefined || cmpdValue === null || cmpdValue === "") {
				// !!! THROW ERROR DIALOG HERE ASKING TO FILL OUT THIS FIELD !!!
				groupNames[wellGroup] = "SOME_COMPOUND";
			} else {
				groupNames[wellGroup] = cmpdValue;
			}
		}
	}


	// Send all values for the grid
	for (i = 1; i <= pModel.grid_height; i++) {
		// need null check here !!
		for (j = 1; j <= pModel.grid_width; j++) {
			well = {};
			well.row = i - 1;
			well.column = j - 1;
			labels = [];
			
			if (pModel.rows[i] !== undefined && pModel.rows[i].columns[j] !== undefined) {
				well.groupName = pModel.rows[i].columns[j].wellGroupName;
				for (catKey in pModel.rows[i].columns[j].categories) {
					for (labKey in pModel.rows[i].columns[j].categories[catKey]) {
						label = {};
						// if catKey, or labKey have been converted from a decimal, convert them back for output!
						convCat = catKey.toString().split('__dot__').join('.');
						convLab = labKey.toString().split('__dot__').join('.');
						
						// TEMP, fix to add control wells!
						if (convCat === "control") {
							if (convLab === "positive") {
								well.control = "positive";
							} else if (convLab === "negative") {
								well.control = "negative";
							} else {
								// ignoring other labels with control: something ??
							}
						} else {
							label.category = convCat;
							label.name = convLab;
							label.value = pModel.rows[i].columns[j].categories[catKey][labKey].color;
							label.units = pModel.rows[i].columns[j].categories[catKey][labKey].units;
							labels.push(label);
						}
					}
				}
				
				if (well.groupName !== undefined && well.groupName !== null && well.groupName !== "") {
					cmpdLabel = {};
					cmpdLabel.category = "compound";
					cmpdLabel.name = groupNames[well.groupName];
					labels.push(cmpdLabel);
					if (well.control !== "positive" && well.control !== "negative") {
						well.control = "compound";		// could also be a control !!!
					}
				} else {
					// default to empty control
					if (well.control !== "positive" && well.control !== "negative") {
						well.control = "empty";
					}
				}
				
			} else {
				// check for empty well:
				well.groupName = "";
				well.control = "empty";
			}

			well.labels = labels;
			plate.wells.push(well);
		}
	}
	plateJson.plate = plate;
	return plateJson;
}

// data format translation
function translateInputJsonToModel(plateJson) {
	"use strict";
	var pModel, plate, i, j, row, column, groupName, labels, convCat, convLab;
	pModel = {};
	groupNames = {};
	pModel.rows = {};
	plate = plateJson.plate;

	if (plateJson.labels !== undefined) {
		pModel.labels = plateJson.labels;
	} else {
		pModel.labels = [];
	}

	pModel.name = plate.name;			// should also copy expId and plateId at this point !!
	pModel.grid_width = plate.width;
	pModel.grid_height = plate.height;

	for (i = 0; i < plate.wells.length; i++) {
		row = plate.wells[i].row + 1;
		column = plate.wells[i].column + 1;
		if (plate.wells[i].groupName !== undefined && plate.wells[i].groupName !== null) {
			groupName = plate.wells[i].groupName;
		} else {
			groupName = "";
		}
		
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
			// convert possible disruptive input to safer format !
			convCat = labels[j].category.toString().split('.').join('__dot__');
			convLab = labels[j].name.toString().split('.').join('__dot__');

			if (convCat === "compound") {
				// deal with special 'compound' category !
				if (groupName !== null && groupName !== "") {
					groupNames[groupName] = convLab;		// should do null check ??
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

	return pModel;
}

// ajax save object call
function saveConfigToServer() {
	"use strict";
	var plateJson, jqxhr;
	plateJson = translateModelToOutputJson(plateModel);
	console.log("SendingToServer: " + JSON.stringify(plateJson));

	jqxhr = $.ajax({		// need to update to save plate instead of template
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
		console.log("second complete");
		console.log("result=" + JSON.stringify(resData));

		if (resData.plate !== undefined &&  resData.plate.id !== undefined) {
			//plateModel.templateID = resData.plateTemplate.id;
			// use less hacky method !!
			window.location.href = hostname + "/experimentalPlateSet/showactions/" + window.expId;
		} else {
			alert("An error while saving the template!");
		}
	});
}

function hideLabelPanel() {
	"use strict";
	$("#addLabelPanel").hide();
}

function hideDosePanel() {
	"use strict";
	$("#addDosePanel").hide();
}

function hideDoseStepPanel() {
	"use strict";
	$("#addDoseStepPanel").hide();
}

function hideControlWellPanel() {
	"use strict";
	$("#addControlWellPanel").hide();
}

function hidePlateLabelPanel() {
	"use strict";
	$("#addPlateLabelPanel").hide();
}

function hideCategoryPanel() {
	"use strict";
	$("#categoryPanel").hide();
}

function hidePlateLabelCatPanel() {
	"use strict";
	$("#plateLabelCatPanel").hide();
}

function showCategoryPanel() {
	"use strict";
	$("#categoryPanel").show();
}

function showPlateLabelCatPanel() {
	"use strict";
	$("#plateLabelCatPanel").show();
}

function showLabelPanel() {
	"use strict";
	hideDosePanel();
	hideDoseStepPanel();
	hideControlWellPanel();
	hidePlateLabelPanel();
	hidePlateLabelCatPanel();
	$("#addLabelPanel").show();
	enableGridSelection();
	showCategoryPanel();
}

function showDosePanel() {
	"use strict";
	hideLabelPanel();
	hideDoseStepPanel();
	hideControlWellPanel();
	hidePlateLabelPanel();
	hidePlateLabelCatPanel();
	$("#addDosePanel").show();
	enableGridSelection();
	showCategoryPanel();
}

function showDoseStepPanel() {
	"use strict";
	hideLabelPanel();
	hideDosePanel();
	hideControlWellPanel();
	hidePlateLabelPanel();
	hidePlateLabelCatPanel();
	$("#addDoseStepPanel").show();
	enableGridSelection();
	showCategoryPanel();
}

function showControlWellPanel() {
	"use strict";
	hideLabelPanel();
	hideDosePanel();
	hideDoseStepPanel();
	hidePlateLabelPanel();
	hidePlateLabelCatPanel();
	$("#addControlWellPanel").show();
	enableGridSelection();
	showCategoryPanel();
}

function showPlateLabelPanel() {
	"use strict";
	hideLabelPanel();
	hideDosePanel();
	hideDoseStepPanel();
	hideControlWellPanel();
	hideCategoryPanel();
	$("#addPlateLabelPanel").show();

	// disable grid selection !! (labels only apply to plate level)
	disableGridSelection();
	showPlateLabelCatPanel();
}


// jQuery ui stuff
$(function() {
	"use strict";
	$("input[name=labeltype]").on("change", function () {
		if ($(this).prop('id') === "catLabType") {
			showLabelPanel();
		} else if ($(this).prop('id') === "doseLabType") {
			showDosePanel();
		} else if ($(this).prop('id') === "doseStepLabType") {
			showDoseStepPanel();
		} else if ($(this).prop('id') === "controlType") {
			showControlWellPanel();
		} else if ($(this).prop('id') === "plateLabType") {
			showPlateLabelPanel();
		}
	});

	$('[data-toggle="popover').popover({
		trigger: 'hover',
		'placement': 'top'
	});

	$("#editLabelDialog").dialog({
		autoOpen: false,
		resizable: false,
		height: 140,
		modal: true,
		buttons: {
			"Save New Name": function() {
				updateLabelName(tmpEditCat, tmpEditOldLabel, document.getElementById("editNewLabelValue").value);
				//delete tmpEditCat;
				//delete tmpEditOldLabel;		// reconsider this delete !!! -> can only delete properties not vars ?
				tmpEditCat = "";
				tmpEditOldLabel = "";		// perhaps null instead ??
				$(this).dialog("close");
			},
			Cancel: function() {
				//delete tmpEditCat;
				//delete tmpEditOldLabel;
				tmpEditCat = "";
				tmpEditOldLabel = "";
				$(this).dialog("close");
			}
		}
	});

	$('#importCompoundsModal').on('hidden.bs.modal', function (e) {
		$('#importCompoundsForm')[0].reset();
	});
});


/**
 * This function creates a new grid applying it to the "myGrid" div on the
 * page. It then creates a blank data set and displays it in the grid.
 * It also registers the handleSelectedCells function as a listener for
 * the event that user selected cell ranges in the grid change.
 */
function createGrid() {
	"use strict";
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
 * Loads a json plate model and updates the grid and category legend
 */
function loadJsonData(plateJson) {
	"use strict";
	var row, column, wellgrp, catKey, labKey, color, newContents;
	// translate the json received to the internal models structure
	plateModel = translateInputJsonToModel(plateJson);

	// create initial grid, based on template size
	if (plateModel.grid_width === undefined || plateModel.grid_width === null) {
		plateModel.grid_width = 100; // default value
	}

	if (plateModel.grid_height === undefined || plateModel.grid_height === null) {
		plateModel.grid_height = 100; // default value
	}

	createGrid();

	// load data into the grid
	for (row in plateModel.rows) {
		for (column in plateModel.rows[row].columns) {
			wellgrp = plateModel.rows[row].columns[column].wellGroupName;
			if (wellgrp !== undefined && wellgrp !== null && wellgrp !== "") {
				//groupNames[wellgrp] = "SOME_COMPOUND";
				groupNames[wellgrp] = "";
			}

			newContents = wellgrp;

			for (catKey in plateModel.rows[row].columns[column].categories) {
				for (labKey in plateModel.rows[row].columns[column].categories[catKey]) {
					color = plateModel.rows[row].columns[column].categories[catKey][labKey].color;
					newContents += "," + color;

					// cat legend part !! --> only needed for assignlabels page ??
					// update catLegend color
					if (catLegend[catKey] === undefined) {
						catLegend[catKey] = {};
						catLegend[catKey].labels = {};
						catLegend[catKey].visible = true;
					}

					if (catLegend[catKey].labels[labKey] === undefined) {
						catLegend[catKey].labels[labKey] = {};
						catLegend[catKey].labels[labKey].color = color;
					} else {
						catLegend[catKey].labels[labKey].color = color;
						// category and label already exist, just changing color,
						// in this case cells which already have this label need their color updated also!!
						updateCellColors(catKey, labKey, color);
					}

					// update color legend cell reverse lookup
					if (catLegend[catKey].labels[labKey].cellref === undefined) {
						catLegend[catKey].labels[labKey].cellref = [];
						catLegend[catKey].labels[labKey].cellref.push(row + "-" + column);
					} else {
						if (catLegend[catKey].labels[labKey].cellref.indexOf(row + "-" + column) === -1) {
							catLegend[catKey].labels[labKey].cellref.push(row + "-" + column);
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

//ajax save object call
function fetchTemplateData(tId) {
	"use strict";
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
		console.log("second complete");
		console.log("recievedFromServer:  " + JSON.stringify(resData));
		loadJsonData(resData);
	});
}

/**
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers on the
 */
function init() {
	"use strict";
	hidePlateLabelCatPanel();
	hideDosePanel();
	hideDoseStepPanel();
	hideControlWellPanel();
	hidePlateLabelPanel();

	// fetch templateJson
	fetchTemplateData(window.templateId); // should set flag to say if recieved model was ok!, inform user otherwise
	console.log("templateId:" + window.templateId);

	addEvent("addNewLabel", "click", addNewLabel);
	addEvent("addNewDose", "click", addNewDose);
	addEvent("addDoseStep", "click", addDoseStep);
	addEvent("addNewControlWell", "click", addNewControlLabel);
	addEvent("addNewPlateLabel", "click", addNewPlateLabel);
	addEvent("clearAllSelection", "click", removeAllHighlightedCells);

	enableGridSelection();
}

window.onload = init;