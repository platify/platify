/**
 * Created by zacharymartin on 4/16/15.
 */


function ImportDataFileGenerator(importDataObject){
    var NUM_BLANK_COLUMNS_BETWEEN_WELL_AND_PLATE_LEVEL_DATA = 2;
    var PLATE_COLUMN_HEADER = "Plate/Barcode";
    var WELL_COLUMN_HEADER = "Well";
    var BLANK_CELL = "";
    var NO_PLATE_ID = "none";

    var matrix = createImportDataMatrix(importData);

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
        var result = [];
        var seenCategories = {};

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
                                    if (!seenCategories[category]){
                                        seenCategories[category] = true;
                                        result.push(category);
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

    function createMatrixHeaderRow(wellCategories, plateCategories, experimentCategories){
        var result = [];
        var headerIndex = 0;

        result[headerIndex++] = PLATE_COLUMN_HEADER;
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


    function createMatrixDataRow(plateID, wellID, wellLabels, plateLabels,
                                 experimentLabels, wellCategories, plateCategories,
                                 experimentCategories){
        var result = [];
        var matrixColumnIndex = 0;

        result[matrixColumnIndex++] = plateID;
        result[matrixColumnIndex++] = wellID;

        // fill in the well level labels
        for(var p = 0; p < wellCategories.length; p++){
            result[matrixColumnIndex++]
                = wellLabels[wellCategories[p]]
                ? wellLabels[wellCategories[p]] : BLANK_CELL;
        }

        // blank spaces
        if (plateCategories.length + experimentCategories.length > 0){
            for (var m = 0; m<NUM_BLANK_COLUMNS_BETWEEN_WELL_AND_PLATE_LEVEL_DATA; m++){
                result[matrixColumnIndex++] = BLANK_CELL;
            }
        }

        // fill in the plate level labels
        for(var l = 0; l < plateCategories.length; l++){
            result[matrixColumnIndex++]
                = plateLabels[plateCategories[l]]
                ? plateLabels[plateCategories[l]] : BLANK_CELL;
        }

        // fill in the experiment level labels
        for(var q = 0; q < experimentCategories.length; q++){
            result[matrixColumnIndex++]
                = experimentLabels[experimentCategories[q]]
                ? experimentLabels[experimentCategories[q]] : BLANK_CELL;
        }

        return result;
    }


    function createImportDataMatrix(importData){
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
        var wellLevelCategories = findWellLevelCategories(importData);
        var plateLevelCategories = findPlateLevelCategories(importData);
        var experimentLevelCategories = findExperimentLevelCategories(importData);

        if (!wellLevelCategories.length){
            // the file will be empty
            return [];
        }

        if (experimentLevelCategories.length){
            experimentLabels = importData.experimentFeatures.labels;
        }

        // create the header row
        result[0] = createMatrixHeaderRow(wellLevelCategories,
                                          plateLevelCategories,
                                          experimentLevelCategories);

        // create the data rows
        matrixRowIndex = 1;
        for(var plateIndex = 0; plateIndex < importData.plates.length; plateIndex++){
            plate = importData.plates[plateIndex];

            if (importData.plates[plateIndex].plateID
                && importData.plates[plateIndex].plateID != NO_PLATE_ID){
                plateID = importData.plates[plateIndex].plateID;
            } else {
                plateID = "plate " + (plateIndex + 1);
            }

            for (var rowIndex = 0; rowIndex < plate.rows.length; rowIndex++){
                row = plate.rows[rowIndex];
                rowLabel = Grid.getRowLabel(rowIndex + 1);

                for (var columnIndex = 0; columnIndex < row.columns.length; columnIndex++){
                    well = row.columns[columnIndex];
                    wellID = rowLabel + (columnIndex + 1);
                    wellLabels = well.labels;
                    plateLabels = plate.labels;

                    result[matrixRowIndex++] = createMatrixDataRow(plateID,
                                                                   wellID,
                                                                   wellLabels,
                                                                   plateLabels,
                                                                   experimentLabels,
                                                                   wellLevelCategories,
                                                                   plateLevelCategories,
                                                               experimentLevelCategories);
                }
            }

        }

        return result;
    }


    this.createDSVString = function(cellTerminator, lineTerminator){
        var result = "";

        var numRows;

        if (matrix && matrix.length){
            numRows = matrix.length
        } else {
            // return empty DSV string if there are no rows in the matrix
            numRows = 0;
            return "";
        }

        // count max number of columns
        var numColumns = 0;

        for (var i=0; i<matrix.length; i++){
            if (matrix[i].length > numColumns){
                numColumns = matrix[i].length;
            }
        }

        if (!numColumns){
            // return empty DSV string if there are no columns in the matrix
            return "";
        }

        // fill out the DSV string with the values of the matrix
        for (var row = 0; row<numRows; row++){
            for (var col = 0; col<numColumns; col++){
                if (typeof matrix[row][col] != "undefined"){
                    result += matrix[row][col]
                }

                if (col != numColumns - 1){
                    result += cellTerminator;
                } else {
                    result += lineTerminator;
                }
            }
        }

        return result;
    };

    this.forceTSVDownload = function(filename){
        var TSVString = this.createDSVString("\t", "\n");

        ImportDataFileGenerator.forceFileDownload(filename, TSVString);
    }
}

/**
 * This method is based on a suggestion from stackoverflow thread:
 *
 * http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
 *
 * for downloading a browser generated file to the client machine.
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