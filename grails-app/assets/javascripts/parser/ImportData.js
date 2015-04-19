/**
 * Created by zacharymartin on 3/24/15.
 */

ImportData.NO_ID = "none";
ImportData.BLANK = "";
ImportData.NUMERIC = "numeric";
ImportData.NON_NUMERIC = "non-numeric";


function ImportData(experimentIdentifier, parsingConfigIdentifier, numPlates, numRows, numCols){
    this.experimentID = experimentIdentifier;
    this.parsingID = parsingConfigIdentifier;
    this.experimentFeatures = {
        labels: {}
    };
    this.plates = [];

    this.wellLevelCategories = {};
    this.plateLevelCategories = {};
    this.experimentLevelCategories = {};
    this.numRows = 0;
    this.numCols = 0;

    var _self = this;

    init(numPlates, numRows, numCols);

    function init(numPlates, numRows, numCols){
        // first some error checking
        if (numPlates < 0){
            throw new ImportDataError(ImportDataError.NEGATIVE_NUMBER_OF_PLATES,
                                      numPlates,
                                      "overall initialization",
                                      "initialize an import data object");
        }

        if (numRows < 0){
            throw new ImportDataError(ImportDataError.NEGATIVE_NUMBER_OF_ROWS,
                                      numRows,
                                      "overall initialization",
                                      "initialize an import data object");
        }

        if (numCols < 0){
            throw new ImportDataError(ImportDataError.NEGATIVE_NUMBER_OF_COLUMNS,
                                      numCols,
                                      "overall initialization",
                                      "initialize an import data object");
        }

        _self.numRows = numRows;
        _self.numCols = numCols;

        for (var plateIndex = 0; plateIndex< numPlates; plateIndex++){
            _self.plates.push({
                plateID: ImportData.NO_ID,
                labels: {},
                rows: []
            });

            var plate = _self.plates[plateIndex];

            for (var rowIndex = 0; rowIndex< numRows; rowIndex++){
                plate.rows.push({
                    columns: []
                });
                var row = plate.rows[rowIndex];
                var rowLabel = Grid.getRowLabel(rowIndex + 1);

                for (var columnIndex = 0; columnIndex<numCols; columnIndex++){
                    row.columns.push({
                        wellID: rowLabel + (columnIndex + 1),
                        labels: {},
                        rawData: {},
                        normalizedData: {}
                    });
                }
            }
        }
    }

    this.addExperimentLevelCategory = function(categoryName){

        // first some error checking
        if (!categoryName){
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                                      categoryName,
                                      "experiment level category name",
                                      "add an experiment level category");
        }

        if (this.experimentLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.CATEGORY_ALREADY_DEFINED,
                                      "categoryName",
                                      "experiment",
                                      "add an experiment level category");
        }

        this.experimentLevelCategories[categoryName] = true;
        this.experimentFeatures.labels[categoryName] = ImportData.BLANK;
    };

    this.getExperimentLevelCategories = function(){
        var result = [];

        for (var category in this.experimentLevelCategories){
            if (this.experimentLevelCategories[category]){
                result.push(category);
            }
        }

        return result;
    };

    this.removeExperimentLevelCategory = function(categoryName){
        // first some error checking
        if (!this.experimentLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                categoryName,
                "experiment",
                "remove experiment level category");
        }

        delete this.experimentFeatures.labels[categoryName];
        delete this.experimentLevelCategories[categoryName];
    };

    this.getExperimentLevelLabels = function(categoryName){
        var result;

        if (!this.experimentLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                                      categoryName,
                                      "experiment",
                                      "get experiment level labels");
        }

        result = this.experimentFeatures.labels[categoryName];

        return result;
    };

    this.setExperimentLevelLabel = function(categoryName, value){

        // first some error checking
        if (!this.experimentLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                                      categoryName,
                                      "experiment",
                                      "set an experiment level label value");
        }

        if (!value && value !== ImportData.BLANK){
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                                      value,
                                      "experiment level label value",
                                      "set an experiment level label value");
        }

        this.experimentFeatures.labels[categoryName] = value;
    };

    this.addPlateLevelCategory = function(categoryName){
        // first some error checking
        if (!categoryName){
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                categoryName,
                "plate level category name",
                "add a plate level category");
        }

        if (this.plateLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.CATEGORY_ALREADY_DEFINED,
                "categoryName",
                "plate",
                "add a plate level category");
        }

        this.plateLevelCategories[categoryName] = true;

        for (var plateIndex = 0; plateIndex<this.plates.length; plateIndex++){
            var plate = this.plates[plateIndex];
            plate.labels[categoryName] = ImportData.BLANK;
        }

    };

    this.getPlateLevelCategories = function(){
        var result = [];

        for (var category in this.plateLevelCategories){
            if (this.plateLevelCategories[category]){
                result.push(category);
            }
        }

        return result;
    };

    this.removePlateLevelCategory = function(categoryName){
        // first some error checking
        if (!this.plateLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                categoryName,
                "plate",
                "remove plate level category");
        }


        delete this.plateLevelCategories[categoryName];

        for (var plateIndex = 0; plateIndex<this.plates.length; plateIndex++){
            var plate = this.plates[plateIndex];
            delete plate.labels[categoryName];
        }
    };


    this.getPlateLevelLabelForSinglePlate = function(plateIndex, categoryName){
        var result;

        if (!this.plates[plateIndex]){
            throw new ImportDataError(ImportDataError.NO_SUCH_PLATE,
                plateIndex,
                "plate",
                "get a plate level label value for single plate");
        }

        if (!this.plateLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                categoryName,
                "plate",
                "get plate level label value for single plate");
        }

        var plate = this.plates[plateIndex];
        result = plate.labels[categoryName];

        return result;
    };

    this.getPlateLevelLabelforAllPlates = function(categoryName){
        var result = [];

        if (!this.plateLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                                      categoryName,
                                      "plate",
                                      "get plate level label value for all plates");
        }

        for (var plateIndex=0; plateIndex<this.plates.length; plateIndex++){
            var plate = this.plates[plateIndex];
            result.push(plate.labels[categoryName]);
        }

        return result;
    };

    this.setPlateLevelLabel = function(plateIndex, categoryName, value){
        // first some error checking
        if (!this.plates[plateIndex]){
            throw new ImportDataError(ImportDataError.NO_SUCH_PLATE,
                                      plateIndex,
                                      "plate",
                                      "set a plate level label value");
        }

        if (!this.plateLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                categoryName,
                "plate",
                "set a plate level label value");
        }

        if (!value && value !== ImportData.BLANK){
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                value,
                "plate level label value",
                "set a plate level label value");
        }

        var plate = this.plates[plateIndex];
        plate.labels[categoryName] = value;
    };




    this.addWellLevelCategory = function(categoryName, numeric){
        // first some error checking
        if (!categoryName){
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                categoryName,
                "well level category name",
                "add a well level category");
        }

        if (this.wellLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.CATEGORY_ALREADY_DEFINED,
                "categoryName",
                "well",
                "add a plate level category");
        }

        if (numeric){
            this.wellLevelCategories[categoryName] = ImportData.NUMERIC;
        } else {
            this.wellLevelCategories[categoryName] = ImportData.NON_NUMERIC;
        }


        for (var plateIndex = 0; plateIndex<this.plates.length; plateIndex++){
            var plate = this.plates[plateIndex];

            for (var rowIndex = 0; rowIndex<plate.rows.length; rowIndex++){
                var row = plate.rows[rowIndex];

                for (var columnIndex = 0; columnIndex<row.columns.length; columnIndex++){
                    var well = row.columns[columnIndex];

                    well.labels[categoryName] = ImportData.BLANK;

                    if (numeric){
                        well.rawData[categoryName] = ImportData.BLANK;
                        well.normalizedData[categoryName] = ImportData.BLANK;
                    }
                }
            }
        }
    };

    this.getWellLevelCategories = function(){
        var result = [];

        for (var category in this.wellLevelCategories){
            if (this.wellLevelCategories[category]){
                result.push(category);
            }
        }

        return result;
    };

    this.removeWellLevelCategory = function(categoryName){
        // first some error checking
        if (!this.wellLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                categoryName,
                "well",
                "remove well level category");
        }


        delete this.wellLevelCategories[categoryName];

        for (var plateIndex = 0; plateIndex<this.plates.length; plateIndex++){
            var plate = this.plates[plateIndex];

            for (var rowIndex = 0; rowIndex<plate.rows.length; rowIndex++){
                var row = plate.rows[rowIndex];

                for (var columnIndex = 0; columnIndex<row.columns.length; columnIndex++){
                    var well = row.columns[columnIndex];

                    delete well.labels[categoryName];
                }
            }
        }
    };


    this.getWellLevelLabelForSinglePlate = function(plateIndex,
                                                    rowIndex,
                                                    columnIndex,
                                                    categoryName){
        var result;

        if (!this.plates[plateIndex]){
            throw new ImportDataError(ImportDataError.NO_SUCH_PLATE,
                plateIndex,
                "well",
                "get a well level label value for single plate");
        }

        if (!this.plates[plateIndex].rows[rowIndex]){
            throw new ImportDataError(ImportDataError.NO_SUCH_ROW,
                rowIndex,
                "well",
                "get a well level label value for single plate");
        }

        if (!this.plates[plateIndex].rows[rowIndex].columns[columnIndex]){
            throw new ImportDataError(ImportDataError.NO_SUCH_COLUMN,
                columnIndex,
                "well",
                "get a well level label value for single plate");
        }

        if (!this.wellLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                categoryName,
                "well",
                "get well level label value for single plate");
        }

        var plate = this.plates[plateIndex];
        var row = plate.rows[rowIndex];
        var well = row.columns[columnIndex];
        result = well.labels[categoryName];

        return result;
    };

    this.getWellLevelLabelforAllPlates = function(categoryName){
        var result = [];

        if (!this.plateLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                categoryName,
                "plate",
                "get plate level label value for all plates");
        }

        for (var plateIndex = 0; plateIndex<this.plates.length; plateIndex++){
            var plate = this.plates[plateIndex];
            result.push({});

            for (var rowIndex = 0; rowIndex<plate.rows.length; rowIndex++){
                var row = plate.rows[rowIndex];

                for (var columnIndex = 0; columnIndex<row.columns.length; columnIndex++){
                    var well = row.columns[columnIndex];

                    result[plateIndex][well.wellID] = well.labels[categoryName];
                }
            }
        }

        return result;
    };

    this.setWellLevelLabel = function(plateIndex,
                                       rowIndex,
                                       columnIndex,
                                       categoryName,
                                       value){
        // first some error checking
        if (!this.plates[plateIndex]){
            throw new ImportDataError(ImportDataError.NO_SUCH_PLATE,
                plateIndex,
                "well",
                "set a well level label value");
        }

        if (!this.plates[plateIndex].rows[rowIndex]){
            throw new ImportDataError(ImportDataError.NO_SUCH_ROW,
                rowIndex,
                "well",
                "set a well level label value");
        }

        if (!this.plates[plateIndex].rows[rowIndex].columns[columnIndex]){
            throw new ImportDataError(ImportDataError.NO_SUCH_COLUMN,
                columnIndex,
                "well",
                "set a well level label value");
        }

        if (!this.wellLevelCategories[categoryName]){
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                categoryName,
                "well",
                "set a well level label value");
        }

        if (!value && value !== ImportData.BLANK){
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                value,
                "plate level label value",
                "set a plate level label value");
        }

        var plate = this.plates[plateIndex];
        var row = plate.rows[rowIndex];
        var well = row.columns[columnIndex];
        well.labels[categoryName] = value;

        if (value && this.wellLevelCategories[categoryName] == ImportData.NUMERIC){
            well.rawData[categoryName] = parseFloat(value);
        }
    };

    this.numPlates = function(){
        if (this.plates && this.plates.length){
            return this.plates.length;
        } else {
            return 0;
        }
    };

    this.numberOfPlateRows = function(){
        if (this.numRows){
            return this.numRows;
        } else {
            return 0;
        }
    };

    this.numberOfPlateColumns = function(){
        if (this.numCols){
            return this.numCols;
        } else {
            return 0;
        }
    };

    this.getJSONImportDataObject = function(){
        var object = {};

        object.experimentID = this.experimentID;
        object.parsingID = this.parsingID;
        object.experimentFeatures = this.experimentFeatures;
        object.plates = this.plates;

        return object;
    }
}

ImportData.createImportDataObjectFromJSON = function(JSONObject){
    var result;

    if (!JSONObject){
        throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                                  JSONObject,
                                  "overall",
                                  "create an import data object from a JSON object");
    }

    var plateDimensions = findNumberOfPlateRowsAndColumns(JSONObject);
    var numberOfPlates = findNumberOfPlates(JSONObject);
    var wellLevelCategories = findWellLevelCategories(JSONObject);
    var plateLevelCategories = findPlateLevelCategories(JSONObject);
    var experimentLevelCategories = findExperimentLevelCategories(JSONObject);
    var categoryName;

    result = new ImportData(JSONObject.experimentID,
                            JSONObject.parsingID,
                            numberOfPlates,
                            plateDimensions[0],
                            plateDimensions[1]);

    // load the result ImportData object up with data from the JSON object

    for (categoryName in wellLevelCategories){
        var numeric = wellLevelCategories[categoryName];
        result.addWellLevelCategory(categoryName, numeric);
    }

    for (var j=0; j<plateLevelCategories.length; j++){
        categoryName = plateLevelCategories[j];
        result.addPlateLevelCategory(categoryName);
    }

    for (var k=0; k<experimentLevelCategories.length; k++){
        categoryName = experimentLevelCategories[k];
        result.addExperimentLevelCategory(categoryName);
        result.setExperimentLevelLabel(categoryName,
                                      JSONObject.experimentFeatures.labels[categoryName]);
    }

    if (numberOfPlates) {
        for (var plateIndex = 0; plateIndex < numberOfPlates; plateIndex++){
            var plate = JSONObject.plates[plateIndex];
            for (j=0; j<plateLevelCategories.length; j++){
                categoryName = plateLevelCategories[j];
                result.setPlateLevelLabel(plateIndex,
                                          categoryName,
                                          plate.labels[categoryName]);
            }


            if (plateDimensions[0] && plateDimensions[1]){
                for(var rowIndex = 0; rowIndex < plate.rows.length ; rowIndex++){
                    var row = plate.rows[rowIndex];

                    for (var columnIndex=0; columnIndex<row.columns.length;columnIndex++){
                        var well = row.columns[columnIndex];

                        for (categoryName in wellLevelCategories){
                            result.setWellLevelLabel(plateIndex,
                                                     rowIndex,
                                                     columnIndex,
                                                     categoryName,
                                                     well.labels[categoryName]);
                        }
                    }
                }
            }
        }
    }

    return result;


    function findExperimentLevelCategories(dataObject){
        var result = [];

        if (dataObject
            && dataObject.experimentFeatures
            && dataObject.experimentFeatures.labels) {

            for (var category in importData.experimentFeatures.labels){
                result.push(category);
            }
        }

        return result;
    }

    function findPlateLevelCategories(dataObject){
        var result = [];
        var seenCategories = {};

        if (dataObject && dataObject.plates && dataObject.plates.length){
            for (var plateIndex = 0; plateIndex<dataObject.plates.length; plateIndex++){
                var plate = dataObject.plates[plateIndex];

                if (plate.labels){
                    for (var category in plate.labels){
                        if (!seenCategories[category]){
                            seenCategories[category] = true;
                            result.push(category);
                        }
                    }
                }
            }
        }

        return result;
    }

    function findWellLevelCategories(dataObject){
        var result = {};

        if (dataObject && dataObject.plates && dataObject.plates.length) {
            for (var plateIndex = 0; plateIndex < dataObject.plates.length; plateIndex++){
                var plate = dataObject.plates[plateIndex];

                if (plate.rows && plate.rows.length){
                    for(var rowIndex = 0; rowIndex < plate.rows.length ; rowIndex++){
                        var row = plate.rows[rowIndex];

                        for (var columnIndex=0;
                             columnIndex<row.columns.length;
                             columnIndex++){
                            var well = row.columns[columnIndex];

                            if (well.labels){
                                for (var category in well.labels){
                                    if (!result[category]){
                                        result[category] = ImportData.NUMERIC;
                                    }

                                    if (well.rawData
                                        && !well.rawData[category]
                                        && well.rawData[category] !== ImportData.BLANK){
                                        result[category] = ImportData.NON_NUMERIC;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return result;
    }

    function findNumberOfPlateRowsAndColumns(dataObject){
        var result = [0,0];

        if (dataObject && dataObject.plates && dataObject.plates.length) {
            for (var plateIndex = 0; plateIndex < dataObject.plates.length; plateIndex++){
                var plate = dataObject.plates[plateIndex];

                if (plate.rows && plate.rows.length){
                    for(var rowIndex = 0; rowIndex < plate.rows.length ; rowIndex++){
                        var row = plate.rows[rowIndex];

                        result[0]++;

                        if (row.columns && row.columns.length && row.columns.length > result[1]){
                            result[1] = row.columns.length;
                        }
                    }
                }
            }
        }

        return result;
    }

    function findNumberOfPlates(dataObject){
        result = 0;

        if (dataObject && dataObject.plates && dataObject.plates.length){
            result = dataObject.plates.length;
        }

        return result;
    }
};

ImportDataError.NO_SUCH_CATEGORY = "no such category";
ImportDataError.CATEGORY_ALREADY_DEFINED = "category already defined";
ImportDataError.NO_SUCH_PLATE = "no such plate";
ImportDataError.NO_SUCH_ROW = "no such row";
ImportDataError.NO_SUCH_COLUMN = "no such column";
ImportDataError.NEGATIVE_NUMBER_OF_PLATES = "negative number of plates";
ImportDataError.NEGATIVE_NUMBER_OF_COLUMNS = "negative number of columns";
ImportDataError.NEGATIVE_NUMBER_OF_ROWS = "negative number of rows";
ImportDataError.ILLEGAL_ARGUMENT = "illegal argument";


function ImportDataError(type, descriptor, level, attemptedAction){
    this.type = type;
    this.descriptor = descriptor;
    this.level = level;
    this.attemptedAction = attemptedAction;

    this.errorMessage = function(){
        if (this.type == ImportDataError.NO_SUCH_CATEGORY){
            return "The category, " + this.descriptor + ", has not been defined at the "
                + this.level + " level.";
        } else if (this.type == ImportDataError.CATEGORY_ALREADY_DEFINED){
            return "The category, " + this.descriptor + ", has already been defined at " +
                "the " + this.level + " level.";
        } else if (this.type == ImportDataError.NO_SUCH_PLATE){
            return "The plate of index, " + this.descriptor + ", has not been defined.";
        } else if (this.type == ImportDataError.NO_SUCH_ROW){
            return "The plate row of index, " + this.descriptor + ", has not been " +
                "defined.";
        } else if (this.type == ImportDataError.NO_SUCH_COLUMN){
            return "The plate column of index, " + this.descriptor + ", has not been " +
                "defined.";
        } else if (this.type == ImportDataError.NEGATIVE_NUMBER_OF_PLATES){
            return "The number of plates must be non-negative, i.e. greater than or " +
                "equal to 0";
        } else if (this.type == ImportDataError.NEGATIVE_NUMBER_OF_COLUMNS){
            return "The number of columns must be non-negative, i.e. greater than or " +
                "equal to 0";
        } else if (this.type == ImportDataError.NEGATIVE_NUMBER_OF_ROWS){
            return "The number of rows must be non-negative, i.e. greater than or " +
                "equal to 0";
        } else if (this.type == ImportDataError.ILLEGAL_ARGUMENT){
            return "The value, " + this.descriptor + " is not a valid " + this.level
                + ".";
        }
    }
}