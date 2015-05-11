/**
 * ImportDataFileGenerator.js
 *
 * ImportDataFileGenerator objects examine and extract the necessary information from
 * ImportData objects in order to display this information in two separate formats.
 *
 * The first format shows the data in a grid with one row per well and a separate column
 * for each data category. This format has two leading columns that show the plate and
 * well identifiers. The subsequent columns display the values for that well, for each
 * data category. Note that this format separates values given at the well level from
 * those given at the plate or experiment level with
 * NUM_BLANK_COLUMNS_BETWEEN_WELL_AND_PLATE_LEVEL_DATA blank columns.
 *
 * The second format shows the same data in a given ImportData object in grid format but
 * with 4 columns. Each row in this format represents a single data value for a given
 * category and well. The first two columns display the row and column number of the
 * well for which the value is given. The third column displays the value and the fourth
 * column displays the category name of the value. In this format, a blank row is placed
 * between rows displaying values for one plate and another.
 *
 *
 *
 * @author Team SurNorte
 * CSCI-E99
 * May 7, 2015
 * @constructor
 */


function ImportDataFileGenerator(){
    var NUM_BLANK_COLUMNS_BETWEEN_WELL_AND_PLATE_LEVEL_DATA = 2;
    var PLATE_COLUMN_HEADER = "Plate/Barcode";
    var PLATE_IMPORTED_TIMESTAMP_HEADER = "Results Imported";
    var WELL_COLUMN_HEADER = "Well";
    var BLANK_CELL = "";
    var NO_PLATE_ID = ImportData.NO_ID;

    this.matrix = null;


    /**
     * This private method generates the header row in the matrix field for the first
     * file format, not the inter-group format.
     * @param importData - the import data object that the file is being generated for
     * @returns {Array} - an array of the cell contents for the first row of the file
     */
    function createMatrixHeaderRow(importData){
        var result = [];
        var headerIndex = 0;
        var wellCategories = importData.getWellLevelCategories();
        var plateCategories = importData.getPlateLevelCategories();
        var experimentCategories = importData.getExperimentLevelCategories();

        result[headerIndex++] = PLATE_COLUMN_HEADER;
        result[headerIndex++] = PLATE_IMPORTED_TIMESTAMP_HEADER;
        result[headerIndex++] = WELL_COLUMN_HEADER;

        for (var i = 0; i<wellCategories.length; i++){
            result[headerIndex++] = wellCategories[i];
        }

        for (var m = 0; m<NUM_BLANK_COLUMNS_BETWEEN_WELL_AND_PLATE_LEVEL_DATA; m++){
            result[headerIndex++] = BLANK_CELL;
        }

        for (var j=0; j<plateCategories.length; j++){
            result[headerIndex++] = plateCategories[j];
        }

        for (var k=0; k<experimentCategories.length; k++){
            result[headerIndex++] = experimentCategories[k];
        }

        return result;
    }


    /**
     * This private method generates a single data row in the first file format, not the
     * inter-group format. This single row represents all of the label information for
     * a well
     * @param importData - the importData object for which the file is being generated
     * @param plateIndex - the plate index for the plate on which the well is located
     * @param row - the row index for the row in which the well is located
     * @param col - the column index fot the column in which the well is located
     * @returns {Array} - an array of the cell contents for the data row representing a
     *                  well in the first supported file format
     */
    function createMatrixDataRow(importData, plateIndex, row, col){
        var result = [];
        var matrixColumnIndex = 0;


        var wellLevelCategories = importData.getWellLevelCategories();
        var plateLevelCategories = importData.getPlateLevelCategories();
        var experimentLevelCategories = importData.getExperimentLevelCategories();
        var value;

        var plateID = importData.getPlateIdentifier(plateIndex);
        var plateResultCreated = importData.getPlateResultCreated(plateIndex);

        if (!plateID || plateID === NO_PLATE_ID){
            plateID = "plate " + (plateIndex + 1);
        }

        result[matrixColumnIndex++] = plateID;
        result[matrixColumnIndex++] = plateResultCreated;
        result[matrixColumnIndex++] = Grid.getRowLabel(row + 1) + (col+1);

        // fill in the well level labels
        for(var p = 0; p < wellLevelCategories.length; p++){
            value = importData.getWellLevelLabelForSinglePlate(plateIndex,
                                                               row,
                                                               col,
                                                               wellLevelCategories[p]);
            if (!value && value !== 0){
                value = BLANK_CELL;
            }

            result[matrixColumnIndex++] = value;
        }

        // blank spaces
        if (plateLevelCategories.length + experimentLevelCategories.length > 0){
            for (var m = 0; m<NUM_BLANK_COLUMNS_BETWEEN_WELL_AND_PLATE_LEVEL_DATA; m++){
                result[matrixColumnIndex++] = BLANK_CELL;
            }
        }

        // fill in the plate level labels
        for(var l = 0; l < plateLevelCategories.length; l++){
            value = importData.getPlateLevelLabelForSinglePlate(plateIndex,
                                                                plateLevelCategories[l]);
            if (!value && value !== 0){
                value = BLANK_CELL;
            }

            result[matrixColumnIndex++] = value;
        }

        // fill in the experiment level labels
        for(var q = 0; q < experimentLevelCategories.length; q++){
            value = importData.getExperimentLevelLabels(experimentLevelCategories[q]);

            if (!value && value !== 0){
                value = BLANK_CELL;
            }

            result[matrixColumnIndex++] = value;
        }

        return result;
    }

    /**
     * This method sets the ImportDataFileGenerator to a specific ImportData object for
     * the first file format, not the inter-group format.
     * @param importData - the importData object for which the file is being generated
     */
    this.createImportDataMatrix = function(importData){
        var result = [];
        var plate;
        var row;
        var rowLabel;
        var well;
        var plateID;
        var wellID;
        var wellLabels;
        var plateLabels;
        var experimentLabels;
        var matrixRowIndex;

        // get label categories at all levels
        var wellLevelCategories = importData.getWellLevelCategories();
        var plateLevelCategories = importData.getPlateLevelCategories();
        var experimentLevelCategories = importData.getExperimentLevelCategories();

        if (!wellLevelCategories.length){
            // the file will be empty
            return [];
        }

        if (experimentLevelCategories.length){
            experimentLabels = importData.experimentFeatures.labels;
        }

        // create the header row
        result[0] = createMatrixHeaderRow(importData);

        // create the data rows
        matrixRowIndex = 1;
        for(var plateIndex = 0; plateIndex < importData.numPlates(); plateIndex++){

            for (var rowIndex = 0; rowIndex < importData.numberOfPlateRows(); rowIndex++){

                for (var columnIndex = 0;
                     columnIndex < importData.numberOfPlateColumns();
                     columnIndex++){

                    result[matrixRowIndex++] = createMatrixDataRow(importData,
                                                                   plateIndex,
                                                                   rowIndex,
                                                                   columnIndex);
                }
            }

        }

        this.matrix = result;
    };

    /**
     * This method creates several rows in the second file format (inter-group) in 2D
     * array matrix form. These rows represent the labels applied to a single well in
     * the importData object, one row per label.
     * @param wellRow - the index (starting at 0) of the row of the well to which the
     *              labels pertain
     * @param wellCol - the index (starting at 0) of the column of the well to which the
     *              labels pertain
     * @param plateIndex - the index (starting at 0) of the plate of the well to which
     *              the labels pertain
     * @param importData  - the importData object for which the file is being generated
     * @param matrix - the matrix of data to which the rows are being appended
     */
    this.addWellDataToMatrix = function(wellRow, wellCol, plateIndex, importData, matrix){
        var wellLevelCategories = importData.getWellLevelCategories();
        var plateLevelCategories = importData.getPlateLevelCategories();
        var experimentLevelCategories = importData.getExperimentLevelCategories();

        var matrixRowIndex = matrix.length;
        var currentCategory;
        var currentMatrixRow;

        for (var i=0; i<wellLevelCategories.length; i++){
            currentCategory = wellLevelCategories[i];
            currentMatrixRow = [];

            currentMatrixRow[0] = wellRow;
            currentMatrixRow[1] = wellCol;
            currentMatrixRow[2] = currentCategory;
            currentMatrixRow[3] = importData.getWellLevelLabelForSinglePlate(plateIndex,
                wellRow,
                wellCol,
                currentCategory);
            matrix[matrixRowIndex++] = currentMatrixRow;
        }

        for (var j=0; j<plateLevelCategories.length; j++){
            currentCategory = plateLevelCategories[j];
            currentMatrixRow = [];

            currentMatrixRow[0] = wellRow;
            currentMatrixRow[1] = wellCol;
            currentMatrixRow[2] = currentCategory;
            currentMatrixRow[3] = importData.getPlateLevelLabelForSinglePlate(plateIndex,
                currentCategory);
            matrix[matrixRowIndex++] = currentMatrixRow;
        }

        for (var k=0; k<experimentLevelCategories.length; k++){
            currentCategory = experimentLevelCategories[k];
            currentMatrixRow = [];

            currentMatrixRow[0] = wellRow;
            currentMatrixRow[1] = wellCol;
            currentMatrixRow[2] = currentCategory;
            currentMatrixRow[3] = importData.getExperimentLevelLabels(currentCategory);
            matrix[matrixRowIndex++] = currentMatrixRow;
        }
    };


    /**
     * This method sets the ImportDataFileGenerator to a specific ImportData object for
     * the second file format (the inter-group format).
     * @param importData - the importData object for which the file is being generated
     */
    this.createIntergroupInterchangeFormatMatrix = function(importData){
        var result = [];
        var numPlates = importData.numPlates();
        var numPlateRows = importData.numberOfPlateRows();
        var numPlateCols = importData.numberOfPlateColumns();

        for (var plateIndex=0; plateIndex<numPlates; plateIndex++){

            for (var row=0; row<numPlateRows; row++){

                for (var col=0; col<numPlateCols; col++){
                    this.addWellDataToMatrix(row, col, plateIndex, importData, result);
                }

            }

            // blank line after each plate
            result[result.length] = ["", "", "", ""];

        }

        this.matrix = result;
    };


    /**
     * This method coverts the ImportData data stored in the calling instance of the
     * ImportDataFileGenerator object type, to a single Delimiter Separated Value (DSV)
     * string.
     * @param cellTerminator - the string that terminates each cell in the DSV string
     *              except for the final one in a row.
     * @param lineTerminator - the string that terminates a row in the DSV string
     * @returns {string} - the string representing the
     */
    this.createDSVString = function(cellTerminator, lineTerminator){
        var lines = [];
        var result;

        var numRows;

        if (this.matrix && this.matrix.length){
            numRows = this.matrix.length
        } else {
            // return empty DSV string if there are no rows in the matrix
            numRows = 0;
            return "";
        }

        // count max number of columns
        var numColumns = 0;

        for (var i=0; i<this.matrix.length; i++){
            if (this.matrix[i].length > numColumns){
                numColumns = this.matrix[i].length;
            }
        }

        if (!numColumns){
            // return empty DSV string if there are no columns in the matrix
            return "";
        }

        // create the lines
        for (var row = 0; row<numRows; row++){
            if (this.matrix[row].length !== numColumns){
                while(this.matrix[row.length] < numColumns){
                    this.matrix[row].push(BLANK_CELL);
                }
            }

            lines[row] = this.matrix[row].join(cellTerminator);
        }

        result = lines.join(lineTerminator);

        return result;
    };

    /**
     * This method forces a Tab Separated Value(TSV) download of the currently loaded
     * file in the ImportDataFileGenerator.
     * @param filename - the name to give the file that is downloaded to the client
     */
    this.forceTSVDownload = function(filename){
        var TSVString = this.createDSVString("\t", "\n");

        ImportDataFileGenerator.forceFileDownload(filename, TSVString);
    };

    /**
     * This method forces a Comma Separated Value(CSV) download of the currently loaded
     * file in the ImportDataFileGenerator.
     * @param filename - the name to give the file that is downloaded to the client
     */
    this.forceCSVDownload = function(filename){
        var CSVString = this.createDSVString(" , ", "\n");

        ImportDataFileGenerator.forceFileDownload(filename, CSVString);
    };
}

/**
 * This function is based on a suggestion from stackoverflow thread:
 *
 * http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
 *
 * for forcing the download of a browser generated file to the client machine.
 */
ImportDataFileGenerator.forceFileDownload = function(fileName, fileContents){
    var downloadLinkElement = document.createElement("a");

    downloadLinkElement.href = window.URL.createObjectURL(new Blob([fileContents],
        {type: 'text/plain'}));
    downloadLinkElement.download = fileName;

    // Append anchor to body.
    document.body.appendChild(downloadLinkElement);
    downloadLinkElement.click();

    // Remove anchor from body
    document.body.removeChild(downloadLinkElement);
};
