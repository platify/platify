/**
 * created by Jaime Valencia
 * Modified by zacharymartin on 3/17/15.
 */

// the JSON string variable def below is for testing ParsingConfig object loading along
// with parse only mode
//var equipment = '{"name":"Envision Parse Magic","machineName":"Envision Green Light Analyzer 3424","description":"A great little parsing configuration that you will just love to death","delimiter":"tab","plate":{"featureLabel":"plate","topLeftCoords":[1,1],"bottomRightCoords":[24,26],"topLeftValue":"Barcode Assay: ","relativeToLeftX":1,"relativeToLeftY":1,"color":0,"typeOfFeature":1},"plateInvariates":[[1,1,"Barcode Assay: "]],"features":{"Temperature":{"featureLabel":"Temperature","topLeftCoords":[6,2],"bottomRightCoords":[6,2],"topLeftValue":"22.7","relativeToLeftX":1,"relativeToLeftY":5,"color":1,"typeOfFeature":"plateLevel","importData":true},"green light emission":{"featureLabel":"green light emission","topLeftCoords":[6,3],"bottomRightCoords":[21,26],"topLeftValue":"1.2475","relativeToLeftX":2,"relativeToLeftY":5,"color":2,"typeOfFeature":"wellLevel","importData":true}}}';

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

// Tabs constants
var PARSING = 0;
var PLATES = 1;
var FEATURES = 2;
var activeTab = 0;

var examiner;
var grid;
var parsingConfig;
var importData;
var selectCells;  // a reference to the function to be used for handling cell selection,
                  // set by handleTabChange function

var colorPointer = 0;
var colorPicker = new ColorPicker();



// TODO - institute more complex highlighting behavior
var plateHighlightKeys = [];
var featureHighlightKeys = [];
var invariateHighlightKeys = [];
var highlightKeys = [];

function loadParsingConfig(JSONparsingConfig){
    parsingConfig = ParsingConfig.loadParsingConfig(JSONparsingConfig);

    var parsingNameElement = document.getElementById("parsingName");
    var machineNameElement = document.getElementById("machineName");
    var parsingDescriptionElement = document.getElementById("parsingDescription");
    var firstPlateCellRangeElement = document.getElementById("firstPlateCellRange");
    var featureCellRangeElement = document.getElementById("featureCellRange");
    var featureCategoryElement = document.getElementById("featureCategory");

    parsingNameElement.value = parsingConfig.name;
    machineNameElement.value = parsingConfig.machineName;
    parsingDescriptionElement.value = parsingConfig.description;
    firstPlateCellRangeElement.value
        = Grid.getRowLabel(parsingConfig.plate.topLeftCoords[0])
            + parsingConfig.plate.topLeftCoords[1] + ":"
            + Grid.getRowLabel(parsingConfig.plate.bottomRightCoords[0])
            + parsingConfig.plate.bottomRightCoords[1];

    reloadFeatureSelector();

    parseOnlyMode();
}

/**
 * This function sets the parser so that the parsing config cannot be modified
 */
function parseOnlyMode(){
    var parsingNameElement = document.getElementById("parsingName");
    var machineNameElement = document.getElementById("machineName");
    var parsingDescriptionElement = document.getElementById("parsingDescription");
    var firstPlateCellRangeElement = document.getElementById("firstPlateCellRange");
    var featureCellRangeElement = document.getElementById("featureCellRange");
    var featureCategoryElement = document.getElementById("featureCategory");

    parsingNameElement.readOnly = true;
    machineNameElement.readOnly = true;
    parsingDescriptionElement.readOnly = true;
    firstPlateCellRangeElement.readOnly = true;
    featureCellRangeElement.readOnly = true;
    featureCategoryElement.readOnly = true;

    document.getElementById(parsingConfig.delimiter).selected = true;
    document.getElementById("delimiterList").disabled = true;
    //document.getElementById("saveConfig").style.display = "none";
    document.getElementById("saveConfigToServer").style.display = "none";
    document.getElementById("applyFirstPlate").style.display = "none";
    document.getElementById(WELL_LEVEL).onclick = function(){return false;};
    document.getElementById(PLATE_LEVEL).onclick = function(){return false;};
    document.getElementById(EXPERIMENT_LEVEL).onclick = function(){return false;};
    document.getElementById("newFeature").style.display = "none";
    document.getElementById("saveFeature").style.display = "none";
    document.getElementById("deleteFeature").style.display = "none";

    grid.disableCellSelection();
}


function handleExaminerLoad(examiner){
    setDelimiter(examiner.delimiter);
    grid.setData(examiner.matrix);
    grid.fillUpGrid();
    grid.registerSelectedCellCallBack(handleSelectedCells);  // maybe move to init function
}

function applyFeatures(){
    clearFeatureValues();
    removeAllHighlighting();

    var colorKeys = parsingConfig.highlightPlatesAndFeatures(colorPicker, grid);
    highlightKeys = highlightKeys.concat(colorKeys);
}

function removeAllHighlighting(){
    removeHighlightKeys();
    removeAllFeatureHighlightKeys();
    removeAllPlateHighlightKeys();
    removeAllInvariateHighlightKeys();
}

function removeHighlightKeys(){
    for(var i=0; i<highlightKeys.length; i++){
        grid.removeCellColors(highlightKeys[i]);
    }
}

function removeAllPlateHighlightKeys(){
    for(var i=0; i<plateHighlightKeys.length; i++){
        grid.removeCellColors(plateHighlightKeys[i]);
    }
}

function removeAllFeatureHighlightKeys(){
    for(var i=0; i<featureHighlightKeys.length; i++){
        grid.removeCellColors(featureHighlightKeys[i]);
    }
}

function removeAllInvariateHighlightKeys(){
    for(var i=0; i<invariateHighlightKeys.length; i++){
        grid.removeCellColors(invariateHighlightKeys[i]);
    }
}

function makePlate(){
    parsingConfig.addPlate(grid, examiner);

    // highlight the plates on the grid
    plateHighlightKeys = plateHighlightKeys.concat(
        parsingConfig.highlightAllPlates(colorPicker, grid)
    );
}

function makeFeature(){
    var category = document.getElementById("featureCategory").value;
    var feature;


    if (document.getElementById("wellLevel").checked){
        feature = parsingConfig.addWellLevelFeature(category, grid);
    } else if (document.getElementById("plateLevel").checked){
        feature = parsingConfig.addPlateLevelFeature(category, grid);
    } else if (document.getElementById("experimentLevel").checked){
        feature = parsingConfig.addExperimentLevelFeature(category, grid);
    }

    parsingConfig.features[feature.featureLabel] = feature;

    // load feature selector
    reloadFeatureSelector();

    // set feature selector to new element
    var featureSelectElement = document.getElementById("featureList");
    featureSelectElement.value = category;
    setFeatureSelect(category);
}

function deleteFeature(){
    var featureSelectElement = document.getElementById("featureList");
    var nameOfFeatureToDelete = featureSelectElement.value;

    removeAllHighlighting();

    if (nameOfFeatureToDelete){
        parsingConfig.deleteFeature(nameOfFeatureToDelete);
        reloadFeatureSelector();
        clearFeatureValues();
    }
}

function handleNewFeature(){
    clearFeatureValues();
    removeAllHighlighting();
    // highlight plates if already specified
    if (parsingConfig && parsingConfig.plate && examiner && examiner.rowsSize){
        plateHighlightKeys = plateHighlightKeys.concat(
            parsingConfig.highlightAllPlates(colorPicker, grid)
        );
    }
}

function reloadFeatureSelector(){
    var featureSelectElement = document.getElementById("featureList");

    // clear feature selector
    featureSelectElement.innerHTML = "";

    // load feature selector
    for (var featureName in parsingConfig.features){
        var feature = parsingConfig.features[featureName];
        var option = document.createElement("option");
        option.setAttribute("value", featureName);
        option.innerHTML = featureName;
        featureSelectElement.appendChild(option);
    }
}

function clearFeatureValues(){
    var featureRangeInput = document.getElementById("featureCellRange");
    var featureNameInput = document.getElementById("featureCategory");
    var featureSelectElement = document.getElementById("featureList");
    var labelSelectElement = document.getElementById("labelList");
    var wellLevelRadio = document.getElementById(WELL_LEVEL);
    var plateLevelRadio = document.getElementById(PLATE_LEVEL);
    var experimentLevelRadio = document.getElementById(EXPERIMENT_LEVEL);

    featureRangeInput.value = "";
    featureNameInput.value = "";
    labelSelectElement.innerHTML = "";
    wellLevelRadio.checked = false;
    plateLevelRadio.checked = false;
    experimentLevelRadio.checked = false;

    // deselect all features
    var featureOptions = featureSelectElement.options

    for (var i=0; i<featureOptions.length; i++){
        featureOptions[i].selected = false;
    }
}

function handleFeatureSelect(event){
    var target = getTargetElement(event);
    var featureName = target.value;
    setFeatureSelect(featureName);
}

function setFeatureSelect(featureName){
    var featureRangeInput = document.getElementById("featureCellRange");
    var featureNameInput = document.getElementById("featureCategory");

    var feature = parsingConfig.features[featureName];
    var featureRange = Grid.getRowLabel(feature.topLeftCoords[0])
        + feature.topLeftCoords[1] + ":"
        + Grid.getRowLabel(feature.bottomRightCoords[0])
        + feature.bottomRightCoords[1];
    var featureType = feature.typeOfFeature;

    featureRangeInput.value = featureRange;
    featureNameInput.value = featureName;
    document.getElementById(featureType).checked = true;

    reloadLabelSelector(featureName);

    removeAllHighlighting();


    if (parsingConfig && parsingConfig.plate && examiner && examiner.rowsSize){

        // highlight plates
        plateHighlightKeys = plateHighlightKeys.concat(
            parsingConfig.highlightAllPlates(colorPicker, grid)
        );

        // highlight the feature
        var colorKey = parsingConfig.highlightFeature(featureName, colorPicker, grid);
        highlightKeys.push(colorKey);
    }




}

function reloadLabelSelector(featureName){
    var labelSelectElement = document.getElementById("labelList");

    // clear the label selector
    labelSelectElement.innerHTML = "";
    labelSelectElement.scrollTop = 0;
    // load the label selector
    var descriptors = parsingConfig.getFeatureValuesDescriptors(featureName, grid);

    for (var i=0; i<descriptors.length; i++){
        var value = descriptors[i].cell;
        var descriptor = descriptors[i].descriptor;
        var option = document.createElement("option");
        option.setAttribute("value", value);
        option.innerHTML = descriptor;
        labelSelectElement.appendChild(option);
    }
}


//TODO move this function to a different file
function showUserMsg(typMsg,msg){
	
	console.log(typMsg);
	
	$("#userMsgPanel").addClass("ui-state-"+(typMsg==="error"?"error":"highlight")+" ui-corner-all");
	$("#userMsgPanel").text(msg);
	$("#userMsgPanel").show("fade", {}, 500 ,callBckFadeOut);
}

// TODO move this function to a different file
function callBckFadeOut() {
  setTimeout(function() {
    $( "#userMsgPanel:visible" ).removeClass().fadeOut();
  }, 5000 );
}


// TODO add the URI for the server call as a parameter
function saveConfigToServer(){
    
	createParsingConfig();
	
	var targetUrl;
	var verb;
	if (parsingConfig.id){
		targetUrl = hostname+"/equipment/update/" + parsingConfig.id;
		verb = "PUT";
	}else{
		targetUrl = hostname+"/equipment/save"
		verb = "POST";
	}
    
	console.log(JSON.stringify(parsingConfig.getJSONString()));
	
    var jqxhr = $.ajax({
        url: targetUrl,
        type: verb,
        data: JSON.stringify(parsingConfig.getJSONString()),
        processData: false,
        contentType: "application/json; charset=UTF-8"
    	}).done(function(resData) {
    		console.log( JSON.stringify(resData) );
    		if (!resData.error){
    			parsingConfig.id = resData.equipment.id;
    			console.log("parsingConfig.id " + parsingConfig.id);
    			showUserMsg("highlight","Parse configuration stored successfully " );
    		}else{
    			showUserMsg("error","Error. when trying to store configuration => " + JSON.stringify(resData) );
    		}	
		}).fail(function(resData) {
			console.log( "error "  + JSON.stringify(resData));
			showUserMsg("error","Error. when trying to store configuration => " + JSON.stringify(resData) );
		});
    
}


function handleFileSelect(event) {
    var files;
    var fileNameDisplayElement = document.getElementById("selectedFile");

    if (event.target && event.target.files){
        // file input case
        files = event.target.files; // FileList object
    } else if (event.dataTransfer && event.dataTransfer.files) {
        // drag and drop case
        files = event.dataTransfer.files;
    }

    // reset parser
    colorPointer = 0;

    fileNameDisplayElement.innerHTML = files[0].name;
    examiner.setFile(files[0]);

}

function changeDelimiter(){
    var delimiter = document.getElementById("delimiterList").value;
    examiner.reExamineWithDelimiter(delimiter);
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);

function handleGetFile(){
    $("#files").click();
}

function setDelimiter(delimiter){
    var element = document.getElementById("delimiterList");
    element.value = delimiter;

}

// Attach listener for when a file is first dragged onto the screen
document.addEventListener('dragenter', function(e) {
    e.stopPropagation();
    e.preventDefault();

    // Show an overlay so it is clear what the user needs to do
    document.body.classList.add('show-overlay');
}, false);

// Attach a listener for while the file is over the browser window
document.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
}, false);

// Attach a listener for when the file is actually dropped
document.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();

    // Hides the overlay
    //document.body.classList.remove('show-overlay');

    // Process the files
    handleFileSelect(e);

}, false);

/**
 * replaces anonymous function starting on line 114 of original csvParser.html
 * @param startRow
 * @param startCol
 * @param endRow
 * @param endCol
 */
function handleSelectedCells(startRow, startCol, endRow, endCol){
    selectCells(startRow, startCol, endRow, endCol);
}

function selectCellsParsing(startRow, startCol, endRow, endCol){

    // remove previous highlighting
    removeAllHighlighting();

    // highlight those cells with the current color
    var coordinatesToHighlight = [];
    for (var i=startRow; i<=endRow; i++){
        for (var j=startCol; j<=endCol; j++){
            coordinatesToHighlight.push([i,j]);
        }
    }

    var colorKey = colorPicker.getDistinctColorKey();
    highlightKeys.push(colorKey);

    grid.setCellColors(coordinatesToHighlight,
        "#d3d3d3",
        colorKey);
    highlightKeys.push(colorPicker.getCurrentColorKey());
}

function selectCellsPlates(startRow, startCol, endRow, endCol){
    // plate range input on the plate page
    var plateRangeInput = document.getElementById("firstPlateCellRange");
    plateRangeInput.value = Grid.getRowLabel(startRow)+startCol+":"
    +Grid.getRowLabel(endRow)+endCol;

    // remove previous highlighting
    removeAllHighlighting();


    // highlight those cells with the current color
    var coordinatesToHighlight = [];
    for (var i=startRow; i<=endRow; i++){
        for (var j=startCol; j<=endCol; j++){
            coordinatesToHighlight.push([i,j]);
        }
    }
    grid.setCellColors(coordinatesToHighlight,
        colorPicker.getColorByIndex(colorPointer),
        colorPicker.getCurrentColorKey());
    highlightKeys.push(colorPicker.getCurrentColorKey());
}

function selectCellsFeatures(startRow, startCol, endRow, endCol){
    // feature range input on the feature page
    var featureRangeInput = document.getElementById("featureCellRange");
    featureRangeInput.value = Grid.getRowLabel(startRow)+startCol+":"
    +Grid.getRowLabel(endRow)+endCol;

    // remove previous highlighting
    removeAllHighlighting();

    // highlight plates if already specified
    if (parsingConfig && parsingConfig.plate && examiner && examiner.rowsSize){
        plateHighlightKeys = plateHighlightKeys.concat(
            parsingConfig.highlightAllPlates(colorPicker, grid)
        );
    }

    // highlight selected cells with the current color
    var coordinatesToHighlight = [];
    for (var i=startRow; i<=endRow; i++){
        for (var j=startCol; j<=endCol; j++){
            coordinatesToHighlight.push([i,j]);
        }
    }
    grid.setCellColors(coordinatesToHighlight,
        colorPicker.getColorByIndex(colorPointer),
        colorPicker.getCurrentColorKey());
    highlightKeys.push(colorPicker.getCurrentColorKey());
}

function firstPlateCellRangeChange(){
    var plateRangeInput = document.getElementById("firstPlateCellRange");
    cellRangeChange(plateRangeInput);
}

function featureCellRangeChange(){
    var featureRangeInput = document.getElementById("featureCellRange");
    cellRangeChange(featureRangeInput);
}

function cellRangeChange(inputElement){
    var range = inputElement.value.trim();
    var rangeSplit = range.split(":");
    var start = rangeSplit[0].trim();
    var end = rangeSplit[1].trim();
    start = Grid.getCellCoordinates(start);
    end = Grid.getCellCoordinates(end);
    grid.selectedStartRow = start[0];
    grid.selectedStartCol = start[1];
    grid.selectedEndRow = end[0];
    grid.selectedEndCol = end[1];
    selectCells(start[0], start[1], end[0], end[1]);
}

function handleTabChange(event, ui){
    var newTab = ui.newTab.index();
    var oldTab = ui.oldTab.index();
    var plates;
    activeTab = newTab;

    removeAllHighlighting();
    clearSelectedCells();

    if (oldTab === PARSING){
        if (!examiner || !examiner.fileContents){
            //alert("You must specify a file to leave the parsing tab");
            showUserMsg("error","You must specify a file to leave the parsing tab" );
            event.preventDefault();
            return;
        }

        if (!parsingConfig){
            createParsingConfig();
        }
    } else if (oldTab === PLATES){
        if (!parsingConfig || !parsingConfig.plate){
            //alert("You must specify a plate to leave the plates tab");
            showUserMsg("error","You must specify a plate to leave the plates tab" );
            event.preventDefault();
            return;
        }
    } else if (oldTab === FEATURES){
        clearFeatureValues();
    }


    if (newTab === PARSING){
        selectCells = selectCellsParsing;

    } else if (newTab === PLATES){
        selectCells = selectCellsPlates;

        // highlight plates if already specified
        if (parsingConfig && parsingConfig.plate && examiner && examiner.rowsSize){
            plateHighlightKeys = plateHighlightKeys.concat(
                parsingConfig.highlightAllPlates(colorPicker, grid)
            );
        }
    } else if (newTab === FEATURES){
        selectCells = selectCellsFeatures;

        // highlight plates if already specified
        if (parsingConfig && parsingConfig.plate && examiner && examiner.rowsSize){
            plateHighlightKeys = plateHighlightKeys.concat(
                parsingConfig.highlightAllPlates(colorPicker, grid)
            );
        }
    }

}

function clearSelectedCells(){
    grid.selectedStartRow = null;
    grid.selectedStartCol = null;
    grid.selectedEndRow = null;
    grid.selectedEndCol = null;
}

function createParsingConfig(){
    var name = document.getElementById("parsingName").value;
    var machine = document.getElementById("machineName").value;
    var description = document.getElementById("parsingDescription").value;


    if (parsingConfig){
        parsingConfig.name = name;
        parsingConfig.machineName = machine;
        parsingConfig.description = description;
        parsingConfig.delimiter = examiner.delimiter;
    } else {
        parsingConfig = new ParsingConfig(null,
            name,
            machine,
            description,
            examiner.delimiter
        );
    }

    console.log(parsingConfig);
}

function reloadPlatesList(){
    var plateListElement = document.getElementById("plateList");

    // clear feature selector
    plateListElement.innerHTML = "";

    // load feature selector
    for (var plateIndex = 0; plateIndex<importData.plates.length; plateIndex++){
        var plateID = importData.plates[plateIndex].plateID;
        var option = document.createElement("option");
        option.setAttribute("value", plateIndex);
        option.innerHTML = "plate " + (plateIndex + 1) + " : " + plateID;
        plateListElement.appendChild(option);
    }
}

function handlePlateSelect(event){
    var target = getTargetElement(event);
    var plateIndex = target.value;

    // highlight the selected plate
    removeAllHighlighting();
    highlightKeys.push(parsingConfig.highlightPlate(plateIndex, colorPicker, grid));
}

function handleImportResults(){
    // create the initial importData object
    var plateIDs = [];
    for (var i=0; i<parsingConfig.plates.length; i++){
        plateIDs.push("none");
    }

    importData = parsingConfig.createImportData(plateIDs, grid);


    // fill the plates list
    reloadPlatesList();

    // show the plate ID selection div and hide the parsing config creation tabs div
    var tabsDiv = document.getElementById("tabs");
    var plateIDSelectionDiv = document.getElementById("plateIDSelection");

    tabsDiv.style.display = "none";
    plateIDSelectionDiv.style.display = "block";

    // disable cell selection
    grid.disableCellSelection();
}

function handleReturnToConfig(){
    var tabsDiv = document.getElementById("tabs");
    var plateIDSelectionDiv = document.getElementById("plateIDSelection");

    $( "#tabs" ).tabs({ active: PARSING });

    tabsDiv.style.display = "block";
    plateIDSelectionDiv.style.display = "none";

    // enable cell selection
    grid.enableCellSelection();
}

function handleByFeature(){
    var byFeatureDiv = document.getElementById("byFeatureMethod");
    var byManuelEntryDiv = document.getElementById("byManualEntryMethod");

    byFeatureDiv.style.display = "block";
    byManuelEntryDiv.style.display = "none";

    reloadPlateLevelFeatureList();
}

function reloadPlateLevelFeatureList(){
    var featureSelectElement = document.getElementById("plateLevelFeatureList");

    // clear feature selector
    featureSelectElement.innerHTML = "";

    // load feature selector
    for (var featureName in parsingConfig.features){
        var feature = parsingConfig.features[featureName];

        if (feature.typeOfFeature == PLATE_LEVEL){
            var option = document.createElement("option");
            option.setAttribute("value", featureName);
            option.innerHTML = featureName;
            featureSelectElement.appendChild(option);
        }
    }
}

function handlePlateLevelFeatureSelect(event){
    var target = getTargetElement(event);
    var featureName= target.value;

    // highlight the selected feature
    removeAllHighlighting();
    highlightKeys.push(parsingConfig.highlightFeature(featureName,colorPicker, grid));

    // fill the importDate plate IDs with that feature value
    for (var plateIndex = 0; plateIndex<importData.plates.length; plateIndex++){
        importData.plates[plateIndex].plateID
            = importData.plates[plateIndex].labels[featureName];
    }

    // reload the plate list showing the new plate IDs
    reloadPlatesList();
}

function handleByManualEntry() {
    var byFeatureDiv = document.getElementById("byFeatureMethod");
    var byManuelEntryDiv = document.getElementById("byManualEntryMethod");

    byFeatureDiv.style.display = "none";
    byManuelEntryDiv.style.display = "block";
}

function sendImportDataToServer(){
    console.log(importData);
}

/**
 * This function returns the active tab, to be compared with the constants:
 *      PARSING
 *      PLATE
 *      FEATURES
 * @returns {*|jQuery}
 */
function getActiveTab(){
    return $("#tabs").tabs( "option", "active" );
}

/**
 * getTargetElement - This function get a reference to the HTML element that
 * triggered an event
 * @param event - the event for which we wish the element that triggered it
 * @returns - the HTML element that triggered the event.
 */
function getTargetElement(event){
    'use strict';
    var target;

    // make sure we have the event, depending on different browser
    // capabilities
    event = event || window.event;

    // get a reference to the element that triggered the event, depending on
    // different browser capabilities
    target = event.target || event.srcElement;

    return target;
} // end of function getTargetElement

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
    examiner = new FileExaminer();
    grid = new Grid("myGrid");

    // to get jQuery-UI tab functionality working
    $( "#tabs" ).tabs({
        active: activeTab
    });

    $( "#tabs" ).tabs({
        beforeActivate: handleTabChange
    });

    selectCells = selectCellsParsing;

    examiner.registerAsLoadListener(handleExaminerLoad);

    addEvent("firstPlateCellRange", "change", firstPlateCellRangeChange);
    addEvent("featureCellRange", "change", featureCellRangeChange);
    addEvent("applyFirstPlate", "click", makePlate);
    addEvent("getFile", "click", handleGetFile);
    addEvent("delimiterList", "change", changeDelimiter);
    //addEvent("saveConfig", "click", createParsingConfig);
    addEvent("saveFeature", "click", makeFeature);
    addEvent("applyFeatures", "click", applyFeatures);
    addEvent("saveConfigToServer", "click", saveConfigToServer);
    addEvent("featureList", "change", handleFeatureSelect);
    addEvent("newFeature", "click", handleNewFeature);
    addEvent("deleteFeature", "click", deleteFeature);
    addEvent("importResults", "click", handleImportResults);
    addEvent("returnToConfig", "click", handleReturnToConfig);
    addEvent("byFeature", "click", handleByFeature);
    addEvent("byManualEntry", "click", handleByManualEntry);
    addEvent("plateList", "change", handlePlateSelect);
    addEvent("plateLevelFeatureList", "change", handlePlateLevelFeatureSelect);
    addEvent("sendImportDataToServer", "click", sendImportDataToServer);

    if (typeof equipment != "undefined"){
    	console.log("INIT " + equipment);
        loadParsingConfig(equipment);
    }
}

window.onload = init;

