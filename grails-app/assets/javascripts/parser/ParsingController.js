/**
 * ParsingController.js
 *
 * A ParsingController object is the brain of the assay machine output file parser.
 * @constructor
 */

// start up the parser web application front end
window.onload = ParsingController;


// Some stage constants
ParsingController.PARSING_INFO = 0;
ParsingController.PLATE = 1;
ParsingController.FEATURES = 2;
ParsingController.EXPERIMENT = 3;

function ParsingController(){
    var _self = this;

    _self.parserUI = new ParserUI(_self);
    _self.grid = new Grid("myGrid");
    _self.gridHighlighter = new GridHighlighter(_self.grid);
    _self.examiner = null;
    _self.parsingConfig = null;
    _self.importData = null;
    _self.colorPicker = new ColorPicker();
    _self.parseOnlyMode = false;
    _self.selectCells = null;
    _self.originalName = null;
    _self.stage = null;
    _self.rawFiles = null;



    _self.loadFiles = function(files){
        if(_self.stage !== ParsingController.PARSING_INFO){
            throw new ParsingControllerError(
                                    ParsingControllerError.WRONG_STAGE_FOR_FILE_SELECTION,
                                    _self.stage,
                                    "general",
                                    "load files");
        }

        _self.rawFiles = files;
        // start with a fresh file examiner, and set its load event listener
        _self.examiner = new FileExaminer();
        _self.examiner.registerAsLoadListener(_self.handleExaminerLoad);

        if (_self.parsingConfig && _self.parsingConfig.delimiter){
            // if the parsingConfig already has a delimiter specified, use that delimiter
            // for reading the files
            _self.examiner.setDelimiter(parsingConfig.delimiter)
        } else {
            // otherwise, let the file examiner determine the delimiter
            _self.examiner.setDelimiter(null);
        }

        // start the file examination process, which will end with an examine load event
        // handled by the registered load listener function
        _self.examiner.setFiles(files);
    };


    _self.handleExaminerLoad = function(response){
        var examiner;

        if (response instanceof FileExaminerError){
            _self.parserUI.displayError(response)
        } else {
            examiner = response;

            loadDelimiterList();

            // show the delimiter used for loading the file in the UI
            _self.parserUI.setDelimiter(examiner.delimiter);

            // display the file in the grid
            _self.grid.setData(examiner.matrix);
            _self.grid.fillUpGrid();


            // reset the plates on the parsing config
            if (_self.parsingConfig && _self.parsingConfig.plate){
                _self.plates = DataExtractor.findPlates(_self.grid,
                    _self.parsingConfig,
                    _self.examiner);
            }
        }
    };

    _self.changeDelimiter = function(delimiter){
        _self.examiner.reExamineWithDelimiter(delimiter);
    };

    _self.changeStage = function(newStage, oldStage){
        _self.grid.enableCellSelection();

        if (oldStage === ParsingController.PARSING_INFO){
            if (_self.examiner === null){
                throw new ParsingControllerError(ParsingControllerError.NO_FILE,
                    "leave parsing info stage",
                    "general",
                    "change stages");
            }

            _self.createOrUpdateParsingConfig();
        } else if (oldStage === ParsingController.PLATE){

        } else if (oldStage === ParsingController.FEATURES){

        } else if (oldStage === ParsingController.EXPERIMENT) {

        }

        if (newStage === ParsingController.PARSING_INFO){
            // fill out the parsing config info in the ui, if there is a parsing config
            if (_self.parsingConfig){
                _self.parserUI.setParsingName(_self.parsingConfig.getName());
                _self.parserUI.setMachineName(_self.parsingConfig.getMachineName());
                _self.parserUI.setParsingDescription(_self.parsingConfig.getDescription());
                _self.parserUI.setPlateDimensions(_self.parsingConfig.getPlateDimensions());
                _self.parserUI.setAssayType(_self.parsingConfig.getAssayType());
                _self.parserUI.setDelimiter(_self.parsingConfig.getDelimiter());
            }

            _self.gridHighlighter.removeAllHighlighting();
            _self.selectCells = selectCellsParsing;
        } else if (newStage === ParsingController.PLATE){
            if (_self.parsingConfig && _self.parsingConfig.plate && _self.examiner){
                _self.parserUI.setFirstPlateCellRange(
                                               _self.parsingConfig.plate.coordinateRange);

                // highlight all the recognized plates on the grid
                _self.gridHighlighter.removeAllHighlighting();
                _self.gridHighlighter.highlightAllPlates(_self.plates);
            }

            _self.selectCells = selectCellsPlates;
        } else if (newStage === ParsingController.FEATURES){
            if (!_self.parsingConfig.plate){
                throw new ParsingControllerError(ParsingControllerError.PLATE_NOT_DEFINED,
                    "leave plate stage",
                    "general",
                    "change stages");
            }

            // fill the listing of features in the UI and clear fields like for new
            // feature
            if (_self.parsingConfig){
                _self.parserUI.loadFeatureList(_self.parsingConfig.getFeatureNames());
            } else {
                _self.parserUI.loadFeatureList([]);
            }
            _self.prepareUIForNewFeature();

            if (_self.parsingConfig && _self.parsingConfig.plate && _self.examiner){
                // highlight all the recognized plates on the grid
                _self.gridHighlighter.removeAllHighlighting();
                _self.gridHighlighter.highlightAllPlates(_self.plates);
            }

            _self.parserUI.loadFeatureList(_self.parsingConfig.getFeatureNames());
            _self.selectCells = selectCellsFeatures;
        } else if (newStage === ParsingController.EXPERIMENT) {
            if (!_self.parsingConfig.plate){
                throw new ParsingControllerError(ParsingControllerError.PLATE_NOT_DEFINED,
                    "leave plate stage",
                    "general",
                    "change stages");
            }

            if (!_self.parserUI.getParsingID()){
                throw new ParsingControllerError(
                                ParsingControllerError.PARSING_CONFIG_NOT_SAVED_TO_SERVER,
                                "move to the experiment stage",
                                "general",
                                "change stages");
            }

            // initialize and fill out the importData object
            _self.importData = new ImportData(_self.plates.length,
                                              _self.parsingConfig.getNumberOfPlateRows(),
                                              _self.parsingConfig.getNumberOfPlateColumns());
            _self.importData.setParsingID(_self.parsingConfig.getID());
            _self.importData.setRawFiles(_self.rawFiles);
            DataExtractor.fillImportData(_self.importData,
                                         _self.parsingConfig,
                                         _self.plates,
                                         _self.grid);

            // load the plate level feature list
            _self.parserUI.loadPlateLevelFeatureList(
                                         _self.parsingConfig.getPlateLevelFeatureNames());
            // load the plate identifier list
            _self.parserUI.loadPlateWithIDList(
                                              _self.importData.getPlateIdentifierArray());

            _self.grid.disableCellSelection();
        }

        _self.stage = newStage;
    };

    _self.handleSelectedCells = function(startRow, startCol, endRow, endCol){
        var range = new CellRange(startRow, startCol, endRow, endCol);

        _self.selectCells(range);
    };

    function selectCellsParsing(range){
        // remove previous highlighting
        _self.gridHighlighter.removeAllHighlighting();

        if (range){
            // highlight those cells with the plate color
            _self.gridHighlighter.selectCellsInRange(range, ColorPicker.PLATE_COLOR);
        }
    }

    function selectCellsPlates(range){
        // remove previous highlighting
        _self.gridHighlighter.removeAllHighlighting();

        if (range){
            // set plate range display/input on the plate page
            _self.parserUI.setFirstPlateCellRange(range);

            // highlight those cells with the plate color
            _self.gridHighlighter.selectCellsInRange(range, ColorPicker.PLATE_COLOR);
        }


    }


    function selectCellsFeatures(range){
        // remove previous highlighting
        _self.gridHighlighter.removeAllHighlighting();

        if (range){
            // clear all selected feature info
            _self.parserUI.clearFeatureInfo();

            // disable the delete feature button
            _self.parserUI.disableDeleteFeatureButton();

            // set feature range display/input on the feature page
            _self.parserUI.setFeatureCellRange(range);

            // highlight plates if already specified
            if (_self.plates){
                _self.gridHighlighter.highlightAllPlates(_self.plates);
            }

            // highlight selected cells with the current color
            _self.gridHighlighter.selectCellsInRange(range,
                _self.colorPicker.getCurrentColor());
        }
    }

    _self.defineFirstPlate = function(range){
        // set the parsing config plate to the given range and anchor it in its top left
        // corner for later plate finding on the grid.
        _self.parsingConfig.addPlate(range, ColorPicker.PLATE_COLOR);
        _self.parsingConfig.addPlateAnchor(range.startRow,
                                           range.startCol,
                                 _self.grid.getDataPoint(range.startRow, range.startCol));

        // find all the plates on the grid that match the parsing config plate anchor
        // pattern
        _self.plates = DataExtractor.findPlates(_self.grid,
                                                _self.parsingConfig,
                                                _self.examiner);

        // highlight all the recognized plates on the grid
        _self.gridHighlighter.removeAllHighlighting();
        _self.gridHighlighter.highlightAllPlates(_self.plates);
    };

    _self.defineFeature = function(){
        // get the necessary feature details from the UI
        var featureName = _self.parserUI.getFeatureCategory();
        var level = _self.parserUI.getFeatureLevel();
        var range = _self.parserUI.getFeatureCellRange();
        var color = _self.colorPicker.getCurrentColor();

        // create the new feature in the parsing config
        _self.parsingConfig.createFeature(featureName, range, level, color);

        // update the listing of features in the UI
        _self.parserUI.loadFeatureList(_self.parsingConfig.getFeatureNames());

        // show the feature in the UI
        _self.displayFeature(featureName);

        // enable the delete button
        _self.parserUI.enableDeleteFeatureButton();

        // move color picker to the next color
        _self.colorPicker.getNextColor();

        // set the color picker index on the parsing config
        _self.parsingConfig.setColorPickerIndex(_self.colorPicker.getColorIndex());
    };

    _self.prepareUIForNewFeature = function(){
        // clear all feature fields
        _self.parserUI.clearFeatureInfo();

        // disable the delete button
        _self.parserUI.disableDeleteFeatureButton();

        // remove feature highlighting from grid
        _self.gridHighlighter.removeAllFeatureHighlightKeys();
        _self.gridHighlighter.removeSelectionHighlightKeys();
    };

    _self.removeFeature = function(featureName){
        // delete the feature from the parsing configuration
        _self.parsingConfig.deleteFeature(featureName);

        // update the listing of features in the UI
        _self.parserUI.loadFeatureList(_self.parsingConfig.getFeatureNames());

        // prepare the UI for a new feature
        _self.prepareUIForNewFeature();
    };

    _self.displayFeature = function(featureName){
        var feature = _self.parsingConfig.getFeature(featureName);
        var featureLabelDescriptors = DataExtractor.getFeatureValuesDescriptors(
            featureName,
            _self.plates,
            _self.grid,
            _self.parsingConfig);

        // fill in the UI with the details for the given feature
        _self.parserUI.setFeatureCellRange(feature.coordinateRange.toString());
        _self.parserUI.setFeatureLevel(feature.typeOfFeature);
        _self.parserUI.setFeatureCategory(feature.featureLabel);
        _self.parserUI.setFeature(featureName);
        _self.parserUI.loadLabelList(featureLabelDescriptors);

        // highlight only that feature
        _self.gridHighlighter.removeAllFeatureHighlightKeys();
        _self.gridHighlighter.removeSelectionHighlightKeys();
        _self.gridHighlighter.highlightFeature(featureName,
                                               _self.parsingConfig,
                                               _self.plates);
    };

    _self.applyAllFeaturesToGrid = function(){
        // highlight all plates and features
        _self.gridHighlighter.removeAllFeatureHighlightKeys();
        _self.gridHighlighter.removeSelectionHighlightKeys();
        _self.gridHighlighter.highlightAllFeatures(_self.parsingConfig,
                                                         _self.plates);

        // clear the feature tab fields
        _self.parserUI.clearFeatureInfo();

        // disable the delete button
        _self.parserUI.disableDeleteFeatureButton();
    };

    _self.assignPlateIDsByFeature = function(){
        //_self.parserUI.setSelectedPlateWithIDIndex(null);
        //_self.gridHighlighter.removeAllPlateHighlightKeys();
        _self.parserUI.setSelectedPlateLevelFeature(null);
    };

    _self.assignPlateIDsByManualMethod = function(){
        _self.parserUI.setSelectedPlateLevelFeature(null);
        _self.gridHighlighter.removeAllFeatureHighlightKeys();

        if (_self.plates.length && !_self.parserUI.getSelectedPlateWithIDIndex()){
            _self.parserUI.setSelectedPlateWithIDIndex(0);
            _self.showPlate(0);
        }
    };

    _self.showPlateLevelFeature = function(featureName){
        _self.gridHighlighter.removeAllFeatureHighlightKeys();
        _self.gridHighlighter.highlightFeature(featureName,
                                               _self.parsingConfig,
                                               _self.plates);
    };

    _self.showPlate = function(plateIndex){
        _self.gridHighlighter.removeAllPlateHighlightKeys();
        _self.gridHighlighter.highlightPlate(plateIndex, _self.plates);

        // if necessary, re-highlight any selected plate level feature on top of the
        // plates
        var selectedPlateLevelFeature = _self.parserUI.getSelectedPlateLevelFeature();
        if (selectedPlateLevelFeature){
            _self.gridHighlighter.highlightFeature(selectedPlateLevelFeature,
                                                   _self.parsingConfig,
                                                   _self.plates);
        }

        _self.grid.scrollToRow(_self.plates[plateIndex][0]);
    };



    _self.setPlateLevelFeatureAsPlateID = function(featureName){
        var featureValueArray = DataExtractor.findPlateLevelFeatureValues(featureName,
                                                                          _self.plates,
                                                                      _self.parsingConfig,
                                                                          _self.grid);

        _self.importData.setPlateIdentifiersWithArray(featureValueArray);

        var selectedPlateIndex = _self.parserUI.getSelectedPlateWithIDIndex();
        _self.parserUI.loadPlateWithIDList(featureValueArray);
        _self.parserUI.setSelectedPlateWithIDIndex(selectedPlateIndex);

        // highlight the selected feature
        _self.showPlateLevelFeature(featureName);
    };

    _self.setPlateID = function(plateIndex, identifier){
        // update the importData object with the new plate identifier
        _self.importData.setPlateIdentifier(plateIndex, identifier);

        // update the listing of assigned plate identifiers in the UI
        _self.parserUI.loadPlateWithIDList(_self.importData.getPlateIdentifierArray());
        _self.parserUI.setSelectedPlateWithIDIndex(plateIndex);

        // move the selected identifier and plate with id down by 1
        _self.parserUI.incrementPlateAndIdentifierSelections();
        var newSelectedPlateIndex = _self.parserUI.getSelectedPlateWithIDIndex();

        // highlight the newly selected plate on the grid
        _self.gridHighlighter.removeAllHighlighting();
        _self.gridHighlighter.highlightPlate(newSelectedPlateIndex, _self.plates);
    };

    _self.saveImportDataToServer = function(){
        _self.importData.setExperimentID(_self.parserUI.getSelectedExperimentID());
        _self.importData.setRawFilesData(_self.examiner.rawFileContents)
        _self.importData.throwErrorIfAnyPlateIDsNotSet();

        var serverCommunicator = new ServerCommunicator(hostname);
        serverCommunicator.registerImportDataSaveCallback(function(response){
            if (response instanceof ServerCommunicatorError){
                _self.parserUI.displayError(response);
            } else {
                console.log("response:");
                console.log(response);
                window.canUpdate = false;
                _self.parserUI.displayMessage("Your assay machine output file data was "+
                "successfully stored on server.");
                _self.parserUI.disableSaveButton();
                _self.parserUI.switchToParseOnlyMode();
            }
        });

        serverCommunicator.saveImportDataToServer(_self.importData);
    };

    _self.downloadImportData = function(){
        var importFileDataGenerator = new ImportDataFileGenerator();
        importFileDataGenerator.createImportDataMatrix(importData);
        var filename;
        var experimentName = _self.parserUI.getSelectedExperimentName();
        if (experimentName){
            filename = experimentName + "_results.txt";
        } else {
            filename = "experiment_results.txt"
        }

        importFileDataGenerator.forceTSVDownload(filename);
    };

    _self.downloadIntergroupData = function(){
        var importFileDataGenerator = new ImportDataFileGenerator();
        importFileDataGenerator.createIntergroupInterchangeFormatMatrix(importData);
        var filename;
        var experimentName = _self.parserUI.getSelectedExperimentName();
        if (experimentName){
            filename = experimentName + "_results.csv";
        } else {
            filename = "experiment_results.csv"
        }

        importFileDataGenerator.forceCSVDownload(filename);
    };

    /**
     * This function assumes that a parsing config will be loaded at page loading time
     * and that the parser will start in the parsing info stage.
     * @param JSONParsingConfig
     */
    _self.loadParsingConfig = function(JSONParsingConfig){
        _self.parsingConfig = ParsingConfig.loadParsingConfig(JSONParsingConfig);
        _self.colorPicker.setColorIndex(_self.parsingConfig.getColorPickerIndex());

        // TODO - for tomorrow
        //_self.parserUI.switchToParseOnlyMode();

        if (!canUpdate){
            _self.parserUI.switchToParseOnlyMode();
            _self.parserUI.disableSaveButton();
        }
    };

    _self.createOrUpdateParsingConfig = function(){
        var parseId = _self.parserUI.getParsingID();
        var parseName = _self.parserUI.getParsingName();
        var machine = _self.parserUI.getMachineName();
        var plateDimensions = _self.parserUI.getPlateDimensions();
        var assayType = _self.parserUI.getAssayType();
        var description = _self.parserUI.getParsingDescription();
        var delimiter = _self.parserUI.getSelectedDelimiter();


        if (_self.parsingConfig){
            _self.parsingConfig.setID(parseId);
            _self.parsingConfig.setName(parseName);
            _self.parsingConfig.setMachineName(machine);
            _self.parsingConfig.setPlateDimensions(plateDimensions);
            _self.parsingConfig.setAssayType(assayType);
            _self.parsingConfig.setDescription(description);
            _self.parsingConfig.setDelimiter(delimiter);
            console.log( _self.parsingConfig);
        } else {
            _self.parsingConfig = new ParsingConfig(parseName,
                machine,
                plateDimensions,
                assayType,
                description,
                delimiter);
        }

    };

    _self.saveParsingConfigToServer = function(){
        var serverCommunicator = new ServerCommunicator(hostname);

        // make sure parsing config has been initialized or updated
        _self.createOrUpdateParsingConfig();

        serverCommunicator.registerParsingConfigSaveCallback(
                                                        _self.saveConfigToServerCallback);

        if (_self.parsingConfig.getID()){
            if (window.canUpdate){
                serverCommunicator.saveParsingConfigToServer(_self.parsingConfig,
                    ServerCommunicator.SAVE_UPDATE,
                    _self.parsingConfig.getID());
            } else {
                // TODO - consider this possibility
                console.log("bad");
            }
        } else {
            serverCommunicator.saveParsingConfigToServer(_self.parsingConfig,
                                                         ServerCommunicator.SAVE_NEW,
                                                         null);
        }

    };

    _self.saveAsParsingConfigToServer = function(){
        // make sure parsing config has been initialized or updated
        _self.createOrUpdateParsingConfig();

        if (_self.parsingConfig.getName() === _self.originalName){
            throw new ParsingControllerError(
                                        ParsingControllerError.SAVE_AS_WITH_ORIGINAL_NAME,
                                        _self.parsingConfig.getName(),
                                        "general",
                                        "save parsing config to server");
        }

        var serverCommunicator = new ServerCommunicator(hostname);

        serverCommunicator.registerParsingConfigSaveCallback(
                                                        _self.saveConfigToServerCallback);
        serverCommunicator.saveParsingConfigToServer(_self.parsingConfig,
                                                     ServerCommunicator.SAVE_NEW,
                                                     null);
        _self.parserUI.enableSaveButton();
        window.canUpdate = true;
    };

    _self.saveConfigToServerCallback = function(response){
        if (response instanceof ServerCommunicatorError){
            _self.parserUI.displayError(response);
        } else {
            _self.parserUI.setParsingID(response.equipment.id);
            _self.parsingConfig.setID(response.equipment.id);
            _self.parserUI.displayMessage("Your parsing configuration was successfully" +
                                            " stored on server.");
            _self.parserUI.enableSaveAsButton();
            _self.originalName = _self.parsingConfig.getName();
        }
    };

    _self.fillOutExperimentPlateIDs = function(experimentID){
        var serverCommunicator = new ServerCommunicator(hostname);
        serverCommunicator.registerPlateIDArrayCallback(function(response){
            if (response instanceof ServerCommunicatorError){
                _self.parserUI.displayError(response);
            } else {
                _self.parserUI.loadPlateIDSelectize(response.barcodes);
            }
        });

        serverCommunicator.getExperimentPlateIDArray(experimentID);
    };

    function loadDelimiterList (){
        var supportedDelimiters = _self.examiner.getSupportedDelimiterNames();

        _self.parserUI.loadDelimiterList(supportedDelimiters);
    }

    function init(){

        // handle preloaded parsing configurations
        if (typeof window.equipment != "undefined"){
            _self.loadParsingConfig(equipment);
            _self.parserUI.enableSaveAsButton();
            _self.originalName = _self.parsingConfig.getName();

            if (window.canUpdate){
                _self.parserUI.enableSaveButton();
            } else {
                _self.parserUI.disableSaveButton();
            }

        } else {
            _self.parserUI.disableSaveAsButton();
        }

        // set up some event handlers
        _self.grid.registerSelectedCellCallBack(_self.handleSelectedCells);

        // set the initial active tab
        _self.changeStage(ParsingController.PARSING_INFO, -1);
        _self.parserUI.setActiveTab(ParsingController.PARSING_INFO);


    }

    init();
}


ParsingControllerError.NO_FILE = "no file";
ParsingControllerError.PLATE_NOT_DEFINED = "plate not defined";
ParsingControllerError.PARSING_CONFIG_NOT_SAVED_TO_SERVER
        = "parsing config not saved to server";
ParsingControllerError.SAVE_AS_WITH_ORIGINAL_NAME = "save as with original name";
ParsingControllerError.WRONG_STAGE_FOR_FILE_SELECTION = "wrong stage for file selection";

function ParsingControllerError(type, descriptor, level, attemptedAction){
    this.type = type;
    this.descriptor = descriptor;
    this.level = level;
    this.attemptedAction = attemptedAction;

    this.getMessage = function(){
        if (this.type === ParsingControllerError.NO_FILE){
            return "A file must be selected for parsing and/or creating a parsing " +
                "configuration.";
        } else if (this.type === ParsingControllerError.PLATE_NOT_DEFINED){
            return "A plate must be specified and applied."
        } else if (this.type === ParsingControllerError.PARSING_CONFIG_NOT_SAVED_TO_SERVER){
            return "The parsing configuration must be saved before you can "
                + this.descriptor + ".";
        } else if (this.type === ParsingControllerError.SAVE_AS_WITH_ORIGINAL_NAME){
            return "To save the parsing configuration as a new configuration, you must " +
                "change it's name."
        } else if (this.type === ParsingControllerError.WRONG_STAGE_FOR_FILE_SELECTION){
            return "Files may only be selected on the parsing info tab.";
        }
    }
}