/**
 * Created by zacharymartin on 4/20/15.
 */

ParserUI.PARSING = 0;
ParserUI.PLATES = 1;
ParserUI.FEATURES = 2;
ParserUI.EXPERIMENT = 3;

ParserUI.MANUAL_ENTRY = "byManualEntry";
ParserUI.PLATE_LEVEL_FEATURE = "byFeature";

ParserUI.FEATURE_LIST_PLACEHOLDER = "--- features ---";
ParserUI.LABEL_LIST_PLACEHOLDER = "--- labels ---";

function ParserUI(parsingController){
    this.parsingController = parsingController;
    this.parseOnlyModeOn = false;

    var _self = this;


    // construct a flash messenger
    var flashMessenger = new FlashMessenger("userMsgPanel");


    // references to all UI elements by Tab

    // Parsing
    var parsingNameElement = document.getElementById("parsingName");
    var machineNameElement = document.getElementById("machineName");
    var wellRowElement = document.getElementById("plateDimensions");
    var wellColumnElement = document.getElementById("assayType");
    var parsingDescriptionElement = document.getElementById("parsingDescription");
    var selectedFileElement = document.getElementById("selectedFile");
    var filesInput = document.getElementById("files");
    var chooseFileButton = document.getElementById("getFile");
    var delimiterList = document.getElementById("delimiterList");
    var delimiterOptions = [];  // an array of all the options elements in the delimiter
                                // list

    // ~~~~~~~~~~~~~~~~~~~~~ Plate ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var firstPlateCellRangeElement = document.getElementById("firstPlateCellRange");
    var applyFirstPlateButton = document.getElementById("applyFirstPlate");

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Features ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var newFeatureButton = document.getElementById("newFeature");
    var addFeatureButton = document.getElementById("saveFeature");
    var deleteFeatureButton = document.getElementById("deleteFeature");
    var applyFeaturesButton = document.getElementById("applyFeatures");
    var featureCellRangeElement = document.getElementById("featureCellRange");
    var featureCategoryElement = document.getElementById("featureCategory");
    var featureLevelRadioButtonSet = document.getElementById("featureLevel");
    var wellLevelRadioButton = document.getElementById("wellLevel");
    var plateLevelRadioButton = document.getElementById("plateLevel");
    var experimentLevelRadioButton = document.getElementById("experimentLevel");
    var featureListElement = document.getElementById("featureList");
    var featureOptions = []; // an array of all the options elements in the feature list
    var labelListElement = document.getElementById("labelList");
    var labelOptions = []; // an array of all the options elements in the label list

    // ~~~~~~~~~~~~~~~~~~~~~~~~~ Experiment ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var importAndSaveDataButton = document.getElementById("sendImportDataToServer");
    var downloadFileImportButton = document.getElementById("downloadFileImport");
    var downloadIntergroupButton = document.getElementById("downloadIntergroupFile");
    var byPlateLevelFeatureRadioButton = document.getElementById("byFeature");
    var byManualEntryRadioButton = document.getElementById("byManualEntry");
    var plateLevelFeatureListElement = document.getElementById("plateLevelFeatureList");
    var setPlateIdButton = document.getElementById("setPlateID");
    var plateIdentifierList = document.getElementById("plateList");
    var plateImportList = document.getElementById("plateImportList");
    var experimentSelectizeElement;

    // an object representing the options in the experiment selectize element. This object
    // has a property for each option in the selectize element. The property name is the
    // name of the experiment and the displayed text for the option. The property value
    // id the experiment id and is the value of the selectize option
    var experimentSelectizeOptions = {};

    var plateIdentifierSelectizeElement;
    var plateIdentifierSelectizeOptionValues = [];
    var byFeatureMethodDiv = document.getElementById("byFeatureMethod");
    var byManualMethodDiv = document.getElementById("byManualEntryMethod");

    //~~~~~~~~~~~~~~~~~~~~~~~~ General Elements ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    var $tabsElement = $("#tabs");
    var parsingIDElement = document.getElementById("parsingId");
    var saveConfigButton = document.getElementById("saveConfigToServer");
    var saveAsConfigButton = document.getElementById("saveAsConfigToServer");
    var selectedFiles;


    // ------------------- parsing tab getters and setters ------------------------------


    this.getParsingName = function(){
        if (_self.parseOnlyModeOn){
            return parsingNameElement.innerHTML;
        } else {
            return parsingNameElement.value;
        }
    };

    this.getPlateDimensions = function(){
        if (_self.parseOnlyModeOn){
            return wellRowElement.innerHTML;
        } else {
            return wellRowElement.value;
        }
    };

    this.setPlateDimensions = function(plateDimensions){
        if (_self.parseOnlyModeOn){
            wellRowElement.innerHTML = plateDimensions;
        } else {
            wellRowElement.value = plateDimensions;
        }
    };


    this.getAssayType = function(){
        if (_self.parseOnlyModeOn){
            return wellColumnElement.innerHTML;
        } else {
            return wellColumnElement.value;
        }
    };

    this.setAssayType = function(assayType){
        if (_self.parseOnlyModeOn){
            wellColumnElement.innerHTML = assayType;
        } else {
            wellColumnElement.value = assayType;
        }
    };


    this.setParsingName = function(parsingName){
        if (_self.parseOnlyModeOn){
            parsingNameElement.innerHTML = parsingName;
        } else {
            parsingNameElement.value = parsingName;
        }
    };

    this.getMachineName = function(){
        if (_self.parseOnlyModeOn){
            return machineNameElement.innerHTML;
        } else {
            return machineNameElement.value;
        }
    };

    this.setMachineName = function(machineName){

        if (_self.parseOnlyModeOn){
            machineNameElement.innerHTML = machineName;
        } else {
            machineNameElement.value = machineName;
        }
    };


    this.getParsingDescription = function(){
        if (_self.parseOnlyModeOn){
            return parsingDescriptionElement.innerHTML;
        } else {
            return parsingDescriptionElement.value;
        }
    };



    this.setParsingDescription = function(parsingDescription){
        if (_self.parseOnlyModeOn){
            parsingDescriptionElement.innerHTML = parsingDescription;
        } else {
            parsingDescriptionElement.value = parsingDescription;
        }
    };

    this.getSelectedFileName = function(){
        return selectedFileElement.innerHTML;
    };

    this.setSelectedFileName = function(selectedFileName){
        selectedFileElement.innerHTML = selectedFileName;
    };

    this.getSelectedDelimiter = function(){
        if (_self.parseOnlyModeOn){
            return delimiterList.innerHTML;
        } else {
            return delimiterList.value;
        }
    };

    this.setDelimiter = function(delimiterName){
        if (delimiterName !== null){
            if (_self.parseOnlyModeOn){
                delimiterList.innerHTML = delimiterName;
            } else {
                delimiterList.value = delimiterName;
            }
        } else {
            if (_self.parseOnlyModeOn){
                delimiterList.innerHTML = "";
            } else {
                delimiterList.scrollTop = 0;
            }

            // deselect all options
            for (var i=0; i<delimiterOptions.length; i++){
                delimiterOptions[i].selected = false;
            }
        }
    };

    this.loadDelimiterList = function(delimiterNameArray){

        // load the delimiterOptions array
        delimiterOptions = [];

        for (var i=0; i<delimiterNameArray.length; i++){
            var optionName = delimiterNameArray[i];
            var option = document.createElement("option");
            delimiterOptions.push(option);
            option.setAttribute("value", optionName);
            option.innerHTML = optionName;
        }

        if (!_self.parseOnlyModeOn){
            delimiterList.innerHTML = "";

            // load the delimiter list
            for (var j=0; j<delimiterOptions.length; j++){
                delimiterList.appendChild(delimiterOptions[j])
            }
        }

        _self.setDelimiter(null);
    };

    this.switchDelimiterListToSpan = function(){
        var span = document.createElement("span");

        span.innerHTML = _self.getSelectedDelimiter();
        $(delimiterList).replaceWith(span);
        delimiterList = span;
    };

    this.switchDelimiterListToSelect = function(){
        var select = document.createElement("select");

        for (var j=0; j<delimiterOptions.length; j++){
            select.appendChild(delimiterOptions[j]);
        }

        select.value = _self.getSelectedDelimiter();
        $(delimiterList).replaceWith(select);
        delimiterList = select;
        addEvent(select, "change", _self.handleDelimiterChange);
    };

    this.getListedDelimiters = function(){
        var delimiters = [];

        for (var i=0; i<delimiterOptions.length; i++){
            delimiters.push(delimiterOptions[i].value);
        }

        return delimiters;
    };




    // ---------------------  parsing tab event handlers --------------------------------

    this.handleDelimiterChange = function(event){
        var selectedDelimiter = delimiterList.value;

        try{
            _self.parsingController.changeDelimiter(selectedDelimiter);
        } catch (error){
            _self.displayError(error);
        }
    };

    this.handleFileSelect = function(event) {
        

        if (event.target && event.target.files){
            // file input case
            selectedFiles = event.target.files; // FileList object
        } else if (event.dataTransfer && event.dataTransfer.files) {
            // drag and drop case
            selectedFiles = event.dataTransfer.files;
        }


        try{
            _self.parsingController.loadFiles(selectedFiles);

            // if the files loaded without errors, display their names on the UI
            // TODO - display multiple file names
            _self.setSelectedFileName(selectedFiles[0].name);
        } catch (error){
            _self.displayError(error);
        }
    };


    // ---------------------- Plate tab getters and setters ------------------------------

    this.getFirstPlateCellRange = function(){
        var cellRange;

        try {
            if (_self.parseOnlyModeOn){
                cellRange
                    = ParserUI.convertStringToCellRange(
                                                    firstPlateCellRangeElement.innerHTML);
            } else {
                cellRange
                    = ParserUI.convertStringToCellRange(firstPlateCellRangeElement.value);
            }
        } catch (error) {
            _self.displayError(error);
        }

        return cellRange;
    };

    this.setFirstPlateCellRange = function(firstPlateRange){
        if (_self.parseOnlyModeOn){
            firstPlateCellRangeElement.innerHTML = firstPlateRange.toString();
        } else {
            firstPlateCellRangeElement.value = firstPlateRange.toString();
        }
    };


    // ---------------------- Plate tab event handlers -----------------------------------

    this.handleFirstPlateCellRangeChange = function(){
        var selectedCellRange = _self.getFirstPlateCellRange();


        try {
            _self.parsingController.selectCells(selectedCellRange);
        } catch (error){
            _self.displayError(error);
        }
    };




    this.handleApplyFirstPlate = function(){
        var selectedCellRange = _self.getFirstPlateCellRange();

        try {
            _self.parsingController.defineFirstPlate(selectedCellRange);
        } catch (error){
            _self.displayError(error);
        }
    };

    // ----------------------- Features tab getters and setters --------------------------

    this.getFeatureCellRange = function(){
        var cellRange;

        try {
            if (_self.parseOnlyModeOn){
                cellRange = ParserUI.convertStringToCellRange(
                                                       featureCellRangeElement.innerHTML);
            } else {
                cellRange = ParserUI.convertStringToCellRange(
                                                           featureCellRangeElement.value);
            }
        } catch (error){
            _self.displayError(error);
        }

        return cellRange;
    };

    this.setFeatureCellRange = function(featureRange){
        if (_self.parseOnlyModeOn){
            featureCellRangeElement.innerHTML = featureRange.toString();
        } else {
            featureCellRangeElement.value = featureRange.toString();
        }
    };

    this.getFeatureLevel = function(){
        var level = null;

        if (wellLevelRadioButton.checked){
            level = WELL_LEVEL;
        } else if (document.getElementById("plateLevel").checked){
            level = PLATE_LEVEL;
        } else if (document.getElementById("experimentLevel").checked){
            level = EXPERIMENT_LEVEL;
        }

        return level;
    };


    this.setFeatureLevel = function(level){
        if (level === WELL_LEVEL){
            wellLevelRadioButton.checked = true;
            plateLevelRadioButton.checked = false;
            experimentLevelRadioButton.checked = false;
        } else if (level === PLATE_LEVEL) {
            wellLevelRadioButton.checked = false;
            plateLevelRadioButton.checked = true;
            experimentLevelRadioButton.checked = false;
        } else if (level === EXPERIMENT_LEVEL){
            wellLevelRadioButton.checked = false;
            plateLevelRadioButton.checked = false;
            experimentLevelRadioButton.checked = true;
        } else {
            wellLevelRadioButton.checked = false;
            plateLevelRadioButton.checked = false;
            experimentLevelRadioButton.checked = false;
        }
    };

    this.getFeatureCategory = function(){
        if (_self.parseOnlyModeOn){
            return featureCategoryElement.innerHTML;
        } else {
            return featureCategoryElement.value;
        }
    };

    this.setFeatureCategory = function(categoryName){
        if (_self.parseOnlyModeOn){
            featureCategoryElement.innerHTML = categoryName;
        } else {
            featureCategoryElement.value = categoryName;
        }
    };

    this.getSelectedFeature = function(){
        return featureListElement.value;
    };

    this.loadFeatureList = function(featureNameArray){
        featureListElement.innerHTML = "";
        featureListElement.scrollTop = 0;
        featureOptions = [];

        if (featureNameArray && featureNameArray.length){
            loadSelectElement(featureListElement, featureNameArray, featureOptions);
        } else {
            // load the label selector with a place holder
            option = document.createElement("option");
            option.setAttribute("value", ParserUI.FEATURE_LIST_PLACEHOLDER);
            option.innerHTML = ParserUI.FEATURE_LIST_PLACEHOLDER;
            featureOptions.push(option);
            featureListElement.appendChild(option);
        }

    };

    this.setFeature = function(featureName){
        if (featureName !== null){
            featureListElement.value = featureName;
        } else {
            // deselect all options
            var featureOptionsArray = featureListElement.options;

            for (var i=0; i<featureOptionsArray.length; i++){
                featureOptionsArray[i].selected = false;
            }
        }

    };

    this.getListedFeatures = function(){
        var listedFeatureNames = [];

        for (var i=0; i<featureOptions.length; i++){
            listedFeatureNames.push(featureOptions[i].value);
        }

        return listedFeatureNames;
    };

    this.loadLabelList = function(labelDescriptors){
        // clear the label list selector
        labelListElement.innerHTML = "";
        labelListElement.scrollTop = 0;
        labelOptions = [];

        var option;

        if (labelDescriptors){

            // load the label selector with the label descriptors
            for (var i=0; i<labelDescriptors.length; i++){
                var value = labelDescriptors[i].cell;
                var descriptor = labelDescriptors[i].descriptor;
                option = document.createElement("option");
                labelOptions.push(option);
                option.setAttribute("value", value);
                option.innerHTML = descriptor;
                labelListElement.appendChild(option);
            }
        } else {
            // load the label selector with a place holder
            option = document.createElement("option");
            option.setAttribute("value", ParserUI.FEATURE_LIST_PLACEHOLDER);
            option.innerHTML = ParserUI.LABEL_LIST_PLACEHOLDER;
            labelOptions.push(option);
            labelListElement.appendChild(option);
        }
    };

    this.setLabel = function(labelCell){
        if (labelCell !== null){
            labelListElement.value = labelCell;
        } else {
            // deselect all options
            var labelOptionsArray = labelListElement.options;

            for (var i=0; i<labelOptionsArray.length; i++){
                labelOptionsArray[i].selected = false;
            }
        }

    };

    this.getListedLabels = function(){
        var listedLabels = [];

        for (var i=0; i<labelOptions.length; i++){
            listedLabels.push(labelOptions[i].innerHTML);
        }

        return listedLabels;
    };


    this.getListedLabelCells = function(){
        var listedLabelCells = [];

        for (var i=0; i<labelOptions.length; i++){
            listedLabelCellss.push(labelOptions[i].value);
        }

        return listedLabelCells;
    };

    this.clearFeatureInfo = function(){
        _self.setFeatureCellRange("");
        _self.setFeatureLevel(null);
        _self.setFeatureCategory("");
        _self.setFeature(null);
        _self.loadLabelList(null);
    };

    this.enableDeleteFeatureButton = function(){
        deleteFeatureButton.disabled = false;
    };

    this.disableDeleteFeatureButton = function(){
        deleteFeatureButton.disabled = true;
    };


    // ------------------- Features tab event handlers ----------------------------------

    this.handleFeatureCellRangeChange = function(){
        var selectedCellRange = _self.getFeatureCellRange();

        try {
            _self.parsingController.selectCells(selectedCellRange);
        } catch (error){
            _self.displayError(error);
        }
    };

    this.handleFeatureSelection = function(event){
        var selectedFeature = _self.getSelectedFeature();

        if (selectedFeature !== ParserUI.FEATURE_LIST_PLACEHOLDER){
            try {
                _self.parsingController.displayFeature(selectedFeature);
                _self.enableDeleteFeatureButton();
            } catch(error){
                _self.displayError(error);
            }
        } else {
            event.preventDefault();
        }

    };

    this.handleNewFeature = function(){
        try {
            _self.parsingController.prepareUIForNewFeature();
        } catch (error){
            _self.displayError(error);
        }
    };

    this.handleAddFeature = function(){
        try{
            _self.parsingController.defineFeature();
        } catch(error){
            _self.displayError(error);
        }
    };

    this.handleDeleteFeature = function(){
        var nameOfFeatureToRemove = _self.getSelectedFeature();

        try{
            _self.parsingController.removeFeature(nameOfFeatureToRemove);
        } catch(error){
            _self.displayError(error);
        }
    };

    this.handleApplyFeatures = function(){
        try {
            _self.parsingController.applyAllFeaturesToGrid();
        } catch(error){
            _self.displayError(error);
        }
    };


    // ------------------------- Experiment tab getters and setters ----------------------

    this.getPlateIDSelectMethod = function(){
        var method = null;

        if (byPlateLevelFeatureRadioButton.checked){
            method = ParserUI.PLATE_LEVEL_FEATURE;
        } else if (byManualEntryRadioButton.checked){
            method = ParserUI.MANUAL_ENTRY;
        }

        return method;
    };

    this.setPlateIDSelectMethod = function(method){

        if (method === ParserUI.MANUAL_ENTRY){
            byManualEntryRadioButton.checked = true;
            byPlateLevelFeatureRadioButton.checked = false;
        } else if (method === ParserUI.PLATE_LEVEL_FEATURE){
            byManualEntryRadioButton.checked = false;
            byPlateLevelFeatureRadioButton.checked = true;
        } else {
            byManualEntryRadioButton.checked = false;
            byPlateLevelFeatureRadioButton.checked = false;
        }

    };

    this.loadPlateWithIDList = function(plateIDArray){
        // clear the select element
        plateIdentifierList.innerHTML = "";
        plateIdentifierList.scrollTop = 0;
        plateImportList.innerHTML = "";
        // load the plate ID select element
        for (var i=0; i<plateIDArray.length; i++){
            var optionContents = "plate " + (i+1) + ": " +plateIDArray[i];
            var importOptionContents = "plate "+ (i+1);
            var option = document.createElement("option");
            var importOption = document.createElement("option");
            option.setAttribute("value", i.toString());
            importOption.setAttribute("value", i.toString());
            option.innerHTML = optionContents;
            importOption.innerHTML = importOptionContents;
            plateIdentifierList.appendChild(option);
            plateImportList.appendChild(importOption);
        }
        $('#plateImportList').multiSelect({
            selectableHeader: "<div class='custom-header'>Plates to Import</div>",
            selectionHeader: "<div class='custom-header'>Plates to Skip</div>",
            afterSelect: this.plateImportListSelection,
            afterDeselect: this.plateImportListSelection
        });
        this.plateImportListSelection();
    };

    this.plateImportListSelection = function(values) {
    	_self.parsingController.platesToImport.length = 0;
    	var options = plateImportList.options, cnt = 0, bImp;
    	for (var idx = 0; idx < options.length; ++idx) {
    		bImp = options[idx].selected;
    		_self.parsingController.platesToImport.push(!bImp);
    		if (bImp) cnt++;
    	}
    	
    	importAndSaveDataButton.disabled = 
    		(cnt == options.length) ? true : false;
    	
    };
    
    
    this.getListedPlatesWithIDs = function(){
        var result = [];
        var options = plateIdentifierList.options;

        for (var i=0; i<options.length; i++){
            var opitonContents = options[i].innerHTML;
            var splitContents = option.split(" ");
            var plateID = splitContents[splitContents.length - 1];
            result.push(plateID);
        }

        return result;
    };

    this.getSelectedPlateWithIDIndex = function(){
        var selectedIndex = plateIdentifierList.value;
        var parsedSelectedIndex = parseInt(selectedIndex);

        if (selectedIndex === "" || isNaN(parsedSelectedIndex)){
            return null;
        } else {
            return parsedSelectedIndex;
        }
    };

    this.setSelectedPlateWithIDIndex = function(plateIndex){

        var plateWithIDOptionsArray = plateIdentifierList.options;

        if (plateIndex !== null && plateWithIDOptionsArray.length !== 0){
            plateIdentifierList.value = plateIndex;
        } else {
            plateIdentifierList.scrollTop = 0;

            // deselect all options
            for (var i=0; i<plateWithIDOptionsArray.length; i++){
                plateWithIDOptionsArray[i].selected = false;
            }
        }
    };

    this.loadPlateLevelFeatureList = function(plateLevelFeatureNameArray){

        // clear the select element and scroll back to the top
        plateLevelFeatureListElement.innerHTML = "";
        plateLevelFeatureListElement.scrollTop = 0;

        // load the select element
        for (var i=0; i<plateLevelFeatureNameArray.length; i++){
            var optionName = plateLevelFeatureNameArray[i];
            var option = document.createElement("option");
            option.setAttribute("value", optionName);
            option.innerHTML = optionName;
            plateLevelFeatureListElement.appendChild(option);
        }
    };

    this.getListedPlateLevelFeatures = function(){
        var result = [];
        var options = plateLevelFeatureListElement.options;

        for (var i=0; i<options.length; i++){
            var opitonContents = options[i].innerHTML;
            result.push(optionContents);
        }

        return result;
    };

    this.getSelectedPlateLevelFeature = function(){
        var selectedPlateLevelFeature = plateLevelFeatureListElement.value;

        if (!selectedPlateLevelFeature){
            return null;
        } else {
            return selectedPlateLevelFeature;
        }
    };

    this.setSelectedPlateLevelFeature = function(featureName){

        if (featureName !== null){
            plateLevelFeatureListElement.value = featureName;
        } else {
            plateIdentifierList.scrollTop = 0;
            var plateFeatureOptions = plateLevelFeatureListElement.options;

            // deselect all options
            for (var i=0; i<plateFeatureOptions.length; i++){
                plateFeatureOptions[i].selected = false;
            }
        }
    };

    /**
     *
     * @param experimentNameIDObjectArray - an array of objects, one for each experiment
     *                                  in which the experiment name is listed under the
     *                                  property "name" and the experiment id is listed
     *                                  under the property "id"
     */
    this.loadExperimentSelectize = function(experimentNameIDObjectArray){
        experimentSelectizeElement.clearOptions();
        experimentSelectizeOptions = {};

        for (var i=0; i<experimentNameIDObjectArray.length; i++){
            var name = experimentNameIDObjectArray[i].name;
            var id = experimentNameIDObjectArray[i].id;
            experimentSelectizeElement.addOption(experimentNameIDObjectArray[i]);
            experimentSelectizeOptions[name] = id;
        }

        experimentSelectizeElement.refreshOptions(true);
    };

    this.getExperimentOptionNames = function(){
        var result = [];

        for (var experimentName in experimentSelectizeOptions){
            result.push(experimentName);
        }

        return result;
    };

    this.getExperimentOptionIDs = function(){
        var result = [];

        for (var experimentName in experimentSelectizeOptions){
            var experimentID = experimentSelectizeOptions[experimentName];
            result.push(experimentID);
        }

        return result;
    };

    this.getSelectedExperimentName = function(){
        var selectedExperimentID = this.getSelectedExperimentID();

        return experimentSelectizeElement.getOption(selectedExperimentID).html();
    };

    this.getSelectedExperimentID = function(){
        return experimentSelectizeElement.getValue();
    };

    this.setSelectedExperimentByID = function(experimentID){
        experimentSelectizeElement.setValue(experimentID)
    };

    this.setSelectedExperimentByName = function(experimentName){
        var experimentID = experimentSelectizeOptions[experimentName];
        return experimentSelectizeElement.setValue(experimentID);
    };

    /**
     *
     * @param plateIDArray - an array of plate identifiers to load into the plate id
     *                      selectize element
     */
    this.loadPlateIDSelectize = function(plateIDArray){
        plateIdentifierSelectizeElement.clearOptions();
        plateIdentifierSelectizeOptionValues = [];

        for (var i=0; i<plateIDArray.length; i++){
            plateIdentifierSelectizeElement.addOption({
                plateID: plateIDArray[i]
            });
            plateIdentifierSelectizeOptionValues.push(plateIDArray[i]);
        }

        plateIdentifierSelectizeElement.refreshOptions(true);
    };

    this.getPlateIDSelectizeOptionValues = function(){
        var result = [];

        for (var i=0; i<plateIdentifierSelectizeOptionValues.length; i++){
            result.push(plateIdentifierSelectizeOptionValues[i]);
        }

        return result;
    };

    this.getSelectedPlateIdentifier = function(){
        return plateIdentifierSelectizeElement.getValue();
    };

    this.setSelectedPlateIdentifier = function(plateIdentifier){
        if (plateIdentifier === null){
            plateIdentifierSelectizeElement.clear(true);
        } else {
            plateIdentifierSelectizeElement.setValue(plateIdentifier);
        }
    };

    this.incrementPlateAndIdentifierSelections = function(){
        // move the selected plate with id selection down by 1
        var selectedPlateIndex = _self.getSelectedPlateWithIDIndex();
        var numPlates = plateIdentifierList.options.length;
        var newSelectedPlateIndex = (selectedPlateIndex + 1) % numPlates;
        _self.setSelectedPlateWithIDIndex(newSelectedPlateIndex);

        // move the selected plate identifier down by 1
        var selectedPlateIdentifier = _self.getSelectedPlateIdentifier();
        for(var i=0; i<plateIdentifierSelectizeOptionValues.length; i++){
            if (plateIdentifierSelectizeOptionValues[i] === selectedPlateIdentifier){
                var newSelectedPlateIdentifierIndex
                    = (i+1)%plateIdentifierSelectizeOptionValues.length;
                var newSelectedPlateIdentifier
                    = plateIdentifierSelectizeOptionValues[newSelectedPlateIdentifierIndex];
                _self.setSelectedPlateIdentifier(newSelectedPlateIdentifier);
            }
        }
    };


    // ------------------ Experiment tab event handlers ----------------------------------

    this.handleDataImport = function(){
        try {
            _self.parsingController.saveImportDataToServer();
        } catch (error){
            _self.displayError(error);
        }
    };

    this.handleDownloadFileImport = function(){
        try {
            _self.parsingController.downloadImportData();
        } catch (error){
            _self.displayError(error);
        }
    };

    this.handleIntergroupDownload = function(){
        try {
            _self.parsingController.downloadIntergroupData() ;
        } catch (error) {
            _self.displayError(error);
        }
    };

    this.handleByPlateLevelFeatureMethod = function(){
        try {
            _self.parsingController.assignPlateIDsByFeature();
        } catch(error){
            _self.displayError(error);
        }

        byFeatureMethodDiv.style.display = "block";
        byManualMethodDiv.style.display = "none";
    };

    this.handleByManualMethod = function(){
        try {
            _self.parsingController.assignPlateIDsByManualMethod();
        } catch(error){
            _self.displayError(error);
        }


        byFeatureMethodDiv.style.display = "none";
        byManualMethodDiv.style.display = "block";
    };

    this.handlePlateLevelFeatureSelection = function(){
        var selectedFeature = _self.getSelectedPlateLevelFeature();

        try{
            _self.parsingController.setPlateLevelFeatureAsPlateID(selectedFeature);
        } catch (error){
            _self.displayError(error);
        }
    };

    this.handlePlateIdSetButtonClick = function(){
        var selectedIdentifier = _self.getSelectedPlateIdentifier();
        var selectedPlateIndex = _self.getSelectedPlateWithIDIndex();

        try{
            _self.parsingController.setPlateID(selectedPlateIndex, selectedIdentifier);
        } catch (error) {
            _self.displayError(error);
        }
    };

    this.handlePlateWithIdListSelection = function(){
        var selectedPlateIndex = _self.getSelectedPlateWithIDIndex();

        try{
            _self.parsingController.showPlate(selectedPlateIndex);
        } catch(error){
            _self.displayError(error);
        }
    };

    this.handleExperimentSelection = function(){
        var selectedExperimentID = _self.getSelectedExperimentID();

        try{
            _self.parsingController.fillOutExperimentPlateIDs(selectedExperimentID);
        } catch(error){
            _self.displayError(error);
        }
    };

    this.handlePlateIdSelection = function(selectedPlateID){
        var selectedFeatureName = _self.getSelectedPlateLevelFeature();

        try{
            //_self.parsingController.showPlateLevelFeature(selectedFeatureName);
        } catch(error){
            _self.displayError(error);
        }
    };

    // ---------------------- tabs setters and getters -----------------------------------

    this.getActiveTab = function(){
        return $tabsElement.tabs( "option", "active" );
    };

    this.setActiveTab = function(tab){
        $tabsElement.tabs("option", "active", tab);
    };



    // ---------------------- tabs event handler -----------------------------------------



    this.handleClickCell = function(event, ui){
        if (e.shiftKey) {
            alert("shift+click")
        }
        if (e.ctrlKey) {
            alert("control+click")
        }

        var newTab = ui.keyCode
        var oldTab = ui.oldTab.index();

        try {
            _self.parsingController.changeStage(newTab, oldTab);
        } catch (error) {
            event.preventDefault();
            _self.displayError(error);
        }
    };


    this.handleTabChange = function(event, ui){
        var newTab = ui.newTab.index();
        var oldTab = ui.oldTab.index();

        try {
            _self.parsingController.changeStage(newTab, oldTab);
        } catch (error) {
            event.preventDefault();
            _self.displayError(error);
        }
    };


    // ------------------- General getters and setters ----------------------------------

    this.getParsingID = function(){
        return parsingIDElement.value;
    };

    this.setParsingID = function(id){
        parsingIDElement.value = id;
    };

    this.displayError = function(error){
        console.log(error);
        this.displayErrorMessage(error.getMessage());
    };

    this.displayErrorMessage = function(message){
        flashMessenger.showUserMsg(FlashMessenger.ERROR, message);
    };

    this.displayMessage = function(message){
        flashMessenger.showUserMsg(FlashMessenger.HIGHLIGHT, message)
    };

    this.enableSaveButton = function(){
        saveConfigButton.disabled = false;
    };

    this.disableSaveButton = function(){
        saveConfigButton.disabled = true;
    };

    this.enableSaveAsButton = function(){
        saveAsConfigButton.disabled = false;
    };

    this.disableSaveAsButton = function(){
        saveAsConfigButton.disabled = true;
    };


    // -------------------- General event handlers ---------------------------------------

    this.handleSaveConfig = function(){
        try {
            _self.parsingController.saveParsingConfigToServer();
        } catch (error){
            _self.displayError(error);
        }
    };

    this.handleSaveAsConfig = function(){
        if (_self.parseOnlyModeOn){
            _self.switchOutOfParseOnlyMode();
        } else {
            try {
                _self.parsingController.saveAsParsingConfigToServer();
            } catch (error){
                _self.displayError(error);
            }
        }
    };

    this.switchSaveAsButtonToModifyAsNewParsingConfig = function(){
        saveAsConfigButton.innerHTML = "Modify as new Parsing Configuration";
    };

    this.switchSaveAsButtonBackToSaveAs = function(){
        saveAsConfigButton.innerHTML = "Save As";
    };



    this.switchToParseOnlyMode = function(){
        parsingNameElement = switchTextInputToSpan(parsingNameElement);
        machineNameElement = switchTextInputToSpan(machineNameElement);
        parsingDescriptionElement = switchTextAreaToP(parsingDescriptionElement);
        _self.switchDelimiterListToSpan();
        firstPlateCellRangeElement = switchTextInputToSpan(firstPlateCellRangeElement);
        featureCellRangeElement = switchTextInputToSpan(featureCellRangeElement);
        featureCategoryElement = switchTextInputToSpan(featureCategoryElement);
        applyFirstPlateButton.style.display = "none";
        newFeatureButton.style.display = "none";
        addFeatureButton.style.display = "none";
        deleteFeatureButton.style.display = "none";

        _self.switchSaveAsButtonToModifyAsNewParsingConfig();
        _self.parseOnlyModeOn = true;
    };

    this.switchOutOfParseOnlyMode = function(){
        parsingNameElement = switchSpanToTextInput(parsingNameElement);
        machineNameElement = switchSpanToTextInput(machineNameElement);
        parsingDescriptionElement = switchPToTextArea(parsingDescriptionElement);
        _self.switchDelimiterListToSelect();
        firstPlateCellRangeElement = switchSpanToTextInput(firstPlateCellRangeElement);
        featureCellRangeElement = switchSpanToTextInput(featureCellRangeElement);
        featureCategoryElement = switchSpanToTextInput(featureCategoryElement);
        applyFirstPlateButton.style.display = "inline";
        newFeatureButton.style.display = "inline";
        addFeatureButton.style.display = "inline";
        deleteFeatureButton.style.display = "inline";

        _self.switchSaveAsButtonBackToSaveAs();
        _self.parseOnlyModeOn = false;
    };



    function switchTextInputToSpan(element){
        var span = document.createElement("span");
        span.innerHTML = element.value;
        span.id = element.id;
        $(element).replaceWith(span);
        return span;
    }

    function switchSpanToTextInput(element){
        var textInput = document.createElement("input");
        textInput.value = element.innerHTML;
        textInput.id = element.id;
        $(element).replaceWith(textInput);
        return textInput;
    }

    function switchTextAreaToP(element){
        var p = document.createElement("p");
        p.innerHTML = element.value;
        p.id = element.id;
        $(element).replaceWith(p);
        return p;
    }

    function switchPToTextArea(element){
        var textArea = document.createElement("textarea");
        textArea.value = element.innerHTML;
        textArea.id = element.id;
        $(element).replaceWith(textArea);
        return textArea;
    }

    function loadSelectElement(selectElement, optionNamesArray, optionsArray){
        // clear the select element and scroll back to the top
        selectElement.innerHTML = "";
        selectElement.scrollTop = 0;
        optionsArray = [];

        // load the select element
        for (var i=0; i<optionNamesArray.length; i++){
            var optionName = optionNamesArray[i];
            var option = document.createElement("option");
            optionsArray.push(option);
            option.setAttribute("value", optionName);
            option.innerHTML = optionName;
            selectElement.appendChild(option);
        }
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


     function init (){
        // +++++++++++++++++++++ parsing tab events +++++++++++++++++++++++++++++++++++++

        // when a file is selected using the files input, trigger the file select handler
        addEvent(filesInput, "change", _self.handleFileSelect);

        // if the choose file button is clicked, trigger a click event on the hidden
        // files input, to open a file system browser for selecting files
        addEvent(chooseFileButton, "click", function(){
            filesInput.click();
        });

        // Attach listener for when a file is first dragged onto the screen
        addEvent(document, "dragenter", function(e){
            e.stopPropagation();
            e.preventDefault();

            // Show an overlay so it is clear what the user needs to do
            document.body.classList.add('show-overlay');
        });
        // Attach a listener for while the file is over the browser window
        addEvent(document, "dragover", function(e) {
            e.stopPropagation();
            e.preventDefault();
        });

        // Attach a listener for when the file is actually dropped, and trigger the
        // file select handler
        addEvent(document, "drop", function(e) {
            e.stopPropagation();
            e.preventDefault();

            // Hides the overlay
            document.body.classList.remove('show-overlay');

            // Process the files
            _self.handleFileSelect(e);
        });

        addEvent(delimiterList, "change", _self.handleDelimiterChange);

        // ++++++++++++++++++ plate tab events +++++++++++++++++++++++++++++++++++++++++++
        addEvent(firstPlateCellRangeElement,
                 "change",
                 _self.handleFirstPlateCellRangeChange);

        addEvent(applyFirstPlateButton, "click", _self.handleApplyFirstPlate);



        // ++++++++++++++++++++ features tab events ++++++++++++++++++++++++++++++++++++++

        addEvent(newFeatureButton, "click", _self.handleNewFeature);
        addEvent(addFeatureButton, "click", _self.handleAddFeature);
        addEvent(deleteFeatureButton, "click", _self.handleDeleteFeature);
        addEvent(applyFeaturesButton, "click", _self.handleApplyFeatures);
        addEvent(featureListElement, "change", _self.handleFeatureSelection);
        addEvent(featureCellRangeElement, "change", _self.handleFeatureCellRangeChange);



        // ++++++++++++++++++++ Experiment tab events and selectize setup ++++++++++++++++

        addEvent(importAndSaveDataButton, "click", _self.handleDataImport);
        addEvent(downloadFileImportButton, "click", _self.handleDownloadFileImport);
        addEvent(downloadIntergroupButton, "click", _self.handleIntergroupDownload);
        addEvent(byPlateLevelFeatureRadioButton,
                 "click",
                 _self.handleByPlateLevelFeatureMethod);
        addEvent(byManualEntryRadioButton, "click", _self.handleByManualMethod);
        addEvent(plateLevelFeatureListElement,
                 "change",
                 _self.handlePlateLevelFeatureSelection);
        addEvent(setPlateIdButton, "click", _self.handlePlateIdSetButtonClick);
        addEvent(plateIdentifierList, "change", _self.handlePlateWithIdListSelection);

        var $select1 = $("#experiment").selectize({
            labelField: "name",
            valueField: "id",
            onChange: _self.handleExperimentSelection,
            create: false
        });

        experimentSelectizeElement = $select1[0].selectize;

        var $select2 = $("#plateID").selectize({
            labelField: "plateID",
            valueField: "plateID",
            onChange: _self.handlePlateIdSelection,
            create: true
        });

        plateIdentifierSelectizeElement = $select2[0].selectize;


        // ++++++++++++++++++++++++ tabs setup and events ++++++++++++++++++++++++++++++++

        // to get jQuery-UI tab functionality working
        $tabsElement.tabs({
            beforeActivate: _self.handleTabChange
        });


        // ++++++++++++++++++++++++++ General events +++++++++++++++++++++++++++++++++++++

        addEvent(saveConfigButton, "click", _self.handleSaveConfig);
        addEvent(saveAsConfigButton, "click", _self.handleSaveAsConfig);

        // +++++++++++++++++++++++++++ start the Parsing Controller ++++++++++++++++++++++
    }

    // set up all of the event handlers
    init();
}

ParserUI.convertStringToCellRange = function(string){
    if (!string){
        return null;
    }

    var range = string.trim();
    var rangeSplit = range.split(":");

    if (!rangeSplit
            || !(rangeSplit[0] && typeof rangeSplit[0] === "string")
            || !(rangeSplit[1] && typeof rangeSplit[0] === "string")){
        return null;
    }

    var startCoords = Grid.getCellCoordinates(rangeSplit[0].trim());
    var endCoords = Grid.getCellCoordinates(rangeSplit[1].trim());

    if (!startCoords
            || !startCoords[0]
            || !startCoords[1]
            || typeof startCoords[0] !== "number"
            || typeof startCoords[1] !== "number"){
        return null
    }

    if (!endCoords
        || !endCoords[0]
        || !endCoords[1]
        || typeof endCoords[0] !== "number"
        || typeof endCoords[1] !== "number"){
        return null
    }


    var cellRange = new CellRange(startCoords[0],
                                  startCoords[1],
                                  endCoords[0],
                                  endCoords[1]);

    return cellRange;
};