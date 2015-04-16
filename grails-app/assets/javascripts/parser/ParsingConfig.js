/**
 * Created by zacharymartin on 3/22/15.
 */
// type of feature values
var PLATE = "plate";
var WELL_LEVEL = "wellLevel";
var PLATE_LEVEL = "plateLevel";
var EXPERIMENT_LEVEL = "experimentLevel";

// type of value values
var QUANTITATIVE = "quantitative";
var QUALITATIVE = "qualitative";

/**
 * The constructor for ParsingConfig objects.
 * @param name - a unique string name for the parsing configuration
 * @param machineName - a string name for the assay machine that the parsing configuration
 *                  is for.
 * @param description - a string description of the parsing configuration
 * @param exampleFileName - a string name for the example output file used to create the
 *                      configuration
 * @param exampleFileContents - the string contents of the example output file
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
    this.plates = [];

    var _self = this;


    function BioFeature(feaLabel){
        this.featureLabel = feaLabel;
        this.topLeftCoords = null;
        this.bottomRightCoords = null;
        this.topLeftValue = null;
        this.relativeToLeftX= null;
        this.relativeToLeftY= null;
        this.color = null;
        this.typeOfFeature = null;  // PLATE, WELL_LEVEL, PLATE_LEVEL, EXPERIMENT_LEVEL
    }


    this.isPlateTopLeftCorner = function(row, column, grid){
        if (!this.plateAnchors || !this.plateAnchors.length){
            return false;
        }

        for(var i=0; i<this.plateAnchors.length; i++){

            var possibleAnchorRow = this.plateAnchors[i][0] + row;
            var possibleAnchorCol = this.plateAnchors[i][1] + column;
            var anchorValue = this.plateAnchors[i][2].trim();

            var valueToCheck
                = grid.getDataPoint(possibleAnchorRow, possibleAnchorCol).trim();

            if (valueToCheck != anchorValue){
                return false;
            }
        }

        return true;
    };

    function findPlates(examiner, grid){
        var plateRanges = []; // elements of form [startRow, startCol, endRow, endCol]
                              // each represents a plate on the grid
        var plateHeight
            = _self.plate.bottomRightCoords[0] - _self.plate.topLeftCoords[0] + 1;
        var plateWidth
            = _self.plate.bottomRightCoords[1] - _self.plate.topLeftCoords[1] + 1;

        var lastRowToCheck = examiner.rowsSize - plateHeight + 1;
        var lastColumnToCheck = examiner.colsSize - plateWidth + 1;

        for (var row = 1; row<=lastRowToCheck; row++){
            for (var col = 1; col<=lastColumnToCheck; col++){
                if (_self.isPlateTopLeftCorner(row, col, grid)) {
                    plateRanges.push([row,
                                      col,
                                      row + plateHeight - 1,
                                      col + plateWidth - 1]);
                }
            }

        }

        return plateRanges;
    }

    this.setPlates = function(examiner, grid){
        this.plates = findPlates(examiner, grid);
    };

    this.findExperimentLevelFeatureCoords = function(featureName){
        var feature = this.features[featureName];
        var row = feature.topLeftCoords[0];
        var col = feature.topLeftCoords[1];

        return [row, col];
    };

    this.findPlateLevelFeatureCoords = function(featureName){
        var plateFeatures = [];
        var feature = this.features[featureName];

        for (var j=0; j<this.plates.length; j++){
            var plateTopLeftRow = this.plates[j][0];
            var plateTopLeftCol = this.plates[j][1];
            var row = plateTopLeftRow + feature.relativeToLeftY;
            var col = plateTopLeftCol + feature.relativeToLeftX;

            plateFeatures.push([row, col]);
        }

        return plateFeatures;
    };

    this.findWellLevelFeatureCoords = function(featureName){
        var wellFeatures = [];
        var feature = this.features[featureName];

        for (var j=0; j<this.plates.length; j++){
            var plateTopLeftRow = this.plates[j][0];
            var plateTopLeftCol = this.plates[j][1];
            var wellCounter = 0;
            var width
                = feature.bottomRightCoords[1] - feature.topLeftCoords[1] + 1;
            var height
                = feature.bottomRightCoords[0] - feature.topLeftCoords[0] + 1;
            var plateWellFeatures = [];

            for (var k = 0; k<height; k++ ){
                for (var m = 0; m<width; m++ ){
                    var row = plateTopLeftRow + feature.relativeToLeftY + k;
                    var col = plateTopLeftCol + feature.relativeToLeftX + m;

                    plateWellFeatures.push([row,
                        col]);

                    wellCounter++;
                }
            }

            wellFeatures.push(plateWellFeatures);
        }

        return wellFeatures;
    };

    this.getFeatureCoords = function(featureName){
        var feature = this.features[featureName];
        var coords = [];
        var plate;
        var coordinates;

        if (feature.typeOfFeature == WELL_LEVEL){
            var wellFeatureCoords = this.findWellLevelFeatureCoords(featureName);

            for (plate = 0; plate < wellFeatureCoords.length; plate++){
                var plateCoords = wellFeatureCoords[plate];

                for (var i=0; i<plateCoords.length; i++){
                    coordinates = plateCoords[i];

                    coords.push(coordinates);
                }
            }
        } else if (feature.typeOfFeature == PLATE_LEVEL) {
            var plateFeatureCoords = this.findPlateLevelFeatureCoords(featureName);

            for (plate = 0; plate < plateFeatureCoords.length; plate++){
                coordinates = plateFeatureCoords[plate];

                coords.push(coordinates);
            }
        } else if (feature.typeOfFeature == EXPERIMENT_LEVEL){
            coords.push(this.findExperimentLevelFeatureCoords(featureName));
        }

        return coords;
    };

    this.getFeatureValuesDescriptors = function(featureName, grid){
        var result = [];
        var featureCoords;
        var feature = this.features[featureName];
        var plateIndex;
        var gridRow;
        var gridCol;
        var cell;
        var value;
        var descriptor;

        if (feature.typeOfFeature == WELL_LEVEL){
            featureCoords = this.findWellLevelFeatureCoords(featureName);

            for (plateIndex = 0; plateIndex < featureCoords.length; plateIndex++){
                var plate = featureCoords[plateIndex];

                for (var wellIndex = 0; wellIndex < plate.length; wellIndex++){
                    gridRow = plate[wellIndex][0];
                    gridCol = plate[wellIndex][1];
                    cell = Grid.getRowLabel(gridRow) + gridCol;
                    value = grid.getDataPoint(gridRow, gridCol);

                    var coordsOnPlate = ParsingConfig.wellNumberToPlateCoords(wellIndex,
                                                                              plate.length,
                                                                              2,
                                                                              3);
                    var plateRow = Grid.getRowLabel(coordsOnPlate[0] + 1);
                    var plateCol = coordsOnPlate[1] + 1;
                    descriptor = "plate: " + (plateIndex + 1) + ", well: " + plateRow
                                    + plateCol + ", value: " + value;
                    result.push({
                        descriptor: descriptor,
                        cell: cell
                    });
                }
            }
        } else if (feature.typeOfFeature == PLATE_LEVEL) {
            featureCoords = this.findPlateLevelFeatureCoords(featureName);

            for (plateIndex = 0; plateIndex < featureCoords.length; plateIndex++){
                var plate = featureCoords[plateIndex];

                gridRow = plate[0];
                gridCol = plate[1];
                cell = Grid.getRowLabel(gridRow) + gridCol;
                value = grid.getDataPoint(gridRow, gridCol);
                descriptor = "plate: " + (plateIndex + 1) + ", value: " + value;

                result.push({
                    descriptor: descriptor,
                    cell: cell
                });
            }
        } else if (feature.typeOfFeature == EXPERIMENT_LEVEL){
            featureCoords = this.findExperimentLevelFeatureCoords(featureName);

            gridRow = featureCoords[0];
            gridCol = featureCoords[1];
            cell = Grid.getRowLabel(gridRow) + gridCol;
            value = grid.getDataPoint(gridRow, gridCol);
            descriptor = "value: " + value;

            result.push({
                descriptor: descriptor,
                cell: cell
            });
        }

        return result;
    };


    this.createImportData = function(plateIDs, grid){
        var importData = new ImportData("none");
        var plate;

        for (var featureName in this.features){
            var feature = this.features[featureName];
            var category = feature.featureLabel;

            if (feature.typeOfFeature == WELL_LEVEL){
                var wellFeatureCoords = this.findWellLevelFeatureCoords(featureName);

                for (plate = 0; plate < wellFeatureCoords.length; plate++){
                    var plateCoords = wellFeatureCoords[plate];

                    if (!importData.plates[plate]){
                        importData.plates[plate] = {
                            plateID: plateIDs[plate],
                            labels : {},
                            rows: []
                        };
                    }

                    for (var i=0; i<plateCoords.length; i++){
                        var gridCoordinates = plateCoords[i];
                        var gridRow = gridCoordinates[0];
                        var gridColumn = gridCoordinates[1];
                        var plateCoordinates = ParsingConfig.wellNumberToPlateCoords(i, plateCoords.length, 2, 3);
                        var plateRow = plateCoordinates[0];
                        var plateColumn = plateCoordinates[1];

                        var value = grid.getDataPoint(gridRow, gridColumn);

                        if (!importData.plates[plate].rows[plateRow]){
                            importData.plates[plate].rows[plateRow] = {
                                columns: []
                            };
                        }

                        if (!importData.plates[plate].rows[plateRow].columns[plateColumn]){
                            importData.plates[plate].rows[plateRow].columns[plateColumn]
                                = {
                                    labels: {}
                                  };
                        }

                        importData.plates[plate].rows[plateRow].columns[plateColumn].labels[category]
                            = value;
                    }
                }
            } else if (feature.typeOfFeature == PLATE_LEVEL) {
                var plateFeatureCoords = this.findPlateLevelFeatureCoords(featureName);

                for (plate = 0; plate < plateFeatureCoords.length; plate++){


                    if (!importData.plates[plate]){
                        importData.plates[plate] = {
                            plateID: plateIDs[plate],
                            labels : {},
                            rows: []
                        };
                    }

                    var gridCoordinates = plateFeatureCoords[plate];
                    var gridRow = gridCoordinates[0];
                    var gridColumn = gridCoordinates[1];
                    var value = grid.getDataPoint(gridRow, gridColumn);


                    importData.plates[plate].labels[category]
                        = value;
                }
            } else if (feature.typeOfFeature == EXPERIMENT_LEVEL){
                var gridCoordinates = this.findExperimentLevelFeatureCoords(featureName);
                var gridRow = gridCoordinates[0];
                var gridColumn = gridCoordinates[1];
                var value = grid.getDataPoint(gridRow, gridColumn);

                importData.experimentFeatures.labels[category] = value;
            }
        }

        return importData;
    };


    this.addFeature = function(name, grid, isParent, parent, typeOfFeature, color){
        var newFeature = new BioFeature(name);
        newFeature.topLeftCoords= [grid.selectedStartRow, grid.selectedStartCol];
        newFeature.topLeftValue=grid.getDataPoint(grid.selectedStartRow, grid.selectedStartCol);
        newFeature.bottomRightCoords = [grid.selectedEndRow, grid.selectedEndCol];
        newFeature.relativeToLeftX = grid.selectedStartCol;
        newFeature.relativeToLeftY = grid.selectedStartRow;
        newFeature.typeOfFeature = typeOfFeature;
        newFeature.color = color;
        if (!isParent) {
            // When it is one value set both top and bottom properties to
            // the same value.
            if(newFeature.typeOfFeature== PLATE_LEVEL
                || newFeature.typeOfFeature == EXPERIMENT_LEVEL){
                newFeature.bottomRightCoords=newFeature.topLeftCoords;
            }
            newFeature.relativeToLeftX = newFeature.topLeftCoords[1] - parent.topLeftCoords[1];
            newFeature.relativeToLeftY = newFeature.topLeftCoords[0] - parent.topLeftCoords[0];
            newFeature.importData = true;
        }

        console.log(newFeature);
        return newFeature;
    };

    this.deleteFeature = function(nameOfFeatureToDelete){
        delete this.features[nameOfFeatureToDelete];
    };

    this.addPlate = function(grid, examiner, color){
        this.plateAnchors = [];
        this.features = {};
        this.plates = [];

        this.plate = this.addFeature("plate", grid, true, null, PLATE, color);

        this.plateAnchors.push([this.plate.topLeftCoords[0] - this.plate.topLeftCoords[0],
                                   this.plate.topLeftCoords[1] - this.plate.topLeftCoords[1],
                                   this.plate.topLeftValue]);
        this.setPlates(examiner, grid);
        return this.plate
    };

    this.addExperimentLevelFeature = function(name, grid, color){
        return this.addFeature(name, grid, true, null, EXPERIMENT_LEVEL, color);
    };

    this.addPlateLevelFeature = function(name, grid, color){
        return this.addFeature(name, grid, false, this.plate, PLATE_LEVEL, color);
    };

    this.addWellLevelFeature = function(name, grid, color){
        return this.addFeature(name, grid, false, this.plate, WELL_LEVEL, color);
    };

    this.getJSONString = function(){
        var JSONObject = {};

        JSONObject["id"] = this.id;
        JSONObject["name"] = this.name;
        JSONObject["machineName"] = this.machineName;
        JSONObject["description"] = this.description;
        JSONObject["delimiter"] = this.delimiter;
        JSONObject["plate"] = this.plate;
        JSONObject["plateAnchors"] = this.plateAnchors;
        JSONObject["features"] = this.features;

        return JSONObject;
    };
}

ParsingConfig.loadParsingConfig = function(JSONParsingConfig){
    var rawParsingConfig = JSON.parse(JSONParsingConfig);

    var config = new ParsingConfig(
    	rawParsingConfig.name,
        rawParsingConfig.machineName,
        rawParsingConfig.description,
        rawParsingConfig.delimiter);

    config.plate = rawParsingConfig.plate;
    config.plateAnchors = rawParsingConfig.plateAnchors;
    config.features = rawParsingConfig.features;

    return config;
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

ParsingConfig.createImportDataMatrix = function(importData){
    var result = [];
    var wellLevelCategories = [];
    var plateLevelCategories = [];
    var experimentLevelCategories = [];


    // empty result if no data is provided
    if (!importData){
        return [];
    }

    // first find all the label category names
    if (importData.experimentFeatures && importData.experimentFeatures.labels) {
        for (var category in importData.experimentFeatures.labels){
            experimentLevelCategories.push(category);
        }
    }

    if (importData.plates && importData.plates.length && importData.plates[0].labels) {
        for (category in importData.plates[0].labels){
            plateLevelCategories.push(category);
        }
    }

    if (importData.plates
            && importData.plates.length
            && importData.plates[0].rows
            && importData.plates[0].rows.length
            && importData.plates[0].rows[0].columns
            && importData.plates[0].rows[0].columns.length
            && importData.plates[0].rows[0].columns[0].labels
    ) {
        for (category in importData.plates[0].rows[0].columns[0].labels){
            wellLevelCategories.push(category);
        }
    } else {
        // no well data means an empty result
        return [];
    }

    // create the header row
    var headerIndex = 0;
    result[0] = [];
    result[0][headerIndex++] = "Plate/Barcode";
    result[0][headerIndex++] = "Well";

    for (var i = 0; i<wellLevelCategories.length; i++){
        result[0][headerIndex++] = wellLevelCategories[i];
    }

    result[0][headerIndex++] = "";
    result[0][headerIndex++] = "";

    for (var j=0; j<plateLevelCategories.length; j++){
        result[0][headerIndex++] = plateLevelCategories[j];
    }

    for (var k=0; k<experimentLevelCategories.length; k++){
        result[0][headerIndex++] = experimentLevelCategories[k];
    }

    console.log("experiment level categories = " + experimentLevelCategories);

    // fill in all other rows
    var matrixRowIndex = 1;
    for(var plateIndex = 0; plateIndex < importData.plates.length; plateIndex++){
        var plateID;
        var plate = importData.plates[plateIndex];

        if (importData.plates[plateIndex].plateID){
            plateID = importData.plates[plateIndex].plateID;
        } else {
            plateID = "plate " + (plateIndex + 1);
        }

        for (var rowIndex = 0; rowIndex < plate.rows.length; rowIndex++){
            var row = plate.rows[rowIndex];
            var rowLabel = Grid.getRowLabel(rowIndex + 1);

            for (var columnIndex = 0; columnIndex < row.columns.length; columnIndex++){
                var well = row.columns[columnIndex];
                var wellID = rowLabel + (columnIndex + 1);

                var matrixColumnIndex = 0;
                result[matrixRowIndex] = [];

                // fill in the plate ID and Well ID
                result[matrixRowIndex][matrixColumnIndex++] = plateID;
                result[matrixRowIndex][matrixColumnIndex++] = wellID;

                // fill in the well level labels
                for(var p = 0; p < wellLevelCategories.length; p++){
                    result[matrixRowIndex][matrixColumnIndex++]
                        = well.labels[wellLevelCategories[p]];
                }

                // two blank spaces
                result[matrixRowIndex][matrixColumnIndex++] = "";
                result[matrixRowIndex][matrixColumnIndex++] = "";

                // fill in the plate level labels
                for(var l = 0; l < plateLevelCategories.length; l++){
                    result[matrixRowIndex][matrixColumnIndex++]
                        = plate.labels[plateLevelCategories[l]];
                }

                // fill in the experiment level labels
                for(var q = 0; q < experimentLevelCategories.length; q++){
                    result[matrixRowIndex][matrixColumnIndex++]
                        = importData.experimentFeatures.labels[experimentLevelCategories[q]];
                }

                matrixRowIndex++;
            }
        }
    }

    return result;
};

ParsingConfig.convertMatrix2TSV = function(matrix){
    var result = "";

    var numRows;

    if (matrix && matrix.length){
        numRows = matrix.length
    } else {
        numRows = 0;
        return "";
    }

    var numColumns = 0;

    for (var i=0; i<matrix.length; i++){
        if (matrix[i].length > numColumns){
            numColumns = matrix[i].length;
        }
    }

    for (var row = 0; row<numRows; row++){
        for (var col = 0; col<numColumns; col++){
            if (typeof matrix[row][col] != "undefined"){
                result += matrix[row][col]
            }

            if (col != numColumns - 1){
                result += "\t";
            } else {
                result += "\n";
            }
        }
    }

    return result;

    // find the number of columns
};
