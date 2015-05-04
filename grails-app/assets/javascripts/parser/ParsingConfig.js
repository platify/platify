/**
 * ParsingConfig.js
 *
 * ParsingConfig objects store and manage all of the information necessary to parse one
 * type of assay machine output file. These objects store the information to recognize
 * different plates within the files and then locate important features on these plates
 * that provide label data at the well, plate, and experiment level.
 *
 * @author Team SurNorte
 * CSCI-E99
 * May 7, 2015
 */
// type of feature values
var PLATE = "plate";
var WELL_LEVEL = "wellLevel";
var PLATE_LEVEL = "plateLevel";
var EXPERIMENT_LEVEL = "experimentLevel";

// assume all assay plates have a 2:3 well row number to column number ratio
ParsingConfig.WELL_ROW_FACTOR = 2;
ParsingConfig.WELL_COL_FACTOR = 3;

/**
 * The constructor for ParsingConfig objects.
 * @param name - a unique string name for the parsing configuration
 * @param machineName - a string name for the assay machine that the parsing configuration
 *                  is for.
 * @param description - a string description of the parsing configuration
 * @param delimiter - a string representing the delimiter to be used for parsing the
 *                  delimiter separated value file format. The acceptable values are:
 *                      "comma"
 *                      "semicolon"
 *                      "colon"
 *                      "tab"
 * @constructor
 */
function ParsingConfig(name,
                       machineName,
                       description,
                       delimiter){
	this.id = null;
	this.name = name;
    this.machineName = machineName;
    this.description = description;
    this.delimiter = delimiter;
    this.plate = null;
    this.plateAnchors = [];  // elements stored as [relativeRow, relativeColumn, value]
    this.features = {};  // keyed on feature name
    this.numPlateRows = 0;
    this.numPlateCols = 0;
    this.colorPickerIndex = 0;

    var _self = this;

    /**
     * This is the constructor for BioFeature objects which represent both plates and
     * features at the experiment, plate, and well levels
     * @param feaLabel - the name of the feature
     * @constructor
     */
    function BioFeature(feaLabel){
        this.featureLabel = feaLabel;
        this.coordinateRange = null;
        this.relativeToLeftX= null;
        this.relativeToLeftY= null;
        this.color = null;
        this.typeOfFeature = null;  // PLATE, WELL_LEVEL, PLATE_LEVEL, EXPERIMENT_LEVEL
    }

    /**
     * A getter for the parsing identifier.
     * @returns {null|*} - the identifier of the calling ParsingConfig object, will return
     *                  null if the identifier has not previously been set.
     */
    this.getID = function(){
        return this.id;
    };

    /**
     * A setter for the parsing identifier.
     * @param parsingConfigIdentifier - the identifier of the parsing config object on
     * which its identifier is to be set.
     */
    _self.setID = function(parsingConfigIdentifier){
        _self.id = parsingConfigIdentifier;
    };

    /**
     * A getter for the calling ParsingConfig object's name.
     * @returns {*} - the name of the calling ParsingConfig object
     */
    this.getName = function(){
        return this.name;
    };

    /**
     * A setter for the calling ParsingConfig object's name.
     * @param nameForParsingConfig - the name to set for the calling ParsingConfig object
     *
     * Note: - This method will throw a INVALID_PARSING_NAME error if the given name for
     *      the parsing configuration is undefined, null, an empty string, or a string
     *      consisting of only whitespace.
     */
    this.setName = function(nameForParsingConfig){
        if (!nameForParsingConfig || !nameForParsingConfig.trim()){
            throw new ParsingConfigError(ParsingConfigError.INVALID_PARSING_NAME,
                                         nameForParsingConfig,
                                         "general",
                                         "set the parsing config name")
        }

        this.name = nameForParsingConfig.trim();
    };

    /**
     * A getter for the machine name of the calling ParsingConfig object.
     * @returns {*} - the machine name of the calling ParsingConfig object
     */
    this.getMachineName = function(){
        return this.machineName;
    };

    /**
     * A setter for the machine name of the calling ParsingConfig object.
     * @param nameOfAssayMachine - the machine name that the calling ParsingConfig object
     *                          is to have its machine name set to
     *
     * Note: - This method will throw a INVALID_MACHINE_NAME error if the given name of
     *      the assay machine is undefined, null, an empty string, or a string consisting
     *      of only whitespace.
     */
    this.setMachineName = function(nameOfAssayMachine){
        if (!nameOfAssayMachine || !nameOfAssayMachine.trim()){
            throw new ParsingConfigError(ParsingConfigError.INVALID_MACHINE_NAME,
                nameOfAssayMachine,
                "general",
                "set the parsing config machine name")
        }

        this.machineName = nameOfAssayMachine.trim();
    };

    /**
     * A getter for the description of the calling ParsingConfig object
     * @returns {*} - the description of the calling ParsingConfig object
     */
    this.getDescription = function(){
        return this.description;
    };

    /**
     * A setter for the description of the calling ParsingConfig object
     * @param parsingDescription - the description to set on the calling ParsingConfig
     *                          object
     */
    this.setDescription = function(parsingDescription){
        this.description = parsingDescription;
    };

    /**
     * A getter for the delimiter of the calling ParsingConfig object
     * @returns {*} - the delimiter of the calling ParsingConfig object
     */
    this.getDelimiter = function(){
        return this.delimiter;
    };

    /**
     * A setter for the delimiter of the calling ParsingConfig object
     * @param parsingDelimiter - the delimiter to set on the calling ParsingConfig object
     */
    this.setDelimiter = function(parsingDelimiter){
        this.delimiter = parsingDelimiter;
    };

    /**
     * A getter for the colorPicker index of the calling ParsingConfig object
     * @returns {number} - the current index of the colorpicker for the calling parsing
     *                  config object.
     */
    this.getColorPickerIndex = function(){
        return this.colorPickerIndex;
    };

    /**
     * A setter for the colorPicker index of  the calling ParsingConfig object
     * @param index - the index of the colorPicker to set on the calling ParsingConfig
     *              object.
     */
    this.setColorPickerIndex = function(index){
        this.colorPickerIndex = index;
    };

    /**
     * A getter for the number of plate rows for the calling ParsingConfig object.
     * @returns {number} - the number of plate rows for the calling ParsingConfig object
     */
    this.getNumberOfPlateRows = function(){
        return this.numPlateRows;
    };

    /**
     * A getter for the number of plate columns for the calling ParsingConfig object.
     * @returns {number} - the number of plate columns for the calling ParsingConfig
     *                  object
     */
    this.getNumberOfPlateColumns = function(){
        return this.numPlateCols;
    };

    /**
     * This method adds a plate anchor to the calling ParsingConfig objects. Plate anchors
     * consist of a relative row compared to the top left corner cell of the ParsingConfig
     * plate, relative column compared to the top left corner cell of the ParsingConfig
     * plate, and a cell value. Plate anchors are used to recognize plates in an assay
     * machine output file.
     * @param row - the row number on the grid of the plate anchor
     * @param column - the column number on the grid of the plate anchor
     * @param value - the cell value on the grid of the plate anchor.
     *
     * Note: - This method throws a FIRST_PLATE_NOT_DEFINED error if the first plate has
     *      not already been successfully set for the calling parsing config, using the
     *      addPlate method.
     *       - This method throws a NOT_ON_FIRST_PLATE error if the anchor is not within
     *      the coordinate range of the first plate for the ParsingConfig object.
     *       - This method throws a DUPLICATE_ANCHOR error if the given row and column
     *      have already been used to add an anchor to the calling ParsingConfig object.
     */
    this.addPlateAnchor = function(row, column, value){
        if (!this.plate){
            throw new ParsingConfigError(ParsingConfigError.FIRST_PLATE_NOT_DEFINED,
                                         Grid.getRowLabel(row) + column,
                                         "anchors",
                                         "add a new plate anchor");
        }

        if (!this.coordinateIsOnFirstPlate(row, column)){
            throw new ParsingConfigError(ParsingConfigError.NOT_ON_FIRST_PLATE,
                                        Grid.getRowLabel(row) + column,
                                        "anchors",
                                        "add a new plate anchor");
        }

        if (this.findPlateAnchorIndex(row, column) !== null){
            throw new ParsingConfigError(ParsingConfigError.DUPLICATE_ANCHOR,
                                         Grid.getRowLabel(row) + column,
                                         "anchor",
                                         "add a new plate anchor");

        }

        this.plateAnchors.push([row - this.plate.coordinateRange.startRow,
                                column - this.plate.coordinateRange.startCol,
                                value]);
    };

    /**
     * This method removes a plate anchor from the calling ParsingConfig object.
     * @param row - the grid row number of the anchor to remove
     * @param column - the grid column number of the anchor to remove
     *
     * Note: - If the plate is not defined for the calling ParsingConfig object, then this
     *      method will throw a FIRST_PLATE_NOT_DEFINED error.
     *       - If no anchor exists for the given row and column, then this method will
     *      throw a NO_SUCH_ANCHOR error.
     */
    this.removePlateAnchor = function(row, column){
        if (!this.plate){
            throw new ParsingConfigError(ParsingConfigError.FIRST_PLATE_NOT_DEFINED,
                Grid.getRowLabel(row) + column,
                "anchors",
                "remove a plate anchor");
        }

        var anchorIndex = this.findPlateAnchorIndex(row, column);

        if (anchorIndex === null) {
            throw new ParsingConfigError(ParsingConfigError.NO_SUCH_ANCHOR,
                                         Grid.getRowLabel(row) + column,
                                         "anchors",
                                         "remove a plate anchor")
        }

        this.plateAnchors.splice(anchorIndex, 1);
    };

    /**
     * This method returns an array of all of the defined feature names at every level
     * for the calling ParsingConfig object.
     * @returns {Array} - an array of all of the defined feature names at every level
     * for the calling ParsingConfig object.
     */
    this.getFeatureNames = function(){
        var result = [];

        for (var featureName in this.features){
            result.push(featureName);
        }

        return result;
    };

    /**
     * This method returns an array of all of the defined plate level feature names for
     * the calling ParsingConfig object.
     * @returns {Array} - an array of all of the defined plate level feature names for
     * the calling ParsingConfig object.
     */
    this.getPlateLevelFeatureNames = function(){
        var result = [];

        for (var featureName in this.features){
            var feature = this.getFeature(featureName);

            if (feature.typeOfFeature === PLATE_LEVEL){
                result.push(featureName);
            }
        }

        return result;
    };

    /**
     * This method returns a reference to a BioFeature object that matches a given
     * feature name.
     * @param featureName - the name of the feature that the reference to the
     * corresponding BioFeature is desired.
     * @returns {*} - a reference to the desired BioFeature object
     *
     * Note: - This method throws a NO_SUCH_FEATURE error if the calling ParsingConfig
     *      object contains no feature that matches the given feature name.
     */
    this.getFeature = function(featureName){
        var feature = this.features[featureName.trim()];

        if (!feature){
           throw new ParsingConfigError(ParsingConfigError.NO_SUCH_FEATURE,
                                        featureName,
                                        "general",
                                        "get a feature")
        }

        return feature;
    };

    /**
     * This method creates a new BioFeature object.
     * @param name - the name of the new BioFeature object
     * @param range - the cell range on the grid of the new BioFeature object
     * @param isParent - a boolean for whether or not the new BioFeature object is a plate
     *                  or experiment level feature
     * @param parent - the parent of the new BioFeature object. For well and plate level
     *              features this will be the plate BioFeature and for plates and
     *              experiment level features this will be null
     * @param typeOfFeature - PLATE, WELL_LEVEL, PLATE_LEVEL, or EXPERIMENT_LEVEL
     * @param color - the hex color string to use when highlighting the feature on the
     *              Grid
     * @returns {ParsingConfig.BioFeature} - the new BioFeature object
     *
     * Note: - This method throws a DUPLICATE_FEATURE_NAME error if there is already a
     *      feature with the same name added to the calling ParsingConfig object.
     */
    this.addFeature = function(name, range, isParent, parent, typeOfFeature, color){
        if (this.features[name.trim()]){
            throw new ParsingConfigError(ParsingConfigError.DUPLICATE_FEATURE_NAME,
                                         name,
                                         typeOfFeature,
                                         "add a new feature");
        }

        var newFeature = new BioFeature(name.trim());
        newFeature.coordinateRange = range;
        newFeature.relativeToLeftX = range.startCol;
        newFeature.relativeToLeftY = range.startRow;
        newFeature.typeOfFeature = typeOfFeature;
        newFeature.color = color;
        if (!isParent) {
            newFeature.relativeToLeftX = range.startCol - parent.coordinateRange.startCol;
            newFeature.relativeToLeftY = range.startRow - parent.coordinateRange.startRow;
            newFeature.importData = true;
        }

        console.log(newFeature);
        return newFeature;
    };

    /**
     * This method removes a feature from the calling ParsingConfig object
     * @param nameOfFeatureToDelete - the name string of the feature to delete
     *
     * Note: - If the given feature name matches no feature contained in the calling
     *      ParsingConfig object, then this method will throw a NO_SUCH_FEATURE error.
     */
    this.deleteFeature = function(nameOfFeatureToDelete){
        if (!this.features[nameOfFeatureToDelete.trim()]){
            throw new ParsingConfigError(ParsingConfigError.NO_SUCH_FEATURE,
                                         nameOfFeatureToDelete,
                                         "general",
                                         "delete a feature");
        }

        delete this.features[nameOfFeatureToDelete];
    };

    /**
     * This method sets the plate definition for the calling ParsingConfig object.
     * @param range - the CellRange of the plate on the Grid
     * @param examiner - the FileExaminer for the file that the plate is being defined for
     * @param color - the hex color string that should be used to highlight plates on the
     *              grid
     * @returns {null|*} - a reference to the BioFeature object representing the plate
     */
    this.addPlate = function(range, examiner, color){
        this.plateAnchors = [];
        this.features = {};

        this.plate = this.addFeature("plate", range, true, null, PLATE, color);
        return this.plate
    };

    /**
     * This method adds an experiment level feature to the calling ParsingConfig object.
     * @param name - the name of the new experiment level feature
     * @param range - the CellRange on the Grid of the feature on the first plate
     * @param color - the hex color string that should be used to highlight the feature
     *              on the grid
     * @returns {ParsingConfig.BioFeature} - a reference to the BioFeature object
     *                                    representing the new feature
     *
     * Note: - This method throws a FIRST_PLATE_NOT_DEFINED error if the first plate has
     *      not already been set for the calling ParsingConfig object
     *       - This method throws a FEATURE_TYPE_DOES_NOT_SUPPORT_MULTIPLE_CELLS error if
     *      the given cell range covers more than one cell.
     *       - This method throws a DUPLICATE_FEATURE_NAME error if there is already a
     *      feature with the same name added to the calling ParsingConfig object.
     */
    this.addExperimentLevelFeature = function(name, range, color){
        if (!this.plate){
            throw new ParsingConfigError(ParsingConfigError.FIRST_PLATE_NOT_DEFINED,
                                         name,
                                         "experiment",
                                         "add a new well level feature");
        }

        if(ParsingConfig.getCoordsInARange(range.startRow,
                                           range.startCol,
                                           range.endRow,
                                           range.endCol).length > 1){
            // case where an experiment level feature would have more than
            // one cell in its range
            throw new ParsingConfigError(
                ParsingConfigError.FEATURE_TYPE_DOES_NOT_SUPPORT_MULTIPLE_CELLS,
                range.toString,
                "experiment",
                "add a new well level feature");
        }

        var feature = this.addFeature(name, range, true, null, EXPERIMENT_LEVEL, color);

        this.features[name.trim()] = feature;

        return feature;
    };

    /**
     * This method adds a plate level feature to the calling ParsingConfig object.
     * @param name - the name of the new plate level feature
     * @param range - the CellRange on the Grid of the feature on the first plate
     * @param color - the hex color string that should be used to highlight the feature
     *              on the grid
     * @returns {ParsingConfig.BioFeature} - a reference to the BioFeature object
     *                                    representing the new feature
     *
     * Note: - This method throws a FIRST_PLATE_NOT_DEFINED error if the first plate has
     *      not already been set for the calling ParsingConfig object
     *       - This method throws a NOT_ON_FIRST_PLATE error if the range of the new
     *      feature is not entirely contained in the range of the first plate.
     *       - This method throws a FEATURE_TYPE_DOES_NOT_SUPPORT_MULTIPLE_CELLS error if
     *      the given cell range covers more than one cell.
     *       - This method throws a DUPLICATE_FEATURE_NAME error if there is already a
     *      feature with the same name added to the calling ParsingConfig object.
     */
    this.addPlateLevelFeature = function(name, range, color){
        if (!this.plate){
            throw new ParsingConfigError(ParsingConfigError.FIRST_PLATE_NOT_DEFINED,
                                         name,
                                         "plate",
                                         "add a new plate level feature");
        }

        if (!this.rangeIsOnFirstPlate(range)){
            throw new ParsingConfigError(ParsingConfigError.NOT_ON_FIRST_PLATE,
                                         name + " = " + range.toString(),
                                         "plate level features",
                                         "add a new plate level feature");
        }

        if(ParsingConfig.getCoordsInARange(range.startRow,
                                           range.startCol,
                                           range.endRow,
                                           range.endCol).length > 1){
            // case where a plate level feature would have more than
            // one cell in its range
            throw new ParsingConfigError(
                ParsingConfigError.FEATURE_TYPE_DOES_NOT_SUPPORT_MULTIPLE_CELLS,
                range.toString,
                "plate",
                "add a new plate level feature");
        }

        var feature = this.addFeature(name, range, false, this.plate, PLATE_LEVEL, color);

        this.features[name.trim()] = feature;

        return feature;
    };

    /**
     * This method adds a well level feature to the calling ParsingConfig object.
     * @param name - the name of the new well level feature
     * @param range - the CellRange on the Grid of the feature on the first plate
     * @param color - the hex color string that should be used to highlight the feature
     *              on the grid
     * @returns {ParsingConfig.BioFeature} - a reference to the BioFeature object
     *                                    representing the new feature
     *
     * Note: - This method throws a FIRST_PLATE_NOT_DEFINED error if the first plate has
     *      not already been set for the calling ParsingConfig object
     *       - This method throws a NOT_ON_FIRST_PLATE error if the range of the new
     *      feature is not entirely contained in the range of the first plate.
     *       - This method throws a DUPLICATE_FEATURE_NAME error if there is already a
     *      feature with the same name added to the calling ParsingConfig object.
     */
    this.addWellLevelFeature = function(name, range, color){
        if (!this.plate){
            throw new ParsingConfigError(ParsingConfigError.FIRST_PLATE_NOT_DEFINED,
                                         name,
                                         "well",
                                         "add a new well level feature");
        }

        if (!this.rangeIsOnFirstPlate(range)){
            throw new ParsingConfigError(ParsingConfigError.NOT_ON_FIRST_PLATE,
                                         name + " = " + range.toString(),
                                         "well level features",
                                         "add a new well level feature");
        }



        var feature = this.addFeature(name, range, false, this.plate, WELL_LEVEL, color);

        this.updatePlateDimensions(range);
        this.features[name.trim()] = feature;

        return feature;
    };

    /**
     * This method creates and adds a new feature to the calling ParsingConfig object.
     * @param name - the name of the new well level feature
     * @param range - the CellRange on the Grid of the feature on the first plate
     * @param level - the level of the new feature : WELL_LEVEL, PLATE_LEVEL,
     *              or EXPERIMENT_LEVEL
     * @param color - the hex color string that should be used to highlight the feature
     *              on the grid
     * @returns {*} - a reference to the BioFeature object representing the new feature
     *
     * Note: - This method throws a FEATURE_NAME_NOT_SPECIFIED error if the given name is
     *      undefined, null, is not a string, or an empty string or consists entirely of
     *      whitespace.
     *       - This method throws a FEATURE_RANGE_NOT_SPECIFIED error if the given range
     *      is undefined or null.
     *       - This method throws a FEATURE_LEVEL_NOT_SPECIFIED error if the given level
     *      is undefined or null.
     *       - This method throws a FEATURE_COLOR_NOT_SPECIFIED error if the given color
     *      is undefined, null, or an empty string.
     *       - This method may throw a variety of errors. Please see the documentation for
     *      addWellLevelFeature(), addPlateLevelFeature, and addExperimentLevelFeature for
     *      the details of the level specific error possibilities
     */
    this.createFeature = function(name, range, level, color){
        if (!name || !name.trim || !name.trim()){
            throw new ParsingConfigError(ParsingConfigError.FEATURE_NAME_NOT_SPECIFIED,
                                         name,
                                         level,
                                         "create a new feature");
        }
        if (!range){
            throw new ParsingConfigError(ParsingConfigError.FEATURE_RANGE_NOT_SPECIFIED,
                                         range,
                                         level,
                                         "create a new feature");
        }
        if (!level){
            throw new ParsingConfigError(ParsingConfigError.FEATURE_LEVEL_NOT_SPECIFIED,
                                         level,
                                         level,
                                         "create a new feature");
        }

        if (!color){
            throw new ParsingConfigError(ParsingConfigError.FEATURE_COLOR_NOT_SPECIFIED,
                                         color,
                                         level,
                                         "create a new feature");
        }

        var feature;

        if (level === WELL_LEVEL){
            feature = this.addWellLevelFeature(name, range, color);
        } else if (level === PLATE_LEVEL){
            feature = this.addPlateLevelFeature(name, range, color);
        } else if (level === EXPERIMENT_LEVEL){
            feature = this.addExperimentLevelFeature(name, range, color);
        } else {
            throw new ParsingConfigError(ParsingConfigError.LEVEL_NOT_RECOGNIZED,
                                         level,
                                         "general",
                                         "create a new feature");
        }

        return feature;
    };

    /**
     * This method updates the dimensions of plates for the calling ParsingConfig based on
     * the range of a well level feature that is added to the parsing configuration.
     * @param rangeOfWellLevelFeature - the range of a well level feature that is added to
     *                                the calling ParsingConfig object
     *
     * Note: - This method throws a NON_STANDARD_PLATE_DIMENSION_RATIO if the dimensions
     *      of the feature do not match the ratio:
     *
     *          ParsingConfig.WELL_ROW_FACTOR : ParsingConfig.WELL_COL_FACTOR
     *
     *      of plate rows to columns, which in the standard case is 2:3.
     *       - This method throws a PLATE_DIMENSION_DIFFERENCE error if the dimensions of
     *      plates implied by the give range of the well level feature, do not match the
     *      dimension of plates implied by previously added well level features.
     */
    this.updatePlateDimensions = function(rangeOfWellLevelFeature){
        var numPlateWells = ParsingConfig.getNumberOfWellsFromFeatureBounds(
                                                        rangeOfWellLevelFeature.startRow,
                                                        rangeOfWellLevelFeature.startCol,
                                                        rangeOfWellLevelFeature.endRow,
                                                        rangeOfWellLevelFeature.endCol);

        if (!ParsingConfig.plateDimensionIsCorrect(numPlateWells,
                                                   ParsingConfig.WELL_ROW_FACTOR,
                                                   ParsingConfig.WELL_COL_FACTOR)){
            throw new ParsingConfigError(
                                    ParsingConfigError.NON_STANDARD_PLATE_DIMENSION_RATIO,
                                    numPlateWells,
                                    "well",
                                    "update plate dimensions");
        }

        var plateDimensions = ParsingConfig.wellNumberToPlateDimension(numPlateWells,
                                                        ParsingConfig.WELL_ROW_FACTOR,
                                                        ParsingConfig.WELL_COL_FACTOR);


        if ((this.numPlateRows > 0 && plateDimensions[0] !== this.numPlateRows )
            || (this.numPlateCols > 0 && plateDimensions[1] !== this.numPlateCols)){
            throw new ParsingConfigError(ParsingConfigError.PLATE_DIMENSION_DIFFERENCE,
                                            plateDimensions[0] + ":" + plateDimensions[1],
                                            this.numPlateRows + ":" + this.numPlateCols,
                                            "update plate dimensions");
        }

        this.numPlateRows = plateDimensions[0];
        this.numPlateCols = plateDimensions[1];

    };

    /**
     * This method creates a JSON ready DTO of the calling ParsingConfig object.
     * @returns {{}} - a JSON ready DTO of the calling ParsingConfig object
     */
    this.getJSONObject = function(){
        var JSONObject = {};

        JSONObject["id"] = this.getID();
        JSONObject["name"] = this.getName();
        JSONObject["machineName"] = this.getMachineName();
        JSONObject["description"] = this.getDescription();
        JSONObject["delimiter"] = this.getDelimiter();
        JSONObject["plate"] = this.plate;
        JSONObject["plateAnchors"] = this.plateAnchors;
        JSONObject["features"] = this.features;
        JSONObject["numPlateRows"] = this.getNumberOfPlateRows();
        JSONObject["numPlateCols"] = this.getNumberOfPlateColumns();
        JSONObject["colorPickerIndex"] = this.getColorPickerIndex();

        return JSONObject;
    };

    /**
     * This method returns an array containing all of the possible level constants.
     * @returns {*[]} - an array containing all of the possible level constants
     */
    this.getFeatureLevels = function(){
        return [WELL_LEVEL, PLATE_LEVEL, EXPERIMENT_LEVEL];
    };

    /**
     * This method determines whether the cell specified by a row and column number on the
     * grid is contained in the first plate coordinate range
     * @param row - the row number on the grid (starting at 1) of the cell in question
     * @param col - the column number on the grid (starting at 1) of the cell in question.
     * @returns {boolean} - a boolean for whether or not the cell is contained on the
     *      defined first plate, if the first plate has not been defined, this method
     *      always returns false.
     */
    this.coordinateIsOnFirstPlate = function(row, col){
        if (!this.plate){
            return false
        } else {
            return (row >= this.plate.coordinateRange.startRow)
                && (row <= this.plate.coordinateRange.endRow)
                && (col >= this.plate.coordinateRange.startCol)
                && (col <= this.plate.coordinateRange.endCol);
        }
    };

    /**
     * This method determines whether a cell range is contained entirely on the first
     * plate defined for the calling ParsingConfig object.
     * @param range - the CellRange in question
     * @returns {boolean} - a boolean for whether or not the range is contained entirely
     *                  on the defined first plate for the calling ParsingConfig object,
     *                  if the first plate has not been defined, the the method always
     *                  returns false.
     */
    this.rangeIsOnFirstPlate = function(range){
        return (this.coordinateIsOnFirstPlate(range.startRow, range.startCol))
                && (this.coordinateIsOnFirstPlate(range.endRow, range.endCol));
    };

    /**
     * This method determines the index in the anchors array at which an anchor
     * representing a cell at a given grid row and column is located. If there is no
     * anchor for the cell at the given row and column, then null is returned.
     * @param row - the row of the anchor to find on the grid, not relative to the plate
     * @param column - the column of the anchor to find on the grid, not relative to the
     *              plate
     * @returns {*} - index in the anchors array at which an anchor representing a cell at
     *              a given grid row and column is located. If there is no anchor for the
     *              cell at the given row and column, then null is returned
     */
    this.findPlateAnchorIndex = function(row, column){
        var result = null;

        row = row - this.plate.coordinateRange.startRow;
        column = column - this.plate.coordinateRange.startCol;

        for (var i=0; i<this.plateAnchors.length; i++){
            var plateAnchorRow = this.plateAnchors[i][0];
            var plateAnchorCol = this.plateAnchors[i][1];

            if (row === plateAnchorRow && column === plateAnchorCol){
                result = i;
                break;
            }
        }

        return result;
    };

    /**
     * An initializer function for ParsingConfig objects
     */
    function init(){
        _self.id = null;
        _self.setName(name);
        _self.setMachineName(machineName);
        _self.setDescription(description);
        _self.setDelimiter(delimiter);
        _self.plate = null;
        _self.plateAnchors = [];  // elements stored as [relativeRow, relativeColumn, value]
        _self.features = {};  // keyed on feature name
        _self.numPlateRows = 0;
        _self.numPlateCols = 0;
        _self.colorPickerIndex = 0;
    }

    // the initializer must always be called
    init();
}

/**
 * A "static" method for reconstituting a ParsingConfig object from an associated DTO
 * retrieved from the server.
 * @param JSONParsingConfig - the DTO to use to create the full featured ParsingConfig
 *                          object
 * @returns {ParsingConfig} - a full featured ParsingConfig object based on the given DTO
 */
ParsingConfig.loadParsingConfig = function(JSONParsingConfig){
    var rawParsingConfig = JSON.parse(JSONParsingConfig);

    var config = new ParsingConfig(
    	rawParsingConfig.name,
        rawParsingConfig.machineName,
        rawParsingConfig.description,
        rawParsingConfig.delimiter);

    config.id = rawParsingConfig.id;
    config.plate = rawParsingConfig.plate;
    config.plateAnchors = rawParsingConfig.plateAnchors;
    config.features = rawParsingConfig.features;
    config.numPlateRows = rawParsingConfig.numPlateRows;
    config.numPlateCols = rawParsingConfig.numPlateCols;
    config.colorPickerIndex = rawParsingConfig.colorPickerIndex;

    for (var featureName in config.features){
        var feature = config.getFeature(featureName);
        var range = feature.coordinateRange;
        feature.coordinateRange = new CellRange(range.startRow,
                                                range.startCol,
                                                range.endRow,
                                                range.endCol);
    }

    if (rawParsingConfig.plate && rawParsingConfig.plate.coordinateRange){
        var plateRange = config.plate.coordinateRange;
        config.plate.coordinateRange = new CellRange(plateRange.startRow,
            plateRange.startCol,
            plateRange.endRow,
            plateRange.endCol);
    }

    return config;
};

/**
 * This "static" method determines whether or not a given number of wells on a plate
 * matches the assumed row to column number of well ratio on a plate of:
 *
 *          rowProportion : colProportion
 *
 * @param numberOfWells - the number of wells on a plate
 * @param rowProportion - the factor of rows on a plate
 * @param colProportion - the factor of columns on a plate
 * @returns {boolean} - a boolean for whether or not the number of wells matches the
 *                  given row:col ratio
 */
ParsingConfig.plateDimensionIsCorrect = function(numberOfWells, rowProportion, colProportion){
    var base = Math.sqrt(numberOfWells/(rowProportion * colProportion));

    return (base % 1 === 0);
};

/**
 * This "static" method determines the dimensions of a plate given a number of wells
 * and the ration of rows on a plate to columns on a plate of:
 *
 *          rowProportion : colProportion
 * @param numberOfWells - the number of wells on a plate
 * @param rowProportion - the factor of rows on a plate
 * @param colProportion - the factor of columns on a plate
 * @returns {*[]} - an array of length 2, in which the 0th value is the number of rows
 *          on a plate and the 1st value is the number of columns on a plate
 */
ParsingConfig.wellNumberToPlateDimension = function(numberOfWells, rowProportion, colProportion){
    var base = Math.sqrt(numberOfWells/(rowProportion * colProportion));
    var numColumns = base * colProportion;
    var numRows = base * rowProportion;

    return [numRows, numColumns];
};

/**
 * This "static" method determines the coordinates on a plate of a certain well index on
 * the plate using a given number of wells on the plate and an assumed ration of the
 * number of plate well rows to plate well columns:
 *
 *          rowProportion : colProportion
 * @param index - the index of the well in a listing of all wells on the plate (starting
 *              at 0)
 * @param numberOfWells - the number of wells on a plate
 * @param rowProportion - the factor of rows on a plate
 * @param colProportion - the factor of columns on a plate
 * @returns {*[]} - an array of length 2, in which the 0th value is the row index of the
 *          well and the 1st value is the column index of the well with both indices
 *          starting at 0.
 */
ParsingConfig.wellNumberToPlateCoords = function(index, numberOfWells, rowProportion, colProportion){
    var base = Math.sqrt(numberOfWells/(rowProportion * colProportion));
    var numColumns = base * colProportion;
    var numRows = base * rowProportion;

    var row = Math.floor(index/numColumns);
    var col = index % numColumns;

    return [row, col];
};

/**
 * This 'static' method returns a listing of all of the cells in a range of cells.
 * @param startRow - the row index of the starting cell in the range
 * @param startCol - the column index of the starting cell in the range
 * @param endRow - the row index of the ending cell in the range
 * @param endCol - the column index of the ending cell in the range
 * @returns {Array} - an array of arrays. The inner arrays are all of length 2 and
 *          represent the coordinates of a single cell in the range of cells. The 0th
 *          value hold the row index of the cell and the 1st value holds the column index
 *          of the cell.
 */
ParsingConfig.getCoordsInARange = function(startRow, startCol, endRow, endCol){
    var coordinates = [];
    for (var row = startRow; row<=endRow; row++){
        for (var col = startCol; col<=endCol; col++){
            coordinates.push([row, col]);
        }
    }
    return coordinates;
};

/**
 * This "static" method determines the number of wells on a plate from the range of a
 * feature.
 * @param startRow - the row index of the starting cell in the range
 * @param startCol - the column index of the starting cell in the range
 * @param endRow - the row index of the ending cell in the range
 * @param endCol - the column index of the ending cell in the range
 * @returns {number} - the number of wells on the assumed plate for the given well
 *          level feature range
 */
ParsingConfig.getNumberOfWellsFromFeatureBounds = function(startRow,
                                                           startCol,
                                                           endRow,
                                                           endCol){
    var width = endCol - startCol + 1;
    var height = endRow - startRow + 1;

    return width * height;
};

/**
 * This "static" method determines if a certain cell, given by its coordinates, is
 * contained in a range of cells.
 * @param cellCoords - an array of length 2 representing the coordinates of a cell to
 *              to determine if the cell is in the given cell range. The form of these
 *              cell coordinates is [row, column]
 * @param range - a CellRange representing the range to test the given cell for membership
 * @returns {boolean} - a boolean for whether or not the given cell is contained in the
 *                  given range, inclusive of the range bounding cells
 */
ParsingConfig.cellIsContainedInRange = function(cellCoords, range){
    var rangeStartRow = range[0];
    var rangeStartCol = range[1];
    var rangeEndRow = range[2];
    var rangeEndCol = range[3];

    var cellRow = cellCoords[0];
    var cellCol = cellCoords[1];

    return (cellRow >= rangeStartRow && cellRow <= rangeEndRow
        && cellCol >= rangeStartCol && cellCol <= rangeEndCol);
};

/**
 * This "static" method creates and returns a 2D array containing all zero values.
 * @param rows - the number of rows in the 2D array
 * @param columns - the number of columns in the 2D array
 * @returns {Array} - a 2D array containing all zero values of the given dimensions
 */
ParsingConfig.createZeros2DArray = function(rows, columns){
    var result = [];

    for (var i=0; i<rows; i++){
        result[i] = [];
        for (var j=0; j<columns; j++){
            result[i][j] = 0;
        }
    }

    return result;
};


// types of ParsingConfigErrors
ParsingConfigError.FEATURE_TYPE_DOES_NOT_SUPPORT_MULTIPLE_CELLS
    = "multiple cells not supported for feature type";
ParsingConfigError.NOT_ON_FIRST_PLATE = "not on first plate";
ParsingConfigError.FIRST_PLATE_NOT_DEFINED = "first plate not defined";
ParsingConfigError.NO_SUCH_ANCHOR = "no such anchor";
ParsingConfigError.DUPLICATE_ANCHOR = "duplicate anchor";
ParsingConfigError.DUPLICATE_FEATURE_NAME = "duplicate feature name";
ParsingConfigError.NO_SUCH_FEATURE = "no such feature";
ParsingConfigError.INVALID_PARSING_NAME = "invalid parsing name";
ParsingConfigError.INVALID_MACHINE_NAME = "invalid machine name";
ParsingConfigError.LEVEL_NOT_RECOGNIZED = "level not recognized";
ParsingConfigError.NON_STANDARD_PLATE_DIMENSION_RATIO = "non-standard plate dimension " +
                                                        "ratio";
ParsingConfigError.PLATE_DIMENSION_DIFFERENCE = "plate dimension difference";
ParsingConfigError.FEATURE_NAME_NOT_SPECIFIED = "feature name not specified";
ParsingConfigError.FEATURE_LEVEL_NOT_SPECIFIED = "feature level not specified";
ParsingConfigError.FEATURE_RANGE_NOT_SPECIFIED = "feature range not specified";
ParsingConfigError.FEATURE_COLOR_NOT_SPECIFIED = "feature color not specified";


/**
 * ParsingConfigError objects store and represent the conditions under which an
 * exceptional event occurred in the manipulation of ParsingConfig objects.
 * @param type - a constant describing the reason for the error, possible options listed
 *              above
 * @param descriptor - a string describing the circumstance of the error
 * @param level - the level that the error occurred at
 * @param attemptedAction - the action that was being attempted when the error occurred
 * @constructor
 */
function ParsingConfigError(type, descriptor, level, attemptedAction){
    this.type = type;
    this.descriptor = descriptor;
    this.level = level;
    this.attemptedAction = attemptedAction;


    /**
     * This method returns a human readable message describing the error.
     * @returns {string} - a human readable string message describing the calling error
     */
    this.getMessage = function() {
        if (this.type === ParsingConfigError.FEATURE_TYPE_DOES_NOT_SUPPORT_MULTIPLE_CELLS) {
            return "Features at the " + this.level + " level cannot have multiple cells.";
        } else if (this.type === ParsingConfigError.NOT_ON_FIRST_PLATE) {
            return "All " + this.level + " must be entirely on the first plate.";
        } else if (this.type === ParsingConfigError.FIRST_PLATE_NOT_DEFINED) {
            return "The first plate must be defined before you may "
                + this.attemptedAction + ".";
        } else if (this.type === ParsingConfigError.NO_SUCH_ANCHOR) {
            return "The anchor at cell " + this.descriptor + " does not exist.";
        } else if (this.type === ParsingConfigError.DUPLICATE_ANCHOR) {
            return "An anchor at cell " + this.descriptor + " already exists.";
        } else if (this.type === ParsingConfigError.DUPLICATE_FEATURE_NAME) {
            return "A feature named " + this.descriptor + " already exists.";
        } else if (this.type === ParsingConfigError.NO_SUCH_FEATURE) {
            return "There is no feature named " + this.descriptor + ".";
        } else if (this.type === ParsingConfigError.INVALID_PARSING_NAME) {
            return "The name for the parsing configuration, \"" + descriptor + "\", " +
                "is not a valid name.";
        } else if (this.type === ParsingConfigError.INVALID_MACHINE_NAME){
            return "The machine name for the parsing configuration, \"" + descriptor
                    + "\", is not a valid machine name.";
        }else if (this.type === ParsingConfigError.LEVEL_NOT_RECOGNIZED){
            return "The level \"" + this.descriptor + "\" was not recognized.";
        } else if (this.type === ParsingConfigError.NON_STANDARD_PLATE_DIMENSION_RATIO){
            return "The number of wells per plate for this feature does not match the" +
                " standard row to column ratio " + ParsingConfig.WELL_ROW_FACTOR + ":"
                + ParsingConfig.WELL_COL_FACTOR + ".";
        } else if (this.type === ParsingConfigError.PLATE_DIMENSION_DIFFERENCE){
            return "The previous well level features indicated a " + this.level +
                " plate well dimension while the current feature indicates a plate well "+
                "dimension of " + this.descriptor + ".";
        } else if (this.type === ParsingConfigError.FEATURE_NAME_NOT_SPECIFIED){
            return "A feature category must be specified to " + this.attemptedAction +".";
        } else if (this.type === ParsingConfigError.FEATURE_LEVEL_NOT_SPECIFIED){
            return "A feature level must be specified to " + this.attemptedAction + ".";
        } else if (this.type === ParsingConfigError.FEATURE_RANGE_NOT_SPECIFIED){
            return "A valid feature range must be specified to " + this.attemptedAction
                    + ".";
        } else if (this.type === ParsingConfigError.FEATURE_COLOR_NOT_SPECIFIED){
            return "A feature color must be specified to " + this.attemptedAction + ".";
        }
    }
}


