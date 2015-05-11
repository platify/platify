/*jslint browser:true */
/*global $, jQuery, alert*/

// constants
var GRID_HEIGHT = 100;
var GRID_WIDTH = 100;
var CELL_HEIGHT = 35;
var CELL_WIDTH = 85;
var plateModel = {};
var catLegend = {};

/**
 * Focuses on the text field when grid is selected
 */
function txtFieldFocus() {
	"use strict";
	// nothing to be focused on here
}

/**
 * Creates a new div containing a label and color picker.
 * @param cat - name of category to create a label for.
 * @param label - name of label to create.
 * @returns cpDiv - div containing new label and color picker.
 */
function createColorPicker(cat, label) {
	"use strict";
	var cpDiv;
	cpDiv = document.createElement("div");
	cpDiv.className = "color-box";
	cpDiv.setAttribute("style", "background-color: "+ catLegend[cat].labels[label].color + ";");

	return cpDiv;
}

/**
 * Creates a new div containing a category label and visibility toggle.
 * @param catKey - name of category to create a label for.
 * @returns labDiv - div containing new category label structure.
 */
function createCatLabel(catKey) {
	"use strict";
	var labDiv, newLabel, convCat;
	labDiv = document.createElement("div");
	labDiv.className = "button-labels";
	newLabel = document.createElement("label");
	newLabel.setAttribute("for", "vischeck-" + catKey);	
	// if category has been converted from a decimal, then convert it back for display
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
	var newDiv, catKey, labelKey, newLi, convLab, convUnits, newInput;
	newDiv = document.createElement("div");
	for (catKey in catLegend) {
		newDiv.appendChild(createCatLabel(catKey));
		for (labelKey in catLegend[catKey].labels) {
			newLi = document.createElement("div");
			// if label has been converted from a decimal, then convert it back for display
			convLab = labelKey.toString().split('__dot__').join('.');
			convUnits = catLegend[catKey].labels[labelKey].units;
			newInput = createColorPicker(catKey, labelKey);
			newLi.appendChild(newInput);
			newLi.appendChild(document.createTextNode("  " + convLab + "  " + convUnits));
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
	var newDiv, innerDiv, wellGroup, newLabel;
	newDiv = document.createElement("div");
	for (wellGroup in groupNames) {
		innerDiv = document.createElement("div");
		newLabel = document.createElement("label");
		newLabel.appendChild(document.createTextNode(wellGroup + ": "));
		innerDiv.appendChild(newLabel);
		innerDiv.appendChild(document.createTextNode("  " + groupNames[wellGroup]));
		newDiv.appendChild(innerDiv);
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
	var g_height, g_width, newData, row, column, wellgrp, catKey, labKey, color, newContents, units;
	plateModel = {};
	catLegend = {};
	plateModel = translateInputJsonToModel(plateJson);
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

			for (catKey in plateModel.rows[row].columns[column].categories) {
				for (labKey in plateModel.rows[row].columns[column].categories[catKey]) {
					color = plateModel.rows[row].columns[column].categories[catKey][labKey].color;
					units = plateModel.rows[row].columns[column].categories[catKey][labKey].units;
					if (units === null || units === undefined) {
						units = "";
					}
					
					newContents += "," + color;

					// update catLegend color
					if (catLegend[catKey] === undefined) {
						catLegend[catKey] = {};
						catLegend[catKey].labels = {};
						catLegend[catKey].visible = true;
					}

					if (catLegend[catKey].labels[labKey] === undefined) {
						catLegend[catKey].labels[labKey] = {};
						catLegend[catKey].labels[labKey].color = color;
						catLegend[catKey].labels[labKey].units = units;
					} else {
						catLegend[catKey].labels[labKey].color = color;
						catLegend[catKey].labels[labKey].units = units;
						// category and label already exist, just changing color,
						// in this case cells which already have this label need their color updated also!!
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

			if (row > 0 && column > 0) {
				newData[row - 1][column - 1] = newContents;
			}
		}
	}
	
	grid.setData(newData);

	// display the data
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT, true, Grid.editorCellFormatter, "editor-cell");
	
	updateCategoryList();
	updateCompoundList();
}

/**
 * Forces a refresh of the grid.
 */
function forceGridRefresh() {
	"use strict";
	// display the data
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT, true, Grid.editorCellFormatter, "editor-cell");
}

function onViewSelect(clickedEL) {
	"use strict";
	var elValArr, plateId;
	$("#gridView").hide();
	$("#loaderView").show();
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
	var jqxhr = $.ajax({
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
		$("#loaderView").hide();
		$("#gridView").show();
		loadJsonData(resData);
	});
}

/**
 * Event thrown when preview modal is visible. Need to refresh grid so it shows
 * correctly.
 */
$(function(){
	$('#viewSavedPlateModal').on('shown.bs.modal', function () {
		// will only come inside after the modal is shown
		forceGridRefresh();
	});
});

/**
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers on the
 */
function init() {
	"use strict";
	createGrid("myGrid", CELL_WIDTH, CELL_HEIGHT, DIMENSION, DIMENSION);

	// initially disable selection of grid cells
	disableGridSelection();
}

window.onload = init;
