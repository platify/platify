/**
 * Created by zacharymartin on 3/22/15.
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


    function BioFeature(feaLabel){
        this.featureLabel = feaLabel;
        this.coordinateRange = null;
        this.relativeToLeftX= null;
        this.relativeToLeftY= null;
        this.color = null;
        this.typeOfFeature = null;  // PLATE, WELL_LEVEL, PLATE_LEVEL, EXPERIMENT_LEVEL
    }

    this.getID = function(){
        return this.id;
    };

    _self.setID = function(parsingConfigIdentifier){
        _self.id = parsingConfigIdentifier;
    };

    this.getName = function(){
        return this.name;
    };

    this.setName = function(nameForParsingConfig){
        if (!nameForParsingConfig || !nameForParsingConfig.trim()){
            throw new ParsingConfigError(ParsingConfigError.INVALID_PARSING_NAME,
                                         nameForParsingConfig,
                                         "general",
                                         "set the parsing config name")
        }

        this.name = nameForParsingConfig.trim();
    };

    this.getMachineName = function(){
        return this.machineName;
    };

    this.setMachineName = function(nameOfAssayMachine){
        if (!nameOfAssayMachine || !nameOfAssayMachine.trim()){
            throw new ParsingConfigError(ParsingConfigError.INVALID_MACHINE_NAME,
                nameOfAssayMachine,
                "general",
                "set the parsing config machine name")
        }

        this.machineName = nameOfAssayMachine.trim();
    };

    this.getDescription = function(){
        return this.description;
    };

    this.setDescription = function(parsingDescription){
        this.description = parsingDescription;
    };

    this.getDelimiter = function(){
        return this.delimiter;
    };

    this.setDelimiter = function(parsingDelimiter){
        this.delimiter = parsingDelimiter;
    };

    this.getColorPickerIndex = function(){
        return this.colorPickerIndex;
    };

    this.setColorPickerIndex = function(index){
        this.colorPickerIndex = index;
    };

    this.getNumberOfPlateRows = function(){
        return this.numPlateRows;
    };

    this.getNumberOfPlateColumns = function(){
        return this.numPlateCols;
    };

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
            throw new ParsingConfigError()
        }

        this.plateAnchors.push([row - this.plate.coordinateRange.startRow,
                                column - this.plate.coordinateRange.startCol,
                                value]);
    };

    this.removePlateAnchor = function(row, column){
        var anchorIndex = this.findPlateAnchorIndex(row, column);

        if (!this.plate){
            throw new ParsingConfigError(ParsingConfigError.FIRST_PLATE_NOT_DEFINED,
                                         Grid.getRowLabel(row) + column,
                                         "anchors",
                                         "remove a plate anchor");
        }

        if (anchorIndex === null) {
            throw new ParsingConfigError(ParsingConfigError.DUPLICATE_ANCHOR,
                                         Grid.getRowLabel(row) + column,
                                         "anchors",
                                         "remove a plate anchor")
        }

        this.plateAnchors.splice(anchorIndex, 1);
    };

    this.getFeatureNames = function(){
        var result = [];

        for (var featureName in this.features){
            result.push(featureName);
        }

        return result;
    };

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

    this.deleteFeature = function(nameOfFeatureToDelete){
        if (!this.features[nameOfFeatureToDelete.trim()]){
            throw new ParsingConfigError(ParsingConfigError.NO_SUCH_FEATURE,
                                         nameOfFeatureToDelete,
                                         "general",
                                         "delete a feature");
        }

        delete this.features[nameOfFeatureToDelete];
    };

    this.addPlate = function(range, examiner, color){
        this.plateAnchors = [];
        this.features = {};

        this.plate = this.addFeature("plate", range, true, null, PLATE, color);
        return this.plate
    };

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

    this.getJSONObject = function(){
        var JSONObject = {};

        JSONObject["id"] = this.id;
        JSONObject["name"] = this.name;
        JSONObject["machineName"] = this.machineName;
        JSONObject["description"] = this.description;
        JSONObject["delimiter"] = this.delimiter;
        JSONObject["plate"] = this.plate;
        JSONObject["plateAnchors"] = this.plateAnchors;
        JSONObject["features"] = this.features;
        JSONObject["numPlateRows"] = this.numPlateRows;
        JSONObject["numPlateCols"] = this.numPlateCols;
        JSONObject["colorPickerIndex"] = this.colorPickerIndex;

        return JSONObject;
    };

    this.getFeatureLevels = function(){
        return [WELL_LEVEL, PLATE_LEVEL, EXPERIMENT_LEVEL];
    };

    this.coordinateIsOnFirstPlate = function(row, col){

        return (row >= this.plate.coordinateRange.startRow)
                && (row <= this.plate.coordinateRange.endRow)
                && (col >= this.plate.coordinateRange.startCol)
                && (col <= this.plate.coordinateRange.endCol);
    };

    this.rangeIsOnFirstPlate = function(range){
        return (this.coordinateIsOnFirstPlate(range.startRow, range.startCol))
                && (this.coordinateIsOnFirstPlate(range.endRow, range.endCol));
    };

    this.findPlateAnchorIndex = function(row, column){
        result = null;

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

    init();
}

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

ParsingConfig.plateDimensionIsCorrect = function(numberOfWells, rowProportion, colProportion){
    var base = Math.sqrt(numberOfWells/(rowProportion * colProportion));

    return (base % 1 === 0);
};

ParsingConfig.wellNumberToPlateDimension = function(numberOfWells, rowProportion, colProportion){
    var base = Math.sqrt(numberOfWells/(rowProportion * colProportion));
    var numColumns = base * colProportion;
    var numRows = base * rowProportion;

    return [numRows, numColumns];
};

ParsingConfig.wellNumberToPlateCoords = function(index, numberOfWells, rowProportion, colProportion){
    var base = Math.sqrt(numberOfWells/(rowProportion * colProportion));
    var numColumns = base * colProportion;
    var numRows = base * rowProportion;

    var row = Math.floor(index/numColumns);
    var col = index % numColumns;

    return [row, col];
};

ParsingConfig.getCoordsInARange = function(startRow, startCol, endRow, endCol){
    var coordinates = [];
    for (var row = startRow; row<=endRow; row++){
        for (var col = startCol; col<=endCol; col++){
            coordinates.push([row, col]);
        }
    }
    return coordinates;
};

ParsingConfig.getNumberOfWellsFromFeatureBounds = function(startRow,
                                                           startCol,
                                                           endRow,
                                                           endCol){
    var width = endCol - startCol + 1;
    var height = endRow - startRow + 1;

    return width * height;
};

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


function ParsingConfigError(type, descriptor, level, attemptedAction){
    this.type = type;
    this.descriptor = descriptor;
    this.level = level;
    this.attemptedAction = attemptedAction;


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


