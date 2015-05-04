/*jslint browser:true */
/*global $, jQuery, alert*/

var groupNames = {};	// tracks imported compounds/wellgroup relationship 

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
			result[i][j] = "";
		}
	}
	return result;
}

/**
 * Creates a random data set for displaying in the grid example
 * page. The data set is of dimension grid_height x grid_width.
 * @param grid_height - number of rows on the grid
 * @param grid_width - number of columns on the grid
 */
function createRandomData(grid_height, grid_width) {		// TODO - perhaps remove (only used for testing)
	"use strict";
	var i, j, result;
	result = [];

	for (i = 0; i < grid_height; i++) {
		result[i] = [];
		for (j = 0; j < grid_width; j++) {
			result[i][j] = "L" + Math.floor(Math.random() * 100);
		}
	}
	return result;
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
	var pModel, plate, i, j, row, column, groupName, wellType, labels, convCat, convLab;
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
			if (plate.wells[i].control !== undefined && plate.wells[i].control !== null) {
				wellType = plate.wells[i].control;
			} else {
				wellType = "compound";		// fail back to compound ??
			}
		} else {
			groupName = "";
			wellType = "empty";
		}
		
		labels = plate.wells[i].labels;

		if (pModel.rows[row] === undefined) {
			pModel.rows[row] = {};
			pModel.rows[row].columns = {};
		}

		if (pModel.rows[row].columns[column] === undefined) {
			pModel.rows[row].columns[column] = {};
			pModel.rows[row].columns[column].wellGroupName = groupName;
			pModel.rows[row].columns[column].wellType = wellType;
			pModel.rows[row].columns[column].categories = {};
		}

		for (j = 0; j < labels.length; j++) {
			// convert possible disruptive input to safer format !
			convCat = labels[j].category.toString().split('.').join('__dot__');
			convLab = labels[j].name.toString().split('.').join('__dot__');

			if (convCat === "compound") {
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

