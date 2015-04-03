/**
 * Created by zacharymartin on 3/22/15.
 */
var PLATE = "plate";
var WELL_LEVEL = "wellLevel";
var PLATE_LEVEL = "plateLevel";
var EXPERIMENT_LEVEL = "experimentLevel";

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
 *                      "tab"
 * @param multiplePlatesPerFile - a boolean for whether or not the assay machine places
 *                          the results from multiple plates in a single file
 * @param multipleValuesPerWell - a boolean for whether or not multiple values per well
 *                          are given in the output files of the specified assay machine
 * @param gridFormat - a boolean for whether or not the file gives per well values in grid
 *                  format. If false this indicates that results are given in row per well
 *                  format.
 * @constructor
 */
function ParsingConfig(name,
                       machineName,
                       description,
                       exampleFileName,
                       exampleFileContents,
                       delimiter,
                       multiplePlatesPerFile,
                       multipleValuesPerWell,
                       gridFormat){
    this.name = name;
    this.machineName = machineName;
    this.description = description;
    this.exampleFileName = exampleFileName;
    this.exampleFileContents = exampleFileContents;
    this.delimiter = delimiter;
    this.plate = null;
    this.plateInvariates = [];  // elements stored as [relativeRow, relativeColumn, value]
    this.features = {};  // keyed on feature name
    this.multiplePlatesPerFile = multiplePlatesPerFile;
    this.multipleValuesPerWell = multipleValuesPerWell;
    this.gridFormat = gridFormat;


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


    this.isPlateStartRow = function(row, grid){
        for(var i=0; i<this.plateInvariates.length; i++){

            var invariateCol = this.plateInvariates[i][1];
            var invariateValue = this.plateInvariates[i][2].trim();

            var valueToCheck = grid.getDataPoint(row, invariateCol).trim();

            if (valueToCheck != invariateValue){
                return false;
            }
        }

        return true;
    };

    this.findPlates = function(startRow, endRow, grid){
        var plateRanges = []; // elements of form [startRow, startCol, endRow, endCol]
                              // each represents a plate on the grid

        for (var row = startRow; row<=endRow; row++){
            if (this.isPlateStartRow(row, grid)) {
                plateRanges.push([row,
                                  this.plate.topLeftCoords[1],
                                  row+this.plate.bottomRightCoords[0] - 1,
                                  this.plate.bottomRightCoords[1]])
            }
        }

        return plateRanges;
    };

    this.findExperimentLevelFeatureCoords = function(featureName){
        var feature = this.features[featureName];
        var row = feature.topLeftCoords[0];
        var col = feature.topLeftCoords[1];

        return [row, col];
    };

    this.findPlateLevelFeatureCoords = function(featureName, plates){
        var plateFeatures = [];
        var feature = this.features[featureName];

        for (var j=0; j<plates.length; j++){
            var plateTopLeftRow = plates[j][0];
            var plateTopLeftCol = plates[j][1];
            var row = plateTopLeftRow + feature.topLeftCoords[0] - 1;
            var col = plateTopLeftCol + feature.topLeftCoords[1] - 1;

            plateFeatures.push([row, col]);
        }

        return plateFeatures;
    };

    this.findWellLevelFeatureCoords = function(featureName ,plates){
        var wellFeatures = [];
        var feature = this.features[featureName];

        for (var j=0; j<plates.length; j++){
            var plateTopLeftRow = plates[j][0];
            var plateTopLeftCol = plates[j][1];
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

    this.getFeatureCoords = function(featureName, plates){
        var feature = this.features[featureName];
        var coords = [];
        var plate;
        var coordinates;

        if (feature.typeOfFeature == WELL_LEVEL){
            var wellFeatureCoords = this.findWellLevelFeatureCoords(featureName, plates);

            for (plate = 0; plate < wellFeatureCoords.length; plate++){
                var plateCoords = wellFeatureCoords[plate];

                for (var i=0; i<plateCoords.length; i++){
                    coordinates = plateCoords[i];

                    coords.push(coordinates);
                }
            }
        } else if (feature.typeOfFeature == PLATE_LEVEL) {
            var plateFeatureCoords = this.findPlateLevelFeatureCoords(featureName,plates);

            for (plate = 0; plate < plateFeatureCoords.length; plate++){
                coordinates = plateFeatureCoords[plate];

                coords.push(coordinates);
            }
        } else if (feature.typeOfFeature == EXPERIMENT_LEVEL){
            coords.push(this.findExperimentLevelFeatureCoords(featureName));
        }

        return coords;
    };

    this.getFeatureValuesDescriptors = function(featureName, plates, grid){
        var result = [];
        var featureCoords = this.getFeatureCoords(featureName, plates);
        var feature = this.features[featureName];
        var lastPlate = -1;
        var wellCounter = 0;


        for (var i=0; i<featureCoords.length; i++){
            var currentCoordinates = featureCoords[i];
            var row = currentCoordinates[0];
            var col = currentCoordinates[1];
            var rowLetter = Grid.getRowLabel(row);
            var cell = rowLetter + col;
            var value = grid.getDataPoint(row, col);
            var plate;
            var descriptor;

            if (feature.typeOfFeature != EXPERIMENT_LEVEL) {
                for (var j=0; j<plates.length; j++){
                    if (ParsingConfig.cellIsContainedInRange([row, col], plates[j])){
                        plate = j;
                        break;
                    }
                }

                if (lastPlate != plate) {
                    lastPlate = plate;
                    wellCounter = 0;
                }
            }

            if (feature.typeOfFeature == WELL_LEVEL){
                var numberOfWellsOnAPlate
                    = ParsingConfig.getNumberOfWellsFromFeatureBounds(
                                                            feature.topLeftCoords[0],
                                                            feature.topLeftCoords[1],
                                                            feature.bottomRightCoords[0],
                                                            feature.bottomRightCoords[1]);
                var plateCoords = ParsingConfig.wellNumberToPlateCoords(wellCounter,
                                                                    numberOfWellsOnAPlate,
                                                                    2,
                                                                    3);
                var plateRow = Grid.getRowLabel(plateCoords[0] + 1);
                var plateWellIdentifier = plateRow + (plateCoords[1] + 1);

                descriptor = "plate: " + (plate + 1) + ", well: " + plateWellIdentifier
                                + ", value: " + value;

                wellCounter++;
            } else if (feature.typeOfFeature == PLATE_LEVEL) {
                descriptor = "plate: " + (plate + 1) + ", value: " + value;
            } else if (feature.typeOfFeature == EXPERIMENT_LEVEL){
                descriptor = "value: " + value;
            }

            result.push({
                descriptor: descriptor,
                cell: cell
            });
        }

        return result;
    };

    this.highlightPlatesAndFeatures = function(plates, colorPicker, grid){
        var coordsToHighlight = [];
        var colorKeys = [];
        var colorKey;

        // first highlight plates
        for (var plateIndex=0; plateIndex<plates.length; plateIndex++){
            colorKey = this.highlightPlate(plateIndex, plates, colorPicker, grid);
            colorKeys.push(colorKey);
        }

        // next highlight features

        for(var featureName in this.features){
            colorKey = this.highlightFeature(featureName, plates, colorPicker, grid);
            colorKeys.push(colorKey);
        }

        return colorKeys
    };

    this.highlightPlate = function(plateIndex, plates, colorPicker, grid){
        var colorKey;

        var plateRange = plates[plateIndex];
        var startRow = plateRange[0];
        var startCol = plateRange[1];
        var endRow = plateRange[2];
        var endCol = plateRange[3];
        colorKey = colorPicker.getDistinctColorKey();

        var coordsToHighlight = ParsingConfig.getCoordsInARange(startRow,
            startCol,
            endRow,
            endCol);

        grid.setCellColors(coordsToHighlight,
            colorPicker.getColorByIndex(this.plate.color),
            colorKey);

        return colorKey;
    };

    this.highlightFeature = function(featureName, plates, colorPicker, grid){
        var feature = this.features[featureName];
        var colorKey = colorPicker.getDistinctColorKey();

        var coordsToHighlight = this.getFeatureCoords(featureName, plates);

        grid.setCellColors(coordsToHighlight,
            colorPicker.getColorByIndex(feature.color),
            colorKey);

        return colorKey;
    };


    this.createImportData = function(plates, grid){
        var importData = new ImportData("test identifier");

        for (var featureName in this.features){
            var feature = this.features[featureName];
            var category = feature.featureLabel;

            if (feature.typeOfFeature == WELL_LEVEL){
                var wellFeatureCoords = this.findWellLevelFeatureCoords(featureName, plates);

                for (plate = 0; plate < wellFeatureCoords.length; plate++){
                    var plateCoords = wellFeatureCoords[plate];

                    if (!importData.plates[plate]){
                        importData.plates[plate] = {
                            labels : [],
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
                            importData.plates[plate].rows[plateRow].columns[plateColumn] = {
                                labels: []
                            };
                        }

                        importData.plates[plate].rows[plateRow].columns[plateColumn].labels.push({
                            key: category,
                            value: value
                        });
                    }
                }
            } else if (feature.typeOfFeature == PLATE_LEVEL) {
                var plateFeatureCoords = this.findPlateLevelFeatureCoords(featureName,plates);

                for (plate = 0; plate < plateFeatureCoords.length; plate++){


                    if (!importData.plates[plate]){
                        importData.plates[plate] = {
                            labels : [],
                            rows: []
                        };
                    }

                    var gridCoordinates = plateFeatureCoords[plate];
                    var gridRow = gridCoordinates[0];
                    var gridColumn = gridCoordinates[1];
                    var value = grid.getDataPoint(gridRow, gridColumn);


                    importData.plates[plate].labels.push({
                        key: category,
                        value: value
                    });
                }
            } else if (feature.typeOfFeature == EXPERIMENT_LEVEL){
                var gridCoordinates = this.findExperimentLevelFeatureCoords(featureName);
                var gridRow = gridCoordinates[0];
                var gridColumn = gridCoordinates[1];
                var value = grid.getDataPoint(gridRow, gridColumn);

                importData.experimentFeatures.labels.push({
                    key: category,
                    value: value
                });
            }


        }

        return importData;
    };

    this.applyFeatures = function(startRow, endRow, grid){
        var plates = this.findPlates(startRow, endRow, grid);

        var plateIDs = [];
        for (var i=0; i<plates.length; i++){
            plateIDs.push("plate " + i);
        }
        this.highlightPlatesAndFeatures(plates, colorPicker, grid);
        var data = this.createImportData(plates, grid);

        console.log(data);
    };


    this.addFeature = function(name, grid, isParent, parent, typeOfFeature){
        var newFeature = new BioFeature(name);
        newFeature.topLeftCoords= [grid.selectedStartRow, grid.selectedStartCol];
        newFeature.topLeftValue=grid.getDataPoint(grid.selectedStartRow, grid.selectedStartCol);
        newFeature.bottomRightCoords = [grid.selectedEndRow, grid.selectedEndCol];
        newFeature.relativeToLeftX = grid.selectedStartCol;
        newFeature.relativeToLeftY = grid.selectedStartRow;
        newFeature.typeOfFeature = typeOfFeature;
        if (!isParent) {
            newFeature.typeOfFeature = typeOfFeature;

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
        newFeature.color=colorPointer;
        colorPointer++;

        console.log(newFeature);
        return newFeature;
    };

    this.addPlate = function(grid){
        this.plate = this.addFeature("plate", grid, true, null, PLATE);
        this.plateInvariates.push([this.plate.topLeftCoords[0],
                                   this.plate.topLeftCoords[1],
                                   this.plate.topLeftValue]);
        return this.plate
    };

    this.addExperimentLevelFeature = function(name, grid){
        return this.addFeature(name, grid, true, null, EXPERIMENT_LEVEL);
    };

    this.addPlateLevelFeature = function(name, grid){
        return this.addFeature(name, grid, false, this.plate, PLATE_LEVEL);
    };

    this.addWellLevelFeature = function(name, grid){
        return this.addFeature(name, grid, false, this.plate, WELL_LEVEL);
    };

    /**
     * This function might be useful for more in depth pattern matching
     */
    function searchForPlateInvariates(){
        var valueToLookFor;
        var timesFound;
        var possibleInvariateCoords = [];
        var threshold
            = Math.floor(rowsSize/((currentBottomRightCoord[0] - currentTopLeftCoord[0])*2));

        for(var row=currentTopLeftCoord[0]; row<=currentBottomRightCoord[0]; row++){
            for(var col=currentTopLeftCoord[1]; col<=currentBottomRightCoord[1]; col++){
                valueToLookFor = grid.getDataPoint(row, col).trim();
                if (valueToLookFor){
                    timesFound = 0;
                    for(var obsRow = currentBottomRightCoord[0]+1; obsRow<=rowsSize; obsRow++){
                        var currentValue = grid.getDataPoint(obsRow, col);
                        if (currentValue && currentValue.trim() == valueToLookFor){
                            timesFound++;
                            if (timesFound >= threshold) {

                                possibleInvariateCoords.push([row,col]);
                                break;
                            }
                        }

                    }


                }
            }
        }

        var invariatesKey = colorPicker.getDistinctColorKey();
        grid.setCellColors(possibleInvariateCoords, "#a00", invariatesKey);

        // load invariate cell selector
        var invariateSelectElement = document.getElementById("invariateSelect");
        for (var i=0; i<possibleInvariateCoords.length; i++){
            var cellRow = possibleInvariateCoords[i][0] + 1;
            var cellCol = possibleInvariateCoords[i][1];
            var cellValue = grid.getDataPoint(cellRow, cellCol);
            var optionValue = cellRow+":"+ cellCol;

            var option = document.createElement("option");
            option.setAttribute("value", optionValue);
            option.innerHTML = cellValue + " : " + Grid.getRowLabel(cellRow) + cellCol;
            invariateSelectElement.appendChild(option);
        }
    }

    this.getJSONString = function(){
        var JSONObject = {};

        JSONObject["name"] = this.name;
        JSONObject["machineName"] = this.machineName;
        JSONObject["description"] = this.description;
        JSONObject["delimiter"] = this.delimiter;
        JSONObject["plate"] = this.plate;
        JSONObject["plateInvariates"] = this.plateInvariates;
        JSONObject["features"] = this.features;

        console.log("JSONObject = " + JSON.stringify(JSONObject));
    }


}

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
