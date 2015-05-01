/*jslint browser:true */
/*global $, jQuery, alert*/

// constants
var DIMENSION = 100;
var GRID_HEIGHT = 100;
var GRID_WIDTH = 100;
var CELL_HEIGHT = 25;
var CELL_WIDTH = 40;
var plateModel = {};
var grid;
var currentHighlightKeys = [];
var highlightKeyCounter = 0;
var currentHighlightColor = "#D5E3E3";
var highlightedCoords = [];
var groupNames = {};
var catLegend = {};

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
}


/**
 * Creates a new grid applying it to the "myGrid" div on the
 * page. It then creates a blank data set and displays it in the grid.
 * It also registers the handleSelectedCells function as a listener for
 * the event that user selected cell ranges in the grid change.
 */
function createGrid() {
	"use strict";
	// construct the Grid object with the id of the html container element
	// where it should be placed (probably a div) as an argument
	grid  = new Grid("myGrid");

	// set the data to be displayed which must be in 2D array form
	grid.setData(createBlankData(DIMENSION, DIMENSION));

	// display the data
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT);

	// register a function to be called each time a new set of cells are
	// selected by a user
	grid.registerSelectedCellCallBack(handleSelectedCells);

}

/**
 * Enables the ability to make selections on the grid. 
 */
function enableGridSelection() {
	"use strict";
	grid.enableCellSelection();
}

/**
 * Disables the ability to make selections on the grid. 
 */
function disableGridSelection() {
	"use strict";
	grid.disableCellSelection();
}

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
 * This function is used to convert the internal data structure json format into
 * a data structure json format that is expected by the server when sending the 
 * template json to be saved by the back-end. This allows for differences between
 * the 2 models. The internal model providing a more efficient referencing structure
 * for the client-side tasks, and allows for quick changes to either model while
 * maintaining the contract with the server.
 * @param pModel - a data structure in the format of the internal data model.
 * @returns plateJson - a data structure in the format excepted by the server.
 */
function translateModelToOutputJson(pModel) {
	'use strict';
	var plateJson, plate, row, column, well, labels, catKey, labKey, label;
	plateJson = {};
	plate = {};
	plate.name = document.getElementById("templateName").value;
	plate.experimentID = window.expId;
	plate.labels = [];		// plate level labels, should set these if available already !!!
	plate.wells = [];
	for (row in pModel.rows) {
		for (column in pModel.rows[row].columns) {
			well = {};
			well.row = row - 1;
			well.column = column - 1;
			well.control = null;
			labels = [];
			for (catKey in pModel.rows[row].columns[column].categories) {
				for (labKey in pModel.rows[row].columns[column].categories[catKey]) {
					label = {};
					label.category = catKey;
					label.name = labKey;
					label.color = pModel.rows[row].columns[column].categories[catKey][labKey];
					labels.push(label);
				}
			}
			well.labels = labels;
			well.groupName = pModel.rows[row].columns[column].wellGroupName;
			plate.wells.push(well);
		}
	}
	plateJson.plate = plate;
	return plateJson;
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
	//pModel.grid_width = plate.width;
	//pModel.grid_height = plate.height;

	for (i = 0; i < plate.wells.length; i++) {
		row = plate.wells[i].row + 1;
		column = plate.wells[i].column + 1;
		groupName = plate.wells[i].groupName;
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
				groupNames[groupName] = convLab;		// should do null check ??
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

/**
 * Creates a new div containing a label and color picker.
 * @param cat - name of category to create a label for.
 * @param label - name of label to create.
 * @returns cpDiv - div containing new label and color picker.
 */
function createColorPicker(cat, label) {
	"use strict";
	var cpDiv, newInput, editLabelBtn, deleteLabelBtn;
	cpDiv = document.createElement("span");
	newInput = document.createElement("input");
	newInput.id = "color-" + cat + "-" + label;
	newInput.type = "color";
	newInput.className = "btn-default glyphicon color-p";
	newInput.defaultValue = catLegend[cat].labels[label].color;
	newInput.value = catLegend[cat].labels[label].color;

	cpDiv.appendChild(newInput);

	return cpDiv;
}

/**
 * Creates a new div containing a category label and visibility toggle.
 * @param catKey - name of category to create a label for.
 * @returns labDiv - div containing new category label structure.
 */
function createCatLabel(catKey) {			// TODO -- update split to deal with "-" !!!!
	"use strict";
	var labDiv, newLabel, convCat;
	labDiv = document.createElement("div");
	labDiv.className = "button-labels";
	newLabel = document.createElement("label");
	newLabel.setAttribute("for", "vischeck-" + catKey);		// TODO -- is vischeck used here ?? !!!!
	// if category has been converted from a decimal, then convert it back for display!!
	convCat = catKey.toString().split('__dot__').join('.');
	newLabel.appendChild(document.createTextNode(convCat));
	labDiv.appendChild(newLabel);

	return labDiv;
}

/**
 * Updates the list of well labels displayed beside the preview grid with 
 * the current well values stored in catLegend.
 */
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
}

/**
 * Updates the list of compounds displayed beside the preview grid with 
 * the current compound values stored in groupNames.
 */
function updateCompoundList() {
	"use strict";
	var newDiv, wellGroup, newLabel;
	newDiv = document.createElement("div");
	for (wellGroup in groupNames) {
		newLabel = document.createElement("label");
		newLabel.appendChild(document.createTextNode(wellGroup + ": "));
		newDiv.appendChild(newLabel);
		newDiv.appendChild(document.createTextNode(groupNames[wellGroup]));
	}
	document.getElementById("compoundList").innerHTML = newDiv.innerHTML;
}

/**
 * Loads a json data structure received from the server. It is translated into 
 * a format understood by the local internal plate model and updates the grid
 * with the data received.
 * @param plateJson - a data structure in the format sent by the server.
 */
function loadJsonData(plateJson) {
	"use strict";
	var g_height, g_width, newData, row, column, wellgrp, catKey, labKey, color, newContents;
	// assuming plate model has all empty rows ??
	plateModel = {};
	catLegend = {};
	plateModel = translateInputJsonToModel(plateJson);  // TMP	--> should only load plateModel instead,
	g_height = DIMENSION;
	g_width = DIMENSION;
	
	if (GRID_HEIGHT !== null && GRID_HEIGHT !== undefined && GRID_HEIGHT !== "") {
		g_height = GRID_HEIGHT;
	}
	
	if (GRID_WIDTH !== null && GRID_WIDTH !== undefined && GRID_WIDTH !== "") {
		g_width = GRID_WIDTH;
	}
	
	newData = createBlankData(g_height, g_width);
	
	// load data into the grid
	for (row in plateModel.rows) {
		for (column in plateModel.rows[row].columns) {
			wellgrp = plateModel.rows[row].columns[column].wellGroupName;
			//groupNames[wellgrp] = "SOME_COMPOUND";
			//groupNames[wellgrp] = "";

			newContents = wellgrp;
			// NEED TO PARSE COMPOUND LABELS !!!! 

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
				//		updateCellColors(catKey, labKey, color);
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
			//grid.updateCellContents(row, column, newContents);
			if (row > 0 && column > 0) {
				newData[row - 1][column - 1] = newContents;
			}
		}
	}
	
	grid.setData(newData);

	// display the data
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT);
	
	updateCategoryList();
	updateCompoundList();
}

function onViewSelect(clickedEL) {
	"use strict";
	var elValArr, plateId;
	elValArr = clickedEL.value.split("-");
	plateId = elValArr[0];
	GRID_WIDTH = elValArr[1];
	GRID_HEIGHT = elValArr[2];
	
	console.log("selectEvent!:" + plateId);
	fetchTemplateData(plateId);
}

//ajax save object call
function fetchTemplateData(tId) {
	"use strict";
	var jqxhr = $.ajax({		// need to update to save plate instead of template
		url: hostname + "/plate/read/" + tId,
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

/**
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers on the
 */
function init() {
	"use strict";
	createGrid();

	// initially disable selection of grid cells
	disableGridSelection();
}

window.onload = init;
