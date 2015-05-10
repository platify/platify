/*jslint browser:true */
/*global $, jQuery, alert, console, Grid*/

// constants
var CELL_HEIGHT = 35;
var CELL_WIDTH = 75;
var data;
var plateModel = {};
var catLegend = {};

// tmp editlabel vars
var tmpEditOldLabel;
var tmpEditOldUnits;
var tmpEditCat;

/**
 * Focuses on appropriate visible text field.
 */
function txtFieldFocus() {
	"use strict";
	if ($("#addLabelPanel").is(":visible")) {
		$("#newCatValue").focus();
	} else if ($("#addDosePanel").is(":visible")) {
		$("#topDoseValue").focus();
	}
	// TODO add focus for other panels  !!!!!
}

/**
 * This function loads random numeric data into the already created and
 * displayed Grid. It is a handler for the event that the "loadData" button
 * is clicked. Only used for testing.
 */
function loadRandomData() {
	"use strict";
	data = createRandomData(plateModel.grid_height, plateModel.grid_width);
	grid.setData(data);
	grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT, true, Grid.editorCellFormatter, "editor-cell");
}

/**
 * Updates cells in the grid with category 'cat' and label 'label' to 
 * have the new color 'color'. Cells are updated based on the reference
 * to the cells with that cat/label stored in catLegend.
 * @param cat - name of category which label belongs to.
 * @param label - name of label to update color for.
 * @param color - the color the labels are updated to
 */
function updateCellColors(cat, label, color) {
	"use strict";
	var cellRef, cellRefArr, row, column, newContents, catKey, labKey;
	// update all cells with cat and label
	if (catLegend[cat] !== undefined && catLegend[cat] !== null && catLegend[cat].labels[label] !== undefined && catLegend[cat].labels[label] !== null) {
		for (cellRef in catLegend[cat].labels[label].cellref) {
			cellRefArr = catLegend[cat].labels[label].cellref[cellRef].split("-");
			row = cellRefArr[0];
			column = cellRefArr[1];
			plateModel.rows[row].columns[column].categories[cat] = {};
			plateModel.rows[row].columns[column].categories[cat][label] = {};
			plateModel.rows[row].columns[column].categories[cat][label].color = color;

			catLegend[cat].labels[label].color = color;

			// update actual grid cell
			newContents = plateModel.rows[row].columns[column].wellGroupName;
			newContents += "," + plateModel.rows[row].columns[column].wellType;
			
			for (catKey in plateModel.rows[row].columns[column].categories) {
				for (labKey in plateModel.rows[row].columns[column].categories[catKey]) {
					newContents += "," + plateModel.rows[row].columns[column].categories[catKey][labKey].color;
				}
			}
			grid.updateCellContents(row, column, newContents);
		}
	}
}

/**
 * Updates cells in the grid with the current visibility stored in catLegend[catKey].
 * If a cell contains a cat/label where the categories visibility is false then it will
 * not be shown in the grid. If its visibility is true it will be shown.
 * Only updates the cells containing the category passed as a param.
 * @param cat - name of category to update cells for.
 */
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
				newContents += "," + plateModel.rows[row].columns[column].wellType;
				
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

/**
 * Creates a label and text input for each wellgroup/compound
 * @param wellGroup - name of the wellgrouping/compound to create input for.
 */
function createCompoundInput(wellGroup) {
	"use strict";
	var newDiv, newInput;
	newDiv = document.createElement("div");
	newDiv.className = "col-xs-9";
	newInput = document.createElement("input");
	newInput.id = "wellGroup__sep__" + wellGroup;
	newInput.type = "text";
	newInput.className = "form-control";
	newDiv.appendChild(newInput);
	return newDiv;
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
	newInput.id = "color__sep__" + cat + "__sep__" + label;
	newInput.type = "color";
	newInput.className = "btn-default glyphicon color-p";
	newInput.defaultValue = catLegend[cat].labels[label].color;
	newInput.value = catLegend[cat].labels[label].color;

	editLabelBtn = document.createElement("button");
	editLabelBtn.id = "edit__sep__" + cat + "__sep__" + label;
	editLabelBtn.type = "button";
	editLabelBtn.className = "btn btn-default btn-xs glyphicon glyphicon-pencil";

	deleteLabelBtn = document.createElement("button");
	deleteLabelBtn.id = "delete__sep__" + cat + "__sep__" + label;
	deleteLabelBtn.type = "button";
	deleteLabelBtn.value = "Delete Label";
	deleteLabelBtn.className = "btn btn-default btn-xs glyphicon glyphicon-trash";

	cpDiv.appendChild(newInput);
	cpDiv.appendChild(editLabelBtn);
	cpDiv.appendChild(deleteLabelBtn);

	return cpDiv;
}

/**
 * Updates the list of compounds displayed beside the preview grid with 
 * the current compound values stored in groupNames.
 */
function updateCompoundList() {
	"use strict";
	var newDiv, wellGroup, innerDiv, newLabel, newInput;
	newDiv = document.createElement("div");
	for (wellGroup in groupNames) {
		if (wellGroup !== null) {
			innerDiv = document.createElement("div");
			innerDiv.className = "col-xs-12";
			newLabel = document.createElement("label");
			newLabel.setAttribute("for", "wellGroup__sep__" + wellGroup);
			newLabel.className = "col-xs-1 control-label";
			newLabel.appendChild(document.createTextNode(wellGroup + ": "));

			newInput = createCompoundInput(wellGroup);
			innerDiv.appendChild(newLabel);
			innerDiv.appendChild(newInput);
			newDiv.appendChild(innerDiv);
		}
	}
	document.getElementById("compoundList").innerHTML = newDiv.innerHTML;

	// only seems to take when object is in dom model already
	for (wellGroup in groupNames) {
		if (wellGroup !== null) {
			if (groupNames[wellGroup] !== undefined && groupNames[wellGroup] !== null) {
				document.getElementById("wellGroup__sep__" + wellGroup).value = groupNames[wellGroup];
			}
		}
	}
}

/**
 * Updates the list of Plate level labels displayed beside the preview grid
 * with the labels stored in plateModel.labels.
 */
function updatePlateLabelList() {
	"use strict";
	var pLabels, newDiv, i, newH;
	pLabels = plateModel.labels;
	newDiv = document.createElement("div");

	for (i = 0; i < pLabels.length; i++) {
		newH = document.createElement("H5");
		newH.appendChild(document.createTextNode(pLabels[i].category + ": "));
		newH.appendChild(document.createTextNode(pLabels[i].name));
		newDiv.appendChild(newH);
	}

	document.getElementById("plateLabelList").innerHTML = newDiv.innerHTML;
}


/**
 * Creates a new div containing a category label and visibility toggle.
 * @param catKey - name of category to create a label for.
 * @returns labDiv - div containing new category label structure.
 */
function createCatLabel(catKey) {
	"use strict";
	var labDiv, newCheckbox, newLabel, convCat;
	labDiv = document.createElement("div");
	labDiv.className = "button-labels";
	newCheckbox = document.createElement("input");
	newCheckbox.type = "checkbox";
	newCheckbox.checked = true;
	newCheckbox.id = "vischeck__sep__" + catKey;
	labDiv.appendChild(newCheckbox);
	newLabel = document.createElement("label");
	newLabel.setAttribute("for", "vischeck__sep__" + catKey);
	// if category has been converted from a decimal, then convert it back for display
	convCat = catKey.toString().split('__dot__').join('.');
	newLabel.appendChild(document.createTextNode(convCat));
	labDiv.appendChild(newLabel);

	return labDiv;
}

/**
 * Event handler for category color picker change.
 * Calls updateCellColors to update the categories with that label
 * currently displayed in the grid.
 */
function onCatColorChange(event) {
	"use strict";
	var idArr, cat, label;
	idArr = event.currentTarget.id.split("__sep__");
	cat = idArr[1];
	label = idArr[2];
	updateCellColors(cat, label, event.currentTarget.value);
}

/**
 * Event handler for category visibility checkbox.
 * Calls updateCatVisibility to update the visibility of the labels currently
 * in the gird that belong to the in question category.
 */
function onCatVisCheck(event) {
	"use strict";
	var idArr, cat;
	idArr = event.currentTarget.id.split("__sep__");
	cat = idArr[1];
	catLegend[cat].visible = event.currentTarget.checked;
	updateCatVisibility(cat);
}

/**
 * Event handler for label edit button.
 * Opens edit dialog box for category/label in question.
 */
function onEditLabelChange(event) {
	"use strict";
	var idArr, unit_split;
	
	idArr = event.currentTarget.id.split("__sep__");
	tmpEditCat = idArr[1];
	unit_split = idArr[2].toString().split('__dot__').join('.').split("__lu__");
	tmpEditOldLabel = unit_split[0];
	
	if (unit_split.length > 1) {
		tmpEditOldUnits = unit_split[1];
	} else {
		tmpEditOldUnits = "";
	}
	
	console.log("editLabel: " + tmpEditCat + ";" + tmpEditOldLabel);
	// display current label, with special chars converted for display
	document.getElementById("editNewLabelValue").value = tmpEditOldLabel;
	
	$('#editLabelModal').modal('show');
}

/**
 * Event handler for label edit button.
 * Opens edit dialog box for category/label in question.
 */
function onEditDoseChange(event) {
	"use strict";
	var idArr, unit_split;
	
	var idArr = event.currentTarget.id.split("__sep__");
	tmpEditCat = idArr[1];
	unit_split = idArr[2].toString().split('__dot__').join('.').split("__lu__");
	tmpEditOldLabel = unit_split[0];
	
	if (unit_split.length > 1) {
		tmpEditOldUnits = unit_split[1];
	} else {
		tmpEditOldUnits = "";
	}
	console.log("editDose: " + tmpEditCat + ";" + tmpEditOldLabel);
	// display current label, with special chars converted for display
	document.getElementById("editNewDoseValue").value = tmpEditOldLabel;
	document.getElementById("editNewUnitsValue").value = tmpEditOldUnits;
	
	$('#editDoseModal').modal('show');
}

/**
 * Event handler for label delete button.
 * Deletes the category/label in question from the grid and model
 * by calling removeLabel function.
 */
function onDeleteLabelChange(event) {
	"use strict";
	var idArr, cat, label;
	idArr = event.currentTarget.id.split("__sep__");
	cat = idArr[1];
	label = idArr[2];
	console.log("deleteLabel: " + cat + ";" + label);
	removeLabel(cat, label);
}

/**
 * Updates the list of well labels displayed beside the preview grid with 
 * the current well values stored in catLegend.
 */
function updateCategoryList() {
	"use strict";
	var newDiv, catKey, labelKey, newLi, convLab, newInput, unit_split, convUnits;
	newDiv = document.createElement("div");
	for (catKey in catLegend) {
		newDiv.appendChild(createCatLabel(catKey));
		for (labelKey in catLegend[catKey].labels) {
			newLi = document.createElement("div");
			// if label has been converted from a decimal, then convert it back for display
			convLab = labelKey.toString().split('__dot__').join('.');
			unit_split = convLab.toString().split('__lu__');
			
			newLi.appendChild(document.createTextNode(unit_split[0] + " "));
			if (unit_split.length > 1) {
				newLi.appendChild(document.createTextNode(unit_split[1]));
			}
			
			//units = catLegend[catKey].labels[labelKey].units;
			/*if (units !== undefined && units !== null && units !== "") {
				// if label has been converted from a decimal, then convert it back for display
				convUnits = units.toString().split('__dot__').join('.');
				newLi.appendChild(document.createTextNode(convUnits));
			}*/

			newInput = createColorPicker(catKey, labelKey);
			newLi.appendChild(newInput);
			newDiv.appendChild(newLi);
		}
	}
	document.getElementById("categoryList").innerHTML = newDiv.innerHTML;

	// apply events after they are part of dom.
	for (catKey in catLegend) {
		$("#vischeck__sep__" + catKey).attr('checked', 'checked');
		$("#vischeck__sep__" + catKey).change(onCatVisCheck);
		for (labelKey in catLegend[catKey].labels) {
			$("#color__sep__" + catKey + "__sep__" + labelKey).change(onCatColorChange);
			if (catKey === "dosage") {
				$("#edit__sep__" + catKey + "__sep__" + labelKey).click(onEditDoseChange);
			} else {
				$("#edit__sep__" + catKey + "__sep__" + labelKey).click(onEditLabelChange);
			}		
			$("#delete__sep__" + catKey + "__sep__" + labelKey).click(onDeleteLabelChange);
		}
	}
}

/**
 * Deletes the label passed as a param to the function. Removes labels
 * from the grid, and from plateModel. Also removes any references to
 * label and grid cells in catLegend. Removes category if label is the
 * only label in that category. 
 * @param cat - name of category in which the label belongs to.
 * @param label - name of label to remove.
 */
function removeLabel(cat, label) {
	"use strict";
	var cellRef, cellRefArr, row, column, newContents, catKey, labKey;
	delete catLegend[cat].labels[label].color;

	// remove all cells with cat and label
	for (cellRef in catLegend[cat].labels[label].cellref) {
		cellRefArr = catLegend[cat].labels[label].cellref[cellRef].split("-");
		row = cellRefArr[0];
		column = cellRefArr[1];

		delete plateModel.rows[row].columns[column].categories[cat];

		// update actual grid cell
		newContents = plateModel.rows[row].columns[column].wellGroupName;
		newContents += "," + plateModel.rows[row].columns[column].wellType;
		
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

/**
 * Renames an existing label. Updates all references to the existing label to
 * instead reference the new label name.
 * @param cat - name of category in which the label belongs to.
 * @param oldLabel - name of the existing label whose name will be changed.
 * @param label - new name of label.
 */
function updateLabelName(cat, oldLabel, label) {
	"use strict";
	var cellRef, cellRefArr, row, column;
	// remove spaces from the names (replacing with '_')
	cat = cat.toString().split(' ').join('_');
	label = label.toString().split(' ').join('_');

	// remove decimal point from the names (replacing with '_|_')
	cat = cat.toString().split('.').join('__dot__');
	label = label.toString().split('.').join('__dot__');

	// update color legend cell reverse lookup				
	if (catLegend[cat].labels[label] === undefined) {
		catLegend[cat].labels[label] = catLegend[cat].labels[oldLabel];

		console.log("Old color:" + catLegend[cat].labels[oldLabel].color);
		console.log("New color:" + catLegend[cat].labels[label].color);
		
		// update plateModel references
		for (cellRef in catLegend[cat].labels[label].cellref) {
			cellRefArr = catLegend[cat].labels[label].cellref[cellRef].split("-");
			row = cellRefArr[0];
			column = cellRefArr[1];

			plateModel.rows[row].columns[column].categories[cat][label] = plateModel.rows[row].columns[column].categories[cat][oldLabel];
			
			delete plateModel.rows[row].columns[column].categories[cat][oldLabel];
		}
		
		// remove old label
		delete catLegend[cat].labels[oldLabel];
		
		// referesh category elements
		updateCategoryList();
		$('#editLabelModal').modal('hide');
	} else {
		// other label already exists , can't rename on label to another existing label!
		alert('Cannot rename "' + oldLabel + '" to "' + label + '" as label with that name already exists.');
	}
}

/**
 * Validates a rename of a label. If valid it updates the label.
 */
function editLabelName() {
	var convOld;
	var newLabel = document.getElementById("editNewLabelValue").value;
	
	// validation new label name
	if (newLabel === undefined || newLabel === "") {
       alert('Label cannot be blank');
   // } else if (isReservedValue(units)) {
   //    alert('Units contains reserved value: '+ units);
    } else {
		// remove spaces from the names (replacing with '_')
		newLabel = newLabel.toString().split(' ').join('_');

		// remove decimal point from the names (replacing with '_|_')
		newLabel = newLabel.toString().split('.').join('__dot__');
		
		convOld = tmpEditOldLabel.toString().split(' ').join('_').split('.').join('__dot__') + "__lu__";
		
		updateLabelName(tmpEditCat, convOld, newLabel + "__lu__");
		tmpEditCat = "";
		tmpEditOldLabel = "";
	}
}

/**
 * Validates a rename of a dosage. If valid it updates the dosage.
 */
function editDoseValue() {
	var newDosage = document.getElementById("editNewDoseValue").value;
	var newUnits = document.getElementById("editNewUnitsValue").value;
	var convOld;
	
	// validation new doage
    if (!isNumeric(newDosage) || newDosage < 0) {
       alert('Dosage must be a positive number: '+ newDosage);
    } else if (isReservedValue(newUnits)) {
       alert('Units contains a reserved value: '+ newDosage);
    } else {
		// remove spaces from the names (replacing with '_')
		newDosage = newDosage.toString().split(' ').join('_');
		newUnits = newUnits.toString().split(' ').join('_');

		// remove decimal point from the names (replacing with '_|_')
		newDosage = newDosage.toString().split('.').join('__dot__');
		newUnits = newUnits.toString().split('.').join('__dot__');

		convOld = tmpEditOldLabel.toString().split(' ').join('_').split('.').join('__dot__') + "__lu__" + tmpEditOldUnits.toString().split(' ').join('_').split('.').join('__dot__');
		
		updateLabelName(tmpEditCat, convOld, newDosage + "__lu__" + newUnits);
		tmpEditCat = "";
		tmpEditOldLabel = "";
		$('#editDoseModal').modal('hide');
	}
}

/**
 * Returns a color that is a percentage ligher/darker than the passed color.
 * code sample from:  http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
 * @param color - the value of the color to lighten/darken.
 * @param percent - new percentage to lighten/darken color.
 * @returns the value of the lightened/darkened color.
 */
// code sample from http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function shadeColor2(color, percent) {
	"use strict";
	var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
	return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

/**
 * Returns a color that is a percentage ligher/darker than the passed color.
 * @param color - the value of the color to lighten/darken.
 * @param percent - new percentage to lighten/darken color.
 * @returns the value of the lightened/darkened color.
 */
function shade(color, percent) {
	"use strict";
	if (color.length > 7) {
		// dealing with random longer value passed, shouldn't happen really
		return "0x0000FF";
	} else {
		return shadeColor2(color, percent);
	}
}

/**
 * Creates a new label in the specified category. Applies the new label to
 * the specified grid cells. Updates the grid, plate model, and well labels 
 * panel with the values for the new label
 * @param cat - name of the category of the new label.
 * @param label - name of the new label.
 * @param units - name of the units of the new label.
 * @param color - color of the new label.
 * @param applyToCells - list of grid cells to apply the label to.
 */
function createNewLabel(cat, label, units, color, applyToCells) {
	"use strict";
	var cell, row, column, oldLab, pos, newContents, catKey, labKey, l_units;
	// remove spaces from the names (replacing with '_')
	cat = cat.toString().split(' ').join('_');
	label = label.toString().split(' ').join('_');
	units = units.toString().split(' ').join('_');

	// remove decimal point from the names (replacing with '_|_')
	cat = cat.toString().split('.').join('__dot__');
	label = label.toString().split('.').join('__dot__');
	units = units.toString().split('.').join('__dot__');
	
	// temp hack to fix editing of units -- should find better solution
	l_units = label + "__lu__" + units;

	// update catLegend color
	if (catLegend[cat] === undefined) {
		catLegend[cat] = {};
		catLegend[cat].labels = {};
		catLegend[cat].visible = true;
	}

	if (catLegend[cat].labels[l_units] === undefined) {
		catLegend[cat].labels[l_units] = {};
		catLegend[cat].labels[l_units].color = color;
	} else {
		catLegend[cat].labels[l_units].color = color;
		// category and label already exist, just changing color,
		// in this case cells which already have this label need their color updated also!!
		updateCellColors(cat, l_units, color);
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
		plateModel.rows[row].columns[column].categories[cat][l_units] = {};
		plateModel.rows[row].columns[column].categories[cat][l_units].color = color;
		newContents = plateModel.rows[row].columns[column].wellGroupName;
		newContents += "," + plateModel.rows[row].columns[column].wellType;

		for (catKey in plateModel.rows[row].columns[column].categories) {
			for (labKey in plateModel.rows[row].columns[column].categories[catKey]) {
				newContents += "," + plateModel.rows[row].columns[column].categories[catKey][labKey].color;
			}
		}

		grid.updateCellContents(row, column, newContents);

		// update color legend cell reverse lookup
		if (catLegend[cat].labels[l_units].cellref === undefined) {
			catLegend[cat].labels[l_units].cellref = [];
			catLegend[cat].labels[l_units].cellref.push(row + "-" + column);
		} else {
			if (catLegend[cat].labels[l_units].cellref.indexOf(row + "-" + column) === -1) {
				catLegend[cat].labels[l_units].cellref.push(row + "-" + column);
			} else {
				console.log("already there");
			}
		}
	}
}


/**
 * Checks if the string matches an reserved value
 */
function isReservedValue(testStr) {
	if (testStr === "compound" || testStr === "dosage" || testStr.indexOf("__dot__") > -1  || testStr.indexOf("__sep__") > -1 || testStr.indexOf("__lu__") > -1) {
		return true;
	} else {
		return false;
	}
}

/**
 * Checks if the string is numeric
 */
function isNumeric(testStr) {
    return !jQuery.isArray(testStr) && (testStr - parseFloat(testStr) + 1) >= 0;
}

/**
 * Checks if the string is an integer
 */
function isInteger(testStr) {
    if (isNaN(testStr)) {
		return false;
	}
	var x = parseFloat(testStr);
	return (x | 0) === x;
}

/**
 * Adds a new label by calling createNewLabel. The values for
 * the new label are taken from the inputs on the new label panel.
 */
function addNewLabel() {
	"use strict";
	var selCells, cat, label, color;
	selCells = highlightedCoords;
	console.log(selCells);
	cat = document.getElementById("newCatValue").value;
	label = document.getElementById("newLabelValue").value;
	color = document.getElementById("newColorValue").value;
	
	// validate input
	if(isReservedValue(cat)) {
       alert('Category contains reserved value: '+ cat);
    } else if (isReservedValue(label)) {
       alert('Label contains reserved value: '+ label);
    } else {
		createNewLabel(cat, label, "", color, selCells);
		updateCategoryList();
		// output current object model to console
		console.log("plateModel:" + JSON.stringify(plateModel));
		console.log("catLegend:" + JSON.stringify(catLegend));

		removeAllHighlightedCells();
	}
}

/**
 * Adds a new dosage. The values for the new dose is taken
 * from the inputs on the dose label panel. 'Dosage' is a 
 * reserved category name and is automatically applied here.
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
	
	// validate input
	if (!isNumeric(label) || label < 0) {
       alert('Dosage must be a positive number: '+ label);
    } else if (isReservedValue(units)) {
       alert('Units contains reserved value: '+ units);
    } else {
		createNewLabel(cat, label, units, color, selCells);
		updateCategoryList();

		// output current object model to console
		console.log("plateModel:" + JSON.stringify(plateModel));
		console.log("catLegend:" + JSON.stringify(catLegend));

		removeAllHighlightedCells();
	}
}

/**
 * Adds a new dose gradient to the wells currently selected in the grid.
 * Value starts at the top dose specified, and each well after has its
 * dose equal to the dilution factor of the previous one. If replicates
 * are specified than the selected cells are split that number of separate 
 * dose gradients.
 */
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
	
	// validate input
	if (!isNumeric(topDose) || topDose <= 0) {
		alert('Top Dose must be a positive number: '+ topDose);
	} else if (isReservedValue(units)) {
       alert('Units contains reserved value: '+ units);
    } else if (!isNumeric(dilution) || dilution <= 0) {
		alert('Dilution Factor must be a positive number: '+ dilution);
	} else if (!isInteger(replicates) || replicates < 0) {
		alert('# of Replicates must be a positive integer: '+ replicates);
	} else if (wellGroupLength <= replicates) {
		alert('# of Replicates cannot be <= # of wells selected. Wells Selected: '+ wellGroupLength + '; Replicates: '+ replicates);
	} else {
		replicates++;
		//doseStepLength = wellGroupLength / replicates;
		currentDose = topDose;
		currentColor = topColor;

		for (i = 0; i < wellGroupLength; i++) {
			for (j = 0; j < replicates && ((i + j) < wellGroupLength); j++) {
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
}

/**
 * Adds a new plate level. The values for the new label is taken
 * from the inputs on the new plate label panel.
 */
function addNewPlateLabel() {
	"use strict";
	var cat, label, pLabel;
	cat = document.getElementById("newPlateCatValue").value;
	label = document.getElementById("newPlateLabelValue").value;
	
	// validate input
	if(isReservedValue(cat)) {
       alert('Category contains reserved value: '+ cat);
    } else if (isReservedValue(label)) {
       alert('Label contains reserved value: '+ label);
    } else {
		if (plateModel.labels === undefined) {
			plateModel.labels = [];
		}

		pLabel = {};
		pLabel.category = cat;
		pLabel.name = label;

		plateModel.labels.push(pLabel);

		updatePlateLabelList();
	}
}

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
                    if (row[0] in groupNames) {
                        groupNames[row[0]] = row[1];
                    }
                });
                break;

            default:
                alert('Compounds file can contain 1 column (matched in order) or 2 columns (first is well grouping, second is compound), but no more');
                return;
        }
        updateCompoundList();
    };

    reader.readAsText($('#compoundsFile')[0].files[0]);
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
	"use strict";
	var plateJson, plate, wellGroup, cmpdValue, row, column, well, labels, catKey, labKey, label, convCat, convLab, cmpdLabel, i, j, labelRemovedUnits;
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
			cmpdValue = document.getElementById("wellGroup__sep__" + wellGroup).value;
			if (cmpdValue === undefined || cmpdValue === null || cmpdValue === "") {
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
				well.control = pModel.rows[i].columns[j].wellType;
				
				for (catKey in pModel.rows[i].columns[j].categories) {
					for (labKey in pModel.rows[i].columns[j].categories[catKey]) {
						label = {};
						// if catKey, or labKey have been converted from a decimal, convert them back for output!
						convCat = catKey.toString().split('__dot__').join('.');
						convLab = labKey.toString().split('__dot__').join('.');
						labelRemovedUnits = labKey.toString().split('__lu__');
						
						label.category = convCat;
						label.name = labelRemovedUnits[0];
						label.value = pModel.rows[i].columns[j].categories[catKey][labKey].color;
						if (labelRemovedUnits.length > 1) {
							label.units = labelRemovedUnits[1];
						} else {
							label.units = "";
						}
						labels.push(label);
					}
				}
				
				if (well.groupName !== undefined && well.groupName !== null && well.groupName !== "") {
					cmpdLabel = {};
					cmpdLabel.category = "compound";
					cmpdLabel.name = groupNames[well.groupName];
					labels.push(cmpdLabel);
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

/**
 * Makes new label panel visible. Hides other panels
 * Enables grid selection. Display well label category panel.
 */
function showLabelPanel() {
	"use strict";
	hideDosePanel();
	hideDoseStepPanel();
	hidePlateLabelPanel();
	hidePlateLabelCatPanel();
	$("#addLabelPanel").show();
	enableGridSelection();
	showCategoryPanel();
}

/**
 * Makes dose label panel visible. Hides other panels
 * Enables grid selection. Display well label category panel.
 */
function showDosePanel() {
	"use strict";
	hideLabelPanel();
	hideDoseStepPanel();
	hidePlateLabelPanel();
	hidePlateLabelCatPanel();
	$("#addDosePanel").show();
	enableGridSelection();
	showCategoryPanel();
}

/**
 * Makes dose step label panel visible. Hides other panels
 * Enables grid selection. Display well label category panel.
 */
function showDoseStepPanel() {
	"use strict";
	hideLabelPanel();
	hideDosePanel();
	hidePlateLabelPanel();
	hidePlateLabelCatPanel();
	$("#addDoseStepPanel").show();
	enableGridSelection();
	showCategoryPanel();
}

/**
 * Makes plate level label panel visible. Hides other panels
 * Disables grid selection. Displays plate label category panel.
 */
function showPlateLabelPanel() {
	"use strict";
	hideLabelPanel();
	hideDosePanel();
	hideDoseStepPanel();
	hideCategoryPanel();
	$("#addPlateLabelPanel").show();

	// disable grid selection, (labels only apply to plate level)
	disableGridSelection();
	removeAllHighlightedCells();
	showPlateLabelCatPanel();
}


/**
 * jQuery setup commands.
 */
$(function() {
	"use strict";
	$("input[name=labeltype]").on("change", function () {
		if ($(this).prop('id') === "catLabType") {
			showLabelPanel();
		} else if ($(this).prop('id') === "doseLabType") {
			showDosePanel();
		} else if ($(this).prop('id') === "doseStepLabType") {
			showDoseStepPanel();
		} else if ($(this).prop('id') === "plateLabType") {
			showPlateLabelPanel();
		}
	});

	$('[data-toggle="popover').popover({
		trigger: 'hover',
		'placement': 'top'
	});

	$('#importCompoundsModal').on('hidden.bs.modal', function (e) {
		$('#importCompoundsForm')[0].reset();
	});
});

/**
 * Loads a json data structure received from the server. It is translated into 
 * a format understood by the local internal plate model and updates the grid
 * with the data received.
 * @param plateJson - a data structure in the format sent by the server.
 */
function loadJsonData(plateJson) {
	"use strict";
	var row, column, wellgrp, wellType, catKey, labKey, color, newContents;
	// translate the json received to the internal models structure
	plateModel = translateInputJsonToModel(plateJson);

	// create initial grid, based on template size
	if (plateModel.grid_width === undefined || plateModel.grid_width === null) {
		plateModel.grid_width = 100; // default value
	}

	if (plateModel.grid_height === undefined || plateModel.grid_height === null) {
		plateModel.grid_height = 100; // default value
	}

	createGrid("myGrid", CELL_WIDTH, CELL_HEIGHT, plateModel.grid_width, plateModel.grid_height);

	// load data into the grid
	for (row in plateModel.rows) {
		for (column in plateModel.rows[row].columns) {
			wellgrp = plateModel.rows[row].columns[column].wellGroupName;
			wellType = plateModel.rows[row].columns[column].wellType;
			if (wellgrp !== undefined && wellgrp !== null && wellgrp !== "") {
				groupNames[wellgrp] = "";
			}

			newContents = wellgrp;
			if (wellType !== undefined && wellType !== null && wellType !== "") {
				newContents += "," + wellType;
			}

			for (catKey in plateModel.rows[row].columns[column].categories) {
				for (labKey in plateModel.rows[row].columns[column].categories[catKey]) {
					color = plateModel.rows[row].columns[column].categories[catKey][labKey].color;
					units = plateModel.rows[row].columns[column].categories[catKey][labKey].units;
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

/**
 * Makes an ajax call to the server to retrieve the json data model containing
 * the information about a single stored template.
 * If successful it calls loadJsonData to update the grid with the new model.
 * @param tId - ID of template to retrieve the json data model for. 
 */
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
 * grid with the template that is specified in the url params.
 */
function init() {
	"use strict";
	hidePlateLabelCatPanel();
	hideDosePanel();
	hideDoseStepPanel();
	hidePlateLabelPanel();

	// fetch templateJson
	fetchTemplateData(window.templateId);
	console.log("templateId:" + window.templateId);

	addEvent("addNewLabel", "click", addNewLabel);
	addEvent("addNewDose", "click", addNewDose);
	addEvent("addDoseStep", "click", addDoseStep);
	addEvent("addNewPlateLabel", "click", addNewPlateLabel);
	addEvent("clearAllSelection", "click", removeAllHighlightedCells);

	enableGridSelection();
}

window.onload = init;
