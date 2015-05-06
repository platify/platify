/**
 * ImportData.js
 *
 * ImportData objects store the information parsed from a plate assay machine output file.
 *
 * @author Team SurNorte
 * CSCI-E99
 * May 7, 2015
 */

ImportData.NO_ID = "&lt;&lt;none&gt;&gt;";
ImportData.BLANK = "";
ImportData.NUMERIC = "numeric";
ImportData.NON_NUMERIC = "non-numeric";


/**
 * The constructor for ImportData objects. Note that it is assumed that all plates that
 * an ImportData object represents are of the same dimensions, that is they all have the
 * same number of rows and columns.
 *
 * @param numPlates - the number of plates that the ImportData object is to store data
 *                  for
 * @param numRows - the number of rows on each plate that the new ImportData object will
 *                  be storing assay results for
 * @param numCols - the number of columns on each plate that the new ImportData object
 *                  will be storing assay results for
 * @constructor
 *
 * Note: - If numPlates, numRows, or numCols is negative then a
 *      NEGATIVE_NUMBER_OF_PLATES, NEGATIVE_NUMBER_OF_ROWS, or a
 *      NEGATIVE_NUMBER_OF_COLUMNS error will be thrown, respectively.
 */
function ImportData(numPlates, numRows, numCols) {
    this.experimentID = null;
    this.parsingID = null;
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

    /**
     * This function initializes the ImportData object to have the correct structure.
     *
     *  @param numPlates - the number of plates that the ImportData object is to store data
     *                  for
     * @param numRows - the number of rows on each plate that the new ImportData object
     *                  will be storing assay results for
     * @param numCols - the number of columns on each plate that the new ImportData object
     *                  will be storing assay results for
     *
     * Note: - If numPlates, numRows, or numCols is negative then a
     *      NEGATIVE_NUMBER_OF_PLATES, NEGATIVE_NUMBER_OF_ROWS, or a
     *      NEGATIVE_NUMBER_OF_COLUMNS error will be thrown, respectively.
     *
     */
    function init(numPlates, numRows, numCols) {
        // first some error checking
        if (numPlates < 0) {
            throw new ImportDataError(ImportDataError.NEGATIVE_NUMBER_OF_PLATES,
                    numPlates,
                    "overall initialization",
                    "initialize an import data object");
        }

        if (numRows < 0) {
            throw new ImportDataError(ImportDataError.NEGATIVE_NUMBER_OF_ROWS,
                    numRows,
                    "overall initialization",
                    "initialize an import data object");
        }

        if (numCols < 0) {
            throw new ImportDataError(ImportDataError.NEGATIVE_NUMBER_OF_COLUMNS,
                    numCols,
                    "overall initialization",
                    "initialize an import data object");
        }

        _self.experimentID = ImportData.NO_ID;
        _self.parsingID = ImportData.NO_ID;

        _self.numRows = numRows;
        _self.numCols = numCols;

        for (var plateIndex = 0; plateIndex< numPlates; plateIndex++) {
            _self.plates.push({
                plateID: ImportData.NO_ID,
                labels: {},
                rawData: {},
                normalizedData: {},
                rows: []
            });

            var plate = _self.plates[plateIndex];

            for (var rowIndex = 0; rowIndex< numRows; rowIndex++) {
                plate.rows.push({
                    columns: []
                });
                var row = plate.rows[rowIndex];
                var rowLabel = Grid.getRowLabel(rowIndex + 1);

                for (var columnIndex = 0; columnIndex<numCols; columnIndex++) {
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

    /**
     * A getter for the ImportData object experiment identifier
     *
     * @returns {null|*} - the experiment identifier for the ImportData object, this
     *                  will be NO_ID if the experiment identifier has not been previously
     *                  set.
     */
    this.getExperimentID = function() {
        return this.experimentID;
    };

    /**
     * A setter for the ImportData object experiment identifier.
     *
     * @param experimentID - The experiment identifier to set for the ImportData object.
     *
     * Note: - Undefined, null, NaN or empty string arguments will cause an
     *      INVALID_EXPERIMENT_ID error.
     */
    this.setExperimentID = function(experimentID) {
        if (!experimentID && experimentID !== 0) {
            throw new ImportDataError(ImportDataError.INVALID_EXPERIMENT_ID,
                    experimentID,
                    "general",
                    "set an import data experiment ID");
        }

        this.experimentID = experimentID;
    };

    /**
     * A getter for the ImportData object parsing configuration identifier, that is the
     * identifier of the parsing configuration used to parse the assay results data.
     *
     * @returns {null|*} - the parsing configuration identifier for the ImportData object,
     * this will be NO_ID if the parsing configuration identifier has not been previously
     * set.
     */
    this.getParsingID = function() {
        return this.parsingID;
    };

    /**
     * A setter for the ImportData object parsing configuration identifier.
     *
     * @param parsingID - The experiment identifier to set for the ImportData object.
     *
     * Note: - undefined, null, NaN or empty string arguments will cause an
     *      INVALID_PARSING_ID error.
     */
    this.setParsingID = function(parsingID) {
        if (!parsingID && parsingID !== 0) {
            throw new ImportDataError(ImportDataError.INVALID_PARSING_ID,
                    parsingID,
                    "general",
                    "set an import data parsing ID");
        }

        this.parsingID = parsingID;
    };

    /**
     * This method adds an experiment level category to the ImportData object.
     *
     * @param categoryName - the string name of the new experiment level category
     *
     * Note: - An empty string will cause an ILLEGAL_ARGUMENT error.
     *       - If the given category name has already been added to the ImportData object,
     *       it will cause a CATEGORY_ALREADY_DEFINED error.
     */
    this.addExperimentLevelCategory = function(categoryName) {

        // first some error checking
        if (!categoryName) {
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                    categoryName,
                    "experiment level category name",
                    "add an experiment level category");
        }

        if (this.experimentLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.CATEGORY_ALREADY_DEFINED,
                    "categoryName",
                    "experiment",
                    "add an experiment level category");
        }

        this.experimentLevelCategories[categoryName] = true;
        this.experimentFeatures.labels[categoryName] = ImportData.BLANK;
    };

    /**
     * This function returns an array of all of the experiment level category names.
     *
     * @returns {Array} - an array of all the experiment level category names
     */
    this.getExperimentLevelCategories = function() {
        var result = [];

        for (var category in this.experimentLevelCategories) {
            if (this.experimentLevelCategories[category]) {
                result.push(category);
            }
        }

        return result;
    };

    /**
     * This method removes an experiment level category from the calling ImportData
     * object.
     *
     * @param categoryName - the string name of the category to be removed,
     *
     * Note: - If this category has not been previously added at the same level, then a
     *      NO_SUCH_CATEGORY error will be thrown.
     */
    this.removeExperimentLevelCategory = function(categoryName) {
        // first some error checking
        if (!this.experimentLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                    categoryName,
                    "experiment",
                    "remove experiment level category");
        }

        delete this.experimentFeatures.labels[categoryName];
        delete this.experimentLevelCategories[categoryName];
    };

    /**
     * This method returns the experiment level label for a given category.
     *
     * @param categoryName - the name of the category for the desired label value
     * @returns {*} - the label value for the given category
     *
     * Note: - that this method throws a NO_SUCH_CATEGORY error if the category given by
     *      the categoryName argument has not previously been added at the experiment
     *      level to the calling ImportData object.
     */
    this.getExperimentLevelLabels = function(categoryName) {
        var result;

        if (!this.experimentLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                    categoryName,
                    "experiment",
                    "get experiment level labels");
        }

        result = this.experimentFeatures.labels[categoryName];

        return result;
    };

    /**
     * This method sets a label value for a given experiment level label category.
     *
     * @param categoryName - the name of the experiment level category to set the label
     *                      for
     * @param value - the value to set the label to
     *
     * Note: - This method throws a NO_SUCH_CATEGORY error if the experiment level
     *      category given by the categoryName argument has not previously been added to
     *      the calling ImportData object at the experiment level
     *       - This method throws an ILLEGAL_ARGUMENT error if the given value is null,
     *       NaN, or undefined.
     *
     */
    this.setExperimentLevelLabel = function(categoryName, value) {

        // first some error checking
        if (!this.experimentLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                    categoryName,
                    "experiment",
                    "set an experiment level label value");
        }

        if (!value && value !== ImportData.BLANK && value !== 0) {
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                    value,
                    "experiment level label value",
                    "set an experiment level label value");
        }

        this.experimentFeatures.labels[categoryName] = value;
    };


    /**
     * This method adds a plate level category to the ImportData object.
     *
     * @param categoryName - the string name of the new plate level category,
     *
     * Note: - An empty string will cause an ILLEGAL_ARGUMENT error.
     *       - If this category name has already been added to the ImportData object, it
     *       will cause a CATEGORY_ALREADY_DEFINED error.
     */
    this.addPlateLevelCategory = function(categoryName, numeric) {
        // first some error checking
        if (!categoryName) {
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                    categoryName,
                    "plate level category name",
                    "add a plate level category");
        }

        if (this.plateLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.CATEGORY_ALREADY_DEFINED,
                    "categoryName",
                    "plate",
                    "add a plate level category");
        }

        if (numeric) {
            this.plateLevelCategories[categoryName] = ImportData.NUMERIC;
        }
        else {
            this.plateLevelCategories[categoryName] = ImportData.NON_NUMERIC;
        }

        for (var plateIndex = 0; plateIndex<this.plates.length; plateIndex++) {
            var plate = this.plates[plateIndex];
            plate.labels[categoryName] = ImportData.BLANK;
            if (numeric) {
                plate.rawData[categoryName] = ImportData.BLANK;
                plate.normalizedData[categoryName] = ImportData.BLANK;
            }
        }

    };

    /**
     * This function returns an array of all of the plate level category names.
     *
     * @returns {Array} - an array of all the plate level category names
     */
    this.getPlateLevelCategories = function() {
        var result = [];

        for (var category in this.plateLevelCategories) {
            if (this.plateLevelCategories[category]) {
                result.push(category);
            }
        }

        return result;
    };

    /**
     * This method removes a plate level category from the calling ImportData
     * object.
     *
     * @param categoryName - the string name of the category to be removed
     *
     * Note: - If this category has not been previously added at the same level, then a
     *      NO_SUCH_CATEGORY error will be thrown.
     */
    this.removePlateLevelCategory = function(categoryName) {
        // first some error checking
        if (!this.plateLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                    categoryName,
                    "plate",
                    "remove plate level category");
        }


        delete this.plateLevelCategories[categoryName];

        for (var plateIndex = 0; plateIndex<this.plates.length; plateIndex++) {
            var plate = this.plates[plateIndex];
            delete plate.labels[categoryName];
        }
    };

    /**
     * This method returns the plate level label value for a given category on a given
     * plate.
     *
     * @param plateIndex - the index number (starting at 0) of the plate that the label
     *                  value is to be gotten for
     * @param categoryName - the name of the category for the desired label value
     * @returns {*} - the label value for the given category and plate
     *
     * Note - This method throws a NO_SUCH_CATEGORY error if the category given by
     *      the categoryName argument has not previously been added at the plate level to
     *      the calling ImportData object.
     *      - This method throws a NO_SUCH_PLATE error if the calling ImportData object
     *      does not have a defined plate for the given plate index.
     */
    this.getPlateLevelLabelForSinglePlate = function(plateIndex, categoryName) {
        var result;

        if (!this.plates[plateIndex]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_PLATE,
                    plateIndex,
                    "plate",
                    "get a plate level label value for single plate");
        }

        if (!this.plateLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                    categoryName,
                    "plate",
                    "get plate level label value for single plate");
        }

        // prefer results to labels
        var plate = this.plates[plateIndex];
        [plate.rawData, plate.labels].every(function(labelBucket) {
            if (labelBucket && (categoryName in labelBucket)) {
                result = labelBucket[categoryName];
                return false;
            }
            return true;
        });

        return result;
    };

    /**
     * This method returns all of the plate level label values for a given category.
     *
     * @param categoryName - the name of the category for the desired label values of
     *                      every plate.
     * @returns {Array} - the label values for the given category for every plate in order
     *
     * Note: - This method throws a NO_SUCH_CATEGORY error if the category given by
     *      the categoryName argument has not previously been added at the plate level to
     *      the calling ImportData object.
     */
    this.getPlateLevelLabelforAllPlates = function(categoryName) {
        var result = [];

        if (!this.plateLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                    categoryName,
                    "plate",
                    "get plate level label value for all plates");
        }

        for (var plateIndex=0; plateIndex<this.plates.length; plateIndex++) {
            var plate = this.plates[plateIndex];
            result.push(plate.labels[categoryName]);
        }

        return result;
    };

    /**
     * This method sets a label value for a given plate level label category on a given
     * plate.
     *
     * @param plateIndex - the index (starting at 0) of the plate on which the label value
     *                  is to be set
     * @param categoryName - the name of the experiment level category to set the label
     *                      for
     * @param value - the value to set the label to
     *
     * Note: - This method throws a NO_SUCH_PLATE error if the calling ImportData object
     *      does not have a plate for the given plate index.
     *       - This method throws a NO_SUCH_CATEGORY error if the plate level
     *      category given by the categoryName argument has not previously been added to
     *      the calling ImportData object at the plate level
     *       - This method throws an ILLEGAL_ARGUMENT error if the given value is null,
     *       NaN or undefined.
     */
    this.setPlateLevelLabel = function(plateIndex, categoryName, value) {
        // first some error checking
        if (!this.plates[plateIndex]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_PLATE,
                    plateIndex,
                    "plate",
                    "set a plate level label value");
        }

        if (!this.plateLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                    categoryName,
                    "plate",
                    "set a plate level label value");
        }

        if (!value && value !== ImportData.BLANK && value !== 0) {
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                    value,
                    "plate level label value",
                    "set a plate level label value");
        }

        var plate = this.plates[plateIndex];
        plate.labels[categoryName] = value;
        if (this.plateLevelCategories[categoryName] === ImportData.NUMERIC) {
            plate.rawData[categoryName] = parseFloat(value);
        }
    };



    /**
     * This method adds a well level category to the ImportData object.
     *
     * @param categoryName - the string name of the new well level category,
     *
     * Note: - An empty string will cause an ILLEGAL_ARGUMENT error.
     *       - If this category name has already been added to the ImportData object, it
     *       will cause a CATEGORY_ALREADY_DEFINED error.
     */
    this.addWellLevelCategory = function(categoryName, numeric) {
        // first some error checking
        if (!categoryName) {
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                    categoryName,
                    "well level category name",
                    "add a well level category");
        }

        if (this.wellLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.CATEGORY_ALREADY_DEFINED,
                    "categoryName",
                    "well",
                    "add a plate level category");
        }

        if (numeric) {
            this.wellLevelCategories[categoryName] = ImportData.NUMERIC;
        } else {
            this.wellLevelCategories[categoryName] = ImportData.NON_NUMERIC;
        }


        for (var plateIndex = 0; plateIndex<this.plates.length; plateIndex++) {
            var plate = this.plates[plateIndex];

            for (var rowIndex = 0; rowIndex<plate.rows.length; rowIndex++) {
                var row = plate.rows[rowIndex];

                for (var columnIndex = 0; columnIndex<row.columns.length; columnIndex++) {
                    var well = row.columns[columnIndex];

                    well.labels[categoryName] = ImportData.BLANK;

                    if (numeric) {
                        well.rawData[categoryName] = ImportData.BLANK;
                        well.normalizedData[categoryName] = ImportData.BLANK;
                    }
                }
            }
        }
    };

    /**
     * This function returns an array of all of the well level category names.
     *
     * @returns {Array} - an array of all the well level category names
     */
    this.getWellLevelCategories = function() {
        var result = [];

        for (var category in this.wellLevelCategories) {
            if (this.wellLevelCategories[category]) {
                result.push(category);
            }
        }

        return result;
    };

    /**
     * This method removes a well level category from the calling ImportData
     * object.
     *
     * @param categoryName - the string name of the category to be removed
     *
     * Note: - If this category has not been previously added at the same level, then a
     *      NO_SUCH_CATEGORY error will be thrown.
     */
    this.removeWellLevelCategory = function(categoryName) {
        // first some error checking
        if (!this.wellLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                    categoryName,
                    "well",
                    "remove well level category");
        }


        delete this.wellLevelCategories[categoryName];

        for (var plateIndex = 0; plateIndex<this.plates.length; plateIndex++) {
            var plate = this.plates[plateIndex];

            for (var rowIndex = 0; rowIndex<plate.rows.length; rowIndex++) {
                var row = plate.rows[rowIndex];

                for (var columnIndex = 0; columnIndex<row.columns.length; columnIndex++) {
                    var well = row.columns[columnIndex];

                    delete well.labels[categoryName];
                }
            }
        }
    };


    /**
     * This method returns the well level label value for a given category on a given
     * plate at a given plate row and column.
     *
     * @param plateIndex - the index number (starting at 0) of the plate that the label
     *                  value is to be gotten for
     * @param rowIndex - the row index (starting at 0) of the well that thw label value is
     *                  to be gotten for
     * @param columnIndex - the column index (starting at 0) of the well that thw label
     *                  value is to be gotten for
     * @param categoryName - the name of the category for the desired label value
     * @returns {*} - the label value for the given category, plate, and well
     *
     * Note: - This method throws a NO_SUCH_PLATE error if the calling ImportData object
     *      does not have a defined plate for the given plate index.
     *       - This method throws a NO_SUCH_ROW error if the calling ImportData object
     *      does not have a defined row for the given row index.
     *       - This method throws a NO_SUCH_COLUMN error if the calling ImportData object
     *      does not have a defined column for the given plate index.
     *       - This method throws a NO_SUCH_CATEGORY error if the category given by
     *      the categoryName argument has not previously been added at the plate level to
     *      the calling ImportData object.
     */
    this.getWellLevelLabelForSinglePlate = function(plateIndex,
            rowIndex,
            columnIndex,
            categoryName) {
        var result;

        if (!this.plates[plateIndex]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_PLATE,
                    plateIndex,
                    "well",
                    "get a well level label value for single plate");
        }

        if (!this.plates[plateIndex].rows[rowIndex]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_ROW,
                    rowIndex,
                    "well",
                    "get a well level label value for single plate");
        }

        if (!this.plates[plateIndex].rows[rowIndex].columns[columnIndex]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_COLUMN,
                    columnIndex,
                    "well",
                    "get a well level label value for single plate");
        }

        if (!this.wellLevelCategories[categoryName]) {
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

    /**
     * This method returns the labels for a given category for all wells on all plates in
     * an ImportData object for a given well level category.
     *
     * @param categoryName - the name of the well level category that the label values are
     *                      to be gotten for.
     * @returns {Array} - an array of objects in which each object contains the well level
     *                  label values for each well on a plate in the calling ImportData
     *                  object. These objects are keyed on the well label, e.g. "B13", and
     *                  the value is the label value for that well. The plate objects are
     *                  placed in the returned array in the same order as they are in the
     *                  calling ImportData object.
     * Note: - This method throws a NO_SUCH_CATEGORY error if the given category name has
     *      not been added to the calling ImportData object previously.
     */
    this.getWellLevelLabelforAllPlates = function(categoryName) {
        var result = [];

        if (!this.plateLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                    categoryName,
                    "plate",
                    "get plate level label value for all plates");
        }

        for (var plateIndex = 0; plateIndex<this.plates.length; plateIndex++) {
            var plate = this.plates[plateIndex];
            result.push({});

            for (var rowIndex = 0; rowIndex<plate.rows.length; rowIndex++) {
                var row = plate.rows[rowIndex];

                for (var columnIndex = 0; columnIndex<row.columns.length; columnIndex++) {
                    var well = row.columns[columnIndex];

                    result[plateIndex][well.wellID] = well.labels[categoryName];
                }
            }
        }

        return result;
    };

    /**
     * This method sets a label value for a given well level label category on a given
     * plate and well.
     *
     * @param plateIndex - the index (starting at 0) of the plate on which the label value
     *                  is to be set
     * @param rowIndex - the row index (starting at 0) of the well on which the label
     *                  value is to be set
     * @param columnIndex - the column index (starting at 0) of the well on which the
     *                  label value is to be set
     * @param categoryName - the name of the experiment level category to set the label
     *                      for
     * @param value - the value to set the label to
     *
     * Note: - This method throws a NO_SUCH_PLATE error if the calling ImportData object
     *      does not have a plate for the given plate index.
     *       - This method throws a NO_SUCH_ROW error if the calling ImportData object
     *      does not have a row for the given row index.
     *       - This method throws a NO_SUCH_COLUMN error if the calling ImportData object
     *      does not have a column for the given column index.
     *       - This method throws a NO_SUCH_CATEGORY error if the well level
     *      category given by the categoryName argument has not previously been added to
     *      the calling ImportData object at the well level
     *       - This method throws an ILLEGAL_ARGUMENT error if the given value is null,
     *       NaN or undefined.
     */
    this.setWellLevelLabel = function(plateIndex,
            rowIndex,
            columnIndex,
            categoryName,
            value) {
        // first some error checking
        if (!this.plates[plateIndex]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_PLATE,
                    plateIndex,
                    "well",
                    "set a well level label value");
        }

        if (!this.plates[plateIndex].rows[rowIndex]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_ROW,
                    rowIndex,
                    "well",
                    "set a well level label value");
        }

        if (!this.plates[plateIndex].rows[rowIndex].columns[columnIndex]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_COLUMN,
                    columnIndex,
                    "well",
                    "set a well level label value");
        }

        if (!this.wellLevelCategories[categoryName]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_CATEGORY,
                    categoryName,
                    "well",
                    "set a well level label value");
        }

        if (!value && value !== ImportData.BLANK && value !== 0) {
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                    value,
                    "plate level label value",
                    "set a plate level label value");
        }

        var plate = this.plates[plateIndex];
        var row = plate.rows[rowIndex];
        var well = row.columns[columnIndex];
        well.labels[categoryName] = value;

        if ((!value && value !== ImportData.BLANK && value !== 0) 
                && (this.wellLevelCategories[categoryName] == ImportData.NUMERIC)) {
            well.rawData[categoryName] = parseFloat(value);
        }
    };

    /**
     * This method is a getter for a plate identifier.
     * @param plateIndex - the index of the plate for which the identifier is desired
     * @returns {*} - the identifier of the specified plate, this will be NO_ID, if no
     *              plate identifier has been previously specified.
     *
     * Note: - This method throws a NO_SUCH_PLATE error if the calling ImportData object
     *      has not plate for the give plate index.
     */
    this.getPlateIdentifier = function(plateIndex) {
        if (!this.plates[plateIndex]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_PLATE,
                    plateIndex,
                    "plate",
                    "get a plate identifier");
        }

        if (this.plates && this.plates[plateIndex] && this.plates[plateIndex].plateID) {
            return this.plates[plateIndex].plateID;
        } else {
            return null;
        }
    };

    /**
     * This method is a getter for all of the plate identifiers of the calling ImportData
     * object.
     * @returns {Array} - an array of all of the specified plate identifiers, in the same
     *                  order as they are listed in the calling ImportData object.
     */
    this.getPlateIdentifierArray = function() {
        var result = [];

        for (var plateIndex = 0; plateIndex < this.plates.length; plateIndex++) {
            result.push(this.plates[plateIndex].plateID);
        }

        return result;
    };

    /**
     * This method sets the plate identifier of a specific plate in the calling ImportData
     * object.
     * @param plateIndex - the index of the plate for which the plate identifier is to be
     *                  set
     * @param identifier - the identifier that the specified plate is to have its plate
     *                  identifier set to
     *
     * Note: - This method throws an ILLEGAL_ARGUMENT error if the given identifier is
     *      undefined, null, NaN, or the empty string.
     *       - This method throws a NO_SUCH_PLATE error if the calling ImportData object
     *      has no plate for the give plate index.
     *       - This method throws a REPEATED_PLATE_ID error if another plate in the
     *      calling ImportData object already has the same identifier.
     */
    this.setPlateIdentifier = function(plateIndex, identifier) {
        if (!identifier && identifier !== 0) {
            throw new ImportDataError(ImportDataError.ILLEGAL_ARGUMENT,
                    identifier,
                    "plate identifier",
                    "set a plate identifier");
        }

        if (!this.plates[plateIndex]) {
            throw new ImportDataError(ImportDataError.NO_SUCH_PLATE,
                    plateIndex,
                    "plate",
                    "set a plate identifier");
        }

        // check if plate identifier is unique
        if (identifier !== ImportData.NO_ID) {
            for (var i=0; i<this.numPlates(); i++) {
                if (i !== plateIndex
                        && identifier.trim() === this.plates[i].plateID.trim()) {
                    throw new ImportDataError(ImportDataError.REPEATED_PLATE_ID,
                            identifier,
                            "plate",
                            "set a plate identifier");
                }
            }
        }

        this.plates[plateIndex].plateID = identifier;
    };

    /**
     * This method sets the plate identifiers of an import data object with the values
     * given in an array.
     * @param identifierArray - an array of plate identifiers to use for setting the
     *                      plate identifiers of the calling ImportData object.
     *
     * Note: - This method throws an ILLEGAL_ARGUMENT error if any of the given
     *      identifiers is undefined, null, NaN, or the empty string.
     *       - This method throws a NO_SUCH_PLATE error if the calling ImportData object
     *      has less plates than the length of the given identifiers array.
     *       - This method throws a REPEATED_PLATE_ID error if another plate in the
     *      calling ImportData object already has the same identifier.
     */
    this.setPlateIdentifiersWithArray = function(identifierArray) {
        for (var i=0; i<identifierArray.length; i++) {
            _self.setPlateIdentifier(i, identifierArray[i]);
        }
    };

    /**
     * This method examines the calling ImportData object to see if all of its plate
     * identifiers are set, and if not it throws a PLATE_ID_NOT_SET error.
     */
    this.throwErrorIfAnyPlateIDsNotSet = function() {
        var unsetPlateIndices = [];
        var descriptor = "";

        for (var i=0; i<this.plates.length; i++) {
            if (this.plates[i].plateID === ImportData.NO_ID) {
                unsetPlateIndices.push(i);
            }
        }

        if (unsetPlateIndices.length === 1) {
            descriptor = unsetPlateIndices[0];
        } else if (unsetPlateIndices.length > 1) {
            for (var j=0; j<unsetPlateIndices.length; j++) {
                if (j < unsetPlateIndices.length - 1) {
                    descriptor += (unsetPlateIndices[j] + 1) + ", ";
                } else {
                    descriptor += "and " + (unsetPlateIndices[j] + 1);
                }
            }
        }

        if (unsetPlateIndices.length > 0) {
            throw new ImportDataError(ImportDataError.PLATE_ID_NOT_SET,
                    descriptor,
                    "plate",
                    "check plate identifiers as set");
        }
    };

    /**
     * This method returns the number of plates in the calling ImportData object.
     * @returns {number} - the number of plates in the calling ImportData object
     */
    this.numPlates = function() {
        if (this.plates && this.plates.length) {
            return this.plates.length;
        } else {
            return 0;
        }
    };

    /**
     * This method returns the number of plate rows in the calling ImportData object.
     * @returns {number} - the number of plate rows in the calling ImportData object
     */
    this.numberOfPlateRows = function() {
        if (this.numRows) {
            return this.numRows;
        } else {
            return 0;
        }
    };

    /**
     * This method returns the number of plate columns in the calling ImportData object.
     * @returns {number} - the number of plate columns in the calling ImportData object
     */
    this.numberOfPlateColumns = function() {
        if (this.numCols) {
            return this.numCols;
        } else {
            return 0;
        }
    };

    /**
     * This method returns a DTO of the calling ImportData object, for storing on the
     * server.
     * @returns {object} - a DTO of the calling ImportData object, for storing on the
     *                  server
     */
    this.getJSONImportDataObject = function() {
        var object = {};

        object.experimentID = this.experimentID;
        object.parsingID = this.parsingID;
        object.experimentFeatures = this.experimentFeatures;
        object.plates = this.plates;

        return object;
    }
}

/**
 * This "static" method creates an returns a full ImportData object from a DTO of an
 * ImportData object retrieved from the server.
 * @param JSONObject - the DTO of an ImportData object retrieved from the server
 * @returns {ImportData} - a fully functional ImportData object with all of the
 *                      information from the given DTO
 * Note: - That many different ImportDataObject errors could be thrown if the JSONObject
 *      is malformed.
 *
 */
ImportData.createImportDataObjectFromJSON = function(JSONObject) {
    var result;

    if (!JSONObject) {
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

    result = new ImportData(numberOfPlates,
                            plateDimensions[0],
                            plateDimensions[1]);

    // load the result ImportData object up with data from the JSON object
    // starting with the experiment and parsing IDs

    result.setExperimentID(JSONObject.experimentID);
    result.setParsingID(JSONObject.parsingID);

    // now add the label categories for each level
    for (categoryName in wellLevelCategories) {
        var numeric = wellLevelCategories[categoryName];
        result.addWellLevelCategory(categoryName, numeric);
    }

    for (categoryName in plateLevelCategories) {
        var numeric = plateLevelCategories[categoryName];
        result.addPlateLevelCategory(categoryName, numeric);
    }

    for (var k=0; k<experimentLevelCategories.length; k++) {
        categoryName = experimentLevelCategories[k];
        result.addExperimentLevelCategory(categoryName);
        result.setExperimentLevelLabel(categoryName,
                JSONObject.experimentFeatures.labels[categoryName]);
    }

    // now add the labels for each level and category
    if (numberOfPlates) {
        for (var plateIndex = 0; plateIndex < numberOfPlates; plateIndex++) {
            var plate = JSONObject.plates[plateIndex];

            // set the plate identifier
            result.setPlateIdentifier(plateIndex, plate.plateID);

            for (var categoryName in plateLevelCategories) {
                // prefer results to labels
                var value = ImportData.BLANK;
                [plate.rawData, plate.labels].every(function(labelBucket) {
                    if (labelBucket && (categoryName in labelBucket)) {
                        value = labelBucket[categoryName];
                        return false;
                    }
                    return true;
                });
                result.setPlateLevelLabel(plateIndex,
                                          categoryName,
                                          value);
            }

            if (plateDimensions[0] && plateDimensions[1]) {
                for(var rowIndex = 0; rowIndex < plate.rows.length ; rowIndex++) {
                    var row = plate.rows[rowIndex];

                    for (var columnIndex=0; columnIndex<row.columns.length;columnIndex++) {
                        var well = row.columns[columnIndex];

                        for (var categoryName in wellLevelCategories) {
                            // prefer results to labels
                            var value = ImportData.BLANK;
                            if (categoryName in well.rawData) {
                                value = well.rawData[categoryName];
                            }
                            else if (categoryName in well.labels) {
                                value = well.labels[categoryName];
                            }

                            if (value !== ImportData.BLANK) {
                                result.setWellLevelLabel(plateIndex,
                                        rowIndex,
                                        columnIndex,
                                        categoryName,
                                        value);
                            }
                        }
                    }
                }
            }
        }
    }

    return result;


    function findExperimentLevelCategories(dataObject) {
        var result = [];

        if (dataObject
                && dataObject.experimentFeatures
                && dataObject.experimentFeatures.labels) {

            for (var category in dataObject.experimentFeatures.labels) {
                result.push(category);
            }
        }

        return result;
    }

    function findPlateLevelCategories(dataObject) {
        var result = [];
        var seenCategories = {};

        if (dataObject && dataObject.plates && dataObject.plates.length) {
            for (var plateIndex = 0; plateIndex<dataObject.plates.length; plateIndex++) {
                var plate = dataObject.plates[plateIndex];

                if (plate.labels) {
                    for (var category in plate.labels) {
                        if (!seenCategories[category]) {
                            seenCategories[category] = true;
                            result[category] = false;
                        }
                    }
                }

                if (plate.rawData) {
                    for (var category in plate.rawData) {
                        if (!seenCategories[category]) {
                            seenCategories[category] = true;
                            result[category] = true;
                        }
                    }
                }
            }
        }

        return result;
    }

    function findWellLevelCategories(dataObject) {
        var result = {};

        if (dataObject && dataObject.plates && dataObject.plates.length) {
            for (var plateIndex = 0; plateIndex < dataObject.plates.length; plateIndex++) {
                var plate = dataObject.plates[plateIndex];

                if (plate.rows && plate.rows.length) {
                    for (var rowIndex = 0; rowIndex < plate.rows.length ; rowIndex++) {
                        var row = plate.rows[rowIndex];

                        for (var columnIndex=0;
                                columnIndex<row.columns.length;
                                columnIndex++) {
                            var well = row.columns[columnIndex];

                            if (well.labels) {
                                for (var category in well.labels) {
                                    if (!result[category]) {
                                        result[category] = true;
                                    }

                                    if (well.rawData
                                            && !well.rawData[category]
                                            && well.rawData[category] !== ImportData.BLANK
                                            && well.rawData[category] !== 0) {
                                        result[category] = false;
                                    }
                                }
                            }

                            if (well.rawData) {
                                for (var category in well.rawData) {
                                    if (!result[category]) {
                                        result[category] = true;
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

    function findNumberOfPlateRowsAndColumns(dataObject) {
        var result = [0,0];

        if (dataObject && dataObject.plates && dataObject.plates.length) {
            for (var plateIndex = 0; plateIndex < dataObject.plates.length; plateIndex++) {
                var plate = dataObject.plates[plateIndex];
                var numRowsOnPlate = 0;

                if (plate.rows && plate.rows.length) {
                    for(var rowIndex = 0; rowIndex < plate.rows.length ; rowIndex++) {
                        var row = plate.rows[rowIndex];

                        numRowsOnPlate++;

                        if (row.columns && row.columns.length && row.columns.length > result[1]) {
                            result[1] = row.columns.length;
                        }
                    }

                    if (numRowsOnPlate > result[0]) {
                        result[0] = numRowsOnPlate;
                    }
                }
            }
        }

        return result;
    }

    function findNumberOfPlates(dataObject) {
        result = 0;

        if (dataObject && dataObject.plates && dataObject.plates.length) {
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
ImportDataError.REPEATED_PLATE_ID = "repeated plate ID";
ImportDataError.INVALID_EXPERIMENT_ID = "invalid experiment ID";
ImportDataError.INVALID_PARSING_ID = "invalid parsing ID";
ImportDataError.PLATE_ID_NOT_SET = "plate ID not set";

/**
 * ImportDataError objects store an represent the conditions under which an exceptional
 * event occurred in the manipulation of ImportData objects.
 * @param type - a constant that represents the reason that an ImportDataError occurred
 * @param descriptor - a description of the error situation
 * @param level - a description of the level (well, plate, or experiment) that the
 *              ImportDataError occurred under
 * @param attemptedAction - a string description of the action that was being attempted
 *                      when the ImportDataError occured.
 * @constructor
 */
function ImportDataError(type, descriptor, level, attemptedAction) {
    this.type = type;
    this.descriptor = descriptor;
    this.level = level;
    this.attemptedAction = attemptedAction;

    this.getMessage = function() {
        if (this.type == ImportDataError.NO_SUCH_CATEGORY) {
            return "The category, " + this.descriptor + ", has not been defined at the "
                + this.level + " level.";
        } else if (this.type === ImportDataError.CATEGORY_ALREADY_DEFINED) {
            return "The category, " + this.descriptor + ", has already been defined at " +
                "the " + this.level + " level.";
        } else if (this.type === ImportDataError.NO_SUCH_PLATE) {
            return "The plate of index, " + this.descriptor + ", has not been defined.";
        } else if (this.type === ImportDataError.NO_SUCH_ROW) {
            return "The plate row of index, " + this.descriptor + ", has not been " +
                "defined.";
        } else if (this.type === ImportDataError.NO_SUCH_COLUMN) {
            return "The plate column of index, " + this.descriptor + ", has not been " +
                "defined.";
        } else if (this.type === ImportDataError.NEGATIVE_NUMBER_OF_PLATES) {
            return "The number of plates must be non-negative, i.e. greater than or " +
                "equal to 0";
        } else if (this.type === ImportDataError.NEGATIVE_NUMBER_OF_COLUMNS) {
            return "The number of columns must be non-negative, i.e. greater than or " +
                "equal to 0";
        } else if (this.type === ImportDataError.NEGATIVE_NUMBER_OF_ROWS) {
            return "The number of rows must be non-negative, i.e. greater than or " +
                "equal to 0";
        } else if (this.type === ImportDataError.ILLEGAL_ARGUMENT) {
            return "The value, " + this.descriptor + " is not a valid " + this.level
                + ".";
        } else if (this.type === ImportDataError.REPEATED_PLATE_ID) {
            return "The plate identifier, " + this.descriptor + " cannot be repeated."+
                " Plate identifiers must be unique.";
        } else if (this.type === ImportDataError.INVALID_EXPERIMENT_ID) {
            return "A valid experiment plate set must be selected to associate with " +
                "the results in the output file.";
        } else if (this.type === ImportDataError.INVALID_PARSING_ID) {
            return "The given parsing ID, \"" + this.descriptor +"\", is not valid.";
        } else if (this.type === ImportDataError.PLATE_ID_NOT_SET) {
            return "All plate identifiers must be set. The plate(s) " + this.descriptor +
                " is(are) not set.";
        }
    }
}
