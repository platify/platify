/**
 * created by Jaime Valencia
 * Modified by zacharymartin on 3/17/15.
 */

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}


var PARSING = 0;
var PLATE = 1;
var FEATURES = 2;


var currentTopLeftCoord = null;
var currentBottomRightCoord = null;

var grid = new Grid("myGrid");
var parsingConfig;

var colorPointer = 0;
var colorKeyCounter = 0;
var colorPicker = new ColorPicker();

var colsSize =-1;
var rowsSize =-1;
var numberOfFeatures =-1;
var numberOfFeaturesCHILD =-1;

var highlightKeys = [];
var examiner = new FileExaminer();

examiner.registerAsLoadListener(function(examiner){
    setDelimiter(examiner.delimiter);
    grid.setData(examiner.matrix);
    grid.fillUpGrid();
    grid.registerSelectedCellCallBack(handleSelectedCells);
    colsSize = examiner.colsSize;
    rowsSize = examiner.rowsSize;
});

function applyFeatures(){
    parsingConfig.applyFeatures(1, examiner.rowsSize, grid);
}

function makePlate(){
    parsingConfig.addPlate(grid);
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

function handleFeatureSelect(event){
    var target = getTargetElement(event);
    var featureName = target.value;
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
}

function reloadLabelSelector(featureName){
    var labelSelectElement = document.getElementById("labelList");
    var plates = parsingConfig.findPlates(1, examiner.rowsSize, grid);

    // clear the label selector
    labelSelectElement.innerHTML = "";
    labelSelectElement.scrollTop = 0;
    // load the label selector
    var descriptors = parsingConfig.getFeatureValuesDescriptors(featureName, plates,grid);

    for (var i=0; i<descriptors.length; i++){
        var value = descriptors[i].cell;
        var descriptor = descriptors[i].descriptor;
        var option = document.createElement("option");
        option.setAttribute("value", value);
        option.innerHTML = descriptor;
        labelSelectElement.appendChild(option);
    }
}


function saveConfigToServer(){
    console.log(parsingConfig.getJSONString());
    
    var jqxhr = $.ajax({
        url: hostname+"/equipment/save",
        type: "POST",
        data: JSON.stringify(parsingConfig.getJSONString()),
        processData: false,
        contentType: "application/json; charset=UTF-8"
    	}).done(function() {
    		console.log( "success" );
		}).fail(function() {
			console.log( "error" );
		}).always(function() {
			console.log( "complete" );
		});
    
 // Set another completion function for the request above
    jqxhr.always(function(resData) {
    	console.log( "second complete" );
      console.log(JSON.stringify(resData));
    });
    
}


/**
 * replaces anonymous function starting on line 114 of original csvParser.html
 * @param startRow
 * @param startCol
 * @param endRow
 * @param endCol
 */
function handleSelectedCells(startRow, startCol, endRow, endCol){
    selectCells(startRow, startCol, endRow, endCol);

    // plate range input on the plate page
    var plateRangeInput = document.getElementById("firstPlateCellRange");
    plateRangeInput.value = Grid.getRowLabel(startRow)+startCol+":"
    +Grid.getRowLabel(endRow)+endCol;

    // feature range input on the feature page
    var featureRangeInput = document.getElementById("featureCellRange");
    featureRangeInput.value = Grid.getRowLabel(startRow)+startCol+":"
    +Grid.getRowLabel(endRow)+endCol;
}

function selectCells(startRow, startCol, endRow, endCol){
    // write to the selected cells div, the cells that are selected
    var out = document.getElementById("selectedCells");
    out.innerHTML = Grid.getRowLabel(startRow)+startCol+":"
    +Grid.getRowLabel(endRow)+endCol;



    // remove previous highlighting
    if (highlightKeys.length){
        grid.removeCellColors(highlightKeys.pop());
    }


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

    // set the current selected cells variables
    currentTopLeftCoord = [startRow,startCol];
    currentBottomRightCoord = [endRow,endCol];
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
    currentTopLeftCoord = null;
    currentBottomRightCoord = null;


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

function createParsingConfig(){
    var name = document.getElementById("parsingName").value;
    var machine = document.getElementById("machineName").value;
    var description = document.getElementById("parsingDescription").value;
    var exampleFileName = document.getElementById("selectedFile").innerHTML;
    //var exampleFileContents = examiner.fileContents;
    //var exampleFileContents = examiner.matrix;
    var exampleFileContents = "";
    var multiplePlatesPerFile = document.getElementById("multiplePlates").checked;
    var multipleValuesPerWell = document.getElementById("multipleValues").checked;
    var gridFormat = document.getElementById("gridFormat").checked;

    if (parsingConfig){
        parsingConfig.name = name;
        parsingConfig.machineName = machine;
        parsingConfig.description = description;
        parsingConfig.exampleFileName = exampleFileName;
        //parsingConfig.exampleFileContents = exampleFileContents;
        parsingConfig.delimiter = examiner.delimiter;
        parsingConfig.multiplePlatesPerFile = multiplePlatesPerFile;
        parsingConfig.multipleValuesPerWell = multipleValuesPerWell;
        parsingConfig.gridFormat = gridFormat;
    } else {
        parsingConfig = new ParsingConfig(
            name,
            machine,
            description,
            exampleFileName,
            exampleFileContents,
            examiner.delimiter,
            multiplePlatesPerFile,
            multipleValuesPerWell,
            gridFormat
        );
    }

    console.log(parsingConfig);
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

    addEvent("firstPlateCellRange", "change", firstPlateCellRangeChange);
    addEvent("featureCellRange", "change", featureCellRangeChange);
    addEvent("applyFirstPlate", "click", makePlate);
    addEvent("getFile", "click", handleGetFile);
    addEvent("delimiterList", "change", changeDelimiter);
    addEvent("saveConfig", "click", createParsingConfig);
    addEvent("saveFeature", "click", makeFeature);
    addEvent("applyFeatures", "click", applyFeatures);
    addEvent("saveConfigToServer", "click", saveConfigToServer);
    addEvent("featureList", "change", handleFeatureSelect);

    // to get jQuery-UI tab functionality working
    $( "#tabs" ).tabs({
        active: 0
    });

}

window.onload = init;

