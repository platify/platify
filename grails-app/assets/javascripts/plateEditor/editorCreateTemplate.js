/*jslint browser: true*/
/*global $, jQuery, alert*/

// constants
var GRID_HEIGHT = 100;
var GRID_WIDTH = 100;
var CELL_HEIGHT = 25;
var CELL_WIDTH = 40;
var plateModel = {};
var wellGroupings = [];

/**
 * Focuses on the text field 'newlabelValue'.
 */
function txtFieldFocus() {
	"use strict";
	$("#newLabelValue").focus();
}

/**
 * This function reads the current value in 'newLabelValue'. This value
 * is then added to the plateModel as the groupName for any currently selected
 * grid cells. It then removes any highlighting/selection from the grid.
 */
function addTemplateValue() {
	"use strict";
	var selCells, cellValue, wellType, cell, row, column, wgs;
	selCells = highlightedCoords;
	cellValue = document.getElementById("newLabelValue").value;
	
	// validate input
	if( /[^a-zA-Z0-9]/.test(cellValue)) {
       alert('Input is not alphanumeric');
    } else {
		wellType = $("input[name=wellType]:checked").val();

		// just keeping list of well values
		if (wellGroupings.indexOf(cellValue) === -1) {
			wellGroupings.push(cellValue);
		}

		// update selected grid cells with label
		for (cell in selCells) {
			if (selCells.hasOwnProperty(cell)) {
				row = selCells[cell][0];
				column = selCells[cell][1];

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
				}
				plateModel.rows[row].columns[column].wellGroupName = cellValue;
				plateModel.rows[row].columns[column].wellType = wellType;

				// add control to well
				var wellStr = cellValue + "," + wellType;
				
				grid.updateCellContents(row, column, wellStr);
			}
		}

		console.log("plateModel1:" + JSON.stringify(plateModel));

		wgs = document.getElementById("wellGroupSpan");
		wgs.innerHTML = wellGroupings;

		// clear current selection
		removeAllHighlightedCells();
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
	var plateJson, plate, i, j, well, labels, catKey, labKey, label;
	plateJson = {};
	plate = {};
	plate.name = window.tName;
	plate.width = GRID_WIDTH;
	plate.height = GRID_HEIGHT;

	plate.experimentID = window.expId;
	plate.labels = [];
	plate.wells = [];

	// Send all values for the grid
	for (i = 1; i <= plate.height; i++) {
		for (j = 1; j <= plate.width; j++) {
			well = {};
			well.row = i - 1;
			well.column = j - 1;
			
			labels = [];
			if (pModel.rows[i] !== undefined && pModel.rows[i].columns[j] !== undefined) {
				// Labels not necessarily present at template stage, but for future
				// could be used for templates with labels already loaded.
				for (catKey in pModel.rows[i].columns[j].categories) {
					for (labKey in pModel.rows[i].columns[j].categories[catKey]) {
						label = {};
						label.category = catKey;
						label.name = labKey;
						label.color = pModel.rows[i].columns[j].categories[catKey][labKey];
						labels.push(label);
					}
				}
				
				well.groupName = pModel.rows[i].columns[j].wellGroupName;
				well.control = pModel.rows[i].columns[j].wellType;
			} else {
				well.control = "empty";
			}

			well.labels = labels;
			plate.wells.push(well);
		}
	}
	plateJson.plate = plate;
	return plateJson;
}


/**
 * Ajax call to the server. Translates the current saved data model to a format
 * expected by the server. Then sends the template data to be saved.
 * If successfully saved it transitions to the next page.
 * If saving fails it displays and appropriate indication to the user.
 */
function saveConfigToServer() {
	"use strict";
	var plateJson, jqxhr;
	plateJson = translateModelToOutputJson(plateModel);
	console.log("SendingToServer:" + JSON.stringify(plateJson));

	jqxhr = $.ajax({
		url: hostname + "/plateTemplate/save",
		type: "POST",
		data: JSON.stringify(plateJson),
		processData: false,
		contentType: "application/json; charset=UTF-8"
	}).done(function() {
		console.log("success");
	}).fail(function() {
		console.log("error");
		alert("An error while saving the template.");
	}).always(function() {
		console.log("complete");
	});

	// Set another completion function for the request above
	jqxhr.always(function(resData) {
		var storedTemplate = JSON.stringify(resData);
		console.log("result=" + storedTemplate);

		if (resData.plateTemplate !== undefined &&  resData.plateTemplate.id !== undefined) {
			console.log("storedTemplate['plateTemplate']=" + resData.plateTemplate);
			console.log("storedTemplate['plateTemplate']['id']=" + resData.plateTemplate.id);
			plateModel.templateID = resData.plateTemplate.id;
			if (window.expId !== undefined) {
				// if we're in an assay, then continue to assignlabels page
				window.location.href = hostname + "/experimentalPlateSet/createPlate" + '?expid=' + window.expId + '&tmpid=' + plateModel.templateID;
			} else {
				// if we're not in an assay, then return to homepage
				window.location.href = hostname + "/";
			}
		} else {
			alert("An error while saving the template: " + storedTemplate);
		}
	});
}

/**
 * Loads a json data structure received from the server. It is translated into 
 * a format understood by the local internal plate model and updates the grid
 * with the data received.
 * @param plateJson - a data structure in the format sent by the server.
 */
function loadJsonData(plateJson) {
	"use strict";
	var row, column, newContents;
	plateModel = translateInputJsonToModel(plateJson);

	for (row in plateModel.rows) {
		if (plateModel.rows.hasOwnProperty(row)) {
			for (column in plateModel.rows[row].columns) {
				if (plateModel.rows[row].columns.hasOwnProperty(column)) {
					newContents = plateModel.rows[row].columns[column].wellGroupName;

					grid.updateCellContents(row, column, newContents);
				}
			}
		}
	}
}

/**
 * jQuery setup commands.
 */
$(function() {
	"use strict";
	$("input[name=wellType]").on("change", function () {
		if ($(this).prop('id') === "emptyType") {
			document.getElementById("newLabelValue").value = "";
			document.getElementById("newLabelValue").disabled = true;
		} else {
			document.getElementById("newLabelValue").disabled = false;
		}
	});
});

/**
 * This function handles the window load event. It initializes and fills the
 * grid with blank data and sets up the event handlers.
 */
function init() {
	"use strict";
	if (window.tWidth !== undefined) {
		GRID_WIDTH = window.tWidth;
	}

	if (window.tHeight !== undefined) {
		GRID_HEIGHT = window.tHeight;
	}
	createGrid("myGrid", CELL_WIDTH, CELL_HEIGHT, GRID_WIDTH, GRID_HEIGHT);

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
