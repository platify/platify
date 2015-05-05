/*jslint browser:true */
/*global $, jQuery, alert*/

// constants
var CELL_HEIGHT = 25;
var CELL_WIDTH = 40;
var plateModel = {};

/**
 * Focuses on the text field when grid is selected
 */
function txtFieldFocus() {
	"use strict";
	// nothing to be focused on here
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
function translateModelToOutputJson(pModel) {		// TODO - this is not called here !!! - remove!!
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
 * Loads a json data structure received from the server. It is translated into 
 * a format understood by the local internal plate model and updates the grid
 * with the data received.
 * @param plateJson - a data structure in the format sent by the server.
 */
function loadJsonData(plateJson) {
	"use strict";
	var g_height, g_width, newData, row, column, newContents;
	// assuming plate model has all empty rows ??
	plateModel = translateInputJsonToModel(plateJson);  // TMP	--> should only load plateModel instead,
	g_height = DIMENSION;
	g_width = DIMENSION;
	
	if (plateModel.grid_height !== null && plateModel.grid_height !== undefined) {
		g_height = plateModel.grid_height;
	}
	
	if (plateModel.grid_width !== null && plateModel.grid_width !== undefined) {
		g_width = plateModel.grid_width;
	}
	
	newData = createBlankData(g_height, g_width);
	
	for (row in plateModel.rows) {
		if (plateModel.rows.hasOwnProperty(row)) {
			for (column in plateModel.rows[row].columns) {
				if (plateModel.rows[row].columns.hasOwnProperty(column)) {
					newContents = plateModel.rows[row].columns[column].wellGroupName;
					newContents += "," + plateModel.rows[row].columns[column].wellType;
					
					if (newContents !== null && newContents !== undefined) {
						newData[row - 1][column - 1] = newContents;
					}
				}
			}
		}
	}
	
	grid.setData(newData);

	// display the data
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT, true, Grid.editorCellFormatter, "editor-cell");
}

/**
 * Makes an ajax call to the server to retrieve the json data model containing
 * the information about a single stored template.
 * If successful it calls loadJsonData to update the grid with the new model.
 * @param tId - ID of template to retrieve the json data model for. 
 */
function fetchTemplateData(tId) {
	"use strict";
	// show loading view, until result is returned
	$("#gridView").hide();
	$("#loaderView").show();
	var jqxhr = $.ajax({
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
		$("#loaderView").hide();
		$("#gridView").show();
		loadJsonData(resData);
	});
}

/**
 * Event Handler for template select drop-down. When a new item is selected
 * the id of the selected item is passed to fetchTemplateData to retrieve the
 * template data and update the preview grid.
 * @param selectEl - selected item in the drop-down.
 */
function onPlateSelectChange(selectEl) {
	"use strict";
	var tId = selectEl.value;
	console.log("selectEvent!:" + tId);
	fetchTemplateData(tId);
}

/**
 * This Function updates the grid based on the current the id of the selected item 
 * in the template select drop-down. FetchTemplateData is called to retrieve the
 * template data and update the preview grid.
 * @param selectEl - selected item in the drop-down.
 */
function updatePlateSelection() {				// TODO can this be combined with the onPlateSelectChange method ??
	"use strict";
	var pSelect, tId;
	pSelect = document.getElementById("plateSelect");
	tId = pSelect.value;
	console.log("tId!:" + tId);
	if (tId !== undefined && tId !== null && tId !== "") {
		fetchTemplateData(tId);
	}
}

/**
 * Transitions to the next page, passing the currently selected template id as a param.
 */
function selectAndContinue() {
	"use strict";
	var pSelect = document.getElementById("plateSelect");
	if (pSelect.value !== undefined) {
		// use less hacky method !!
		window.location.href = hostname + "/experimentalPlateSet/createPlate" + '?expid=' + window.expId + '&tmpid=' + pSelect.value;
	} else {
		alert("An error while selecting the template. TemplateId is null");
	}
}

/**
 * This function handles the window load event. It initializes and fills the
 * grid with the initial item in the plateSelect drop-down, or blank data if 
 * no templates are available, and sets up the event handlers.
 */
function init() {
	"use strict";
	createGrid("myGrid", CELL_WIDTH, CELL_HEIGHT, DIMENSION, DIMENSION);

	// allows for passing input Json, but it not used here. Perhaps refactor!
	//var testInputJson = {"plate":{"wells":[{"row":"2","column":"2","control":null,"labels":[{"category":"c1","name":"l1","color":"#ffff00"}],"groupName":"L67"},{"row":"2","column":"3","control":null,"labels":[{"category":"c1","name":"l2","color":"#4780b8"}],"groupName":"L5"},{"row":"3","column":"2","control":null,"labels":[{"category":"c1","name":"l1","color":"#ffff00"},{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L51"},{"row":"3","column":"3","control":null,"labels":[{"category":"c1","name":"l2","color":"#4780b8"},{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L17"},{"row":"4","column":"2","control":null,"labels":[{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L2"},{"row":"4","column":"3","control":null,"labels":[{"category":"c2","name":"l3","color":"#8d7278"}],"groupName":"L47"}],"labels":[]}};
	//loadJsonData(testInputJson);
	
	addEvent("saveTemplate", "click", selectAndContinue);
	//addEvent("plateSelect", "change", onPlateSelectChange);

	// initially disable selection of grid cells
	disableGridSelection();
	
	var pSelect = document.getElementById("plateSelect");
	if (pSelect.value !== undefined && pSelect.value !== null) {
		fetchTemplateData(pSelect.value);
	}
}

window.onload = init;

/**
 * Template select drop-down uses selectize.
 */
$('#plateSelect').selectize({
    create: true,
    sortField: 'text'
});