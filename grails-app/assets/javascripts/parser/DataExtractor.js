/**
 * Created by zacharymartin on 4/21/15.
 */

function DataExtractor(){}

DataExtractor.isPlateTopLeftCorner = function(row, column, grid, parsingConfig){
    if (!parsingConfig.plateAnchors || !parsingConfig.plateAnchors.length){
        return false;
    }

    for(var i=0; i<parsingConfig.plateAnchors.length; i++){

        var possibleAnchorRow = parsingConfig.plateAnchors[i][0] + row;
        var possibleAnchorCol = parsingConfig.plateAnchors[i][1] + column;
        var anchorValue = parsingConfig.plateAnchors[i][2].trim();

        var valueToCheck
            = grid.getDataPoint(possibleAnchorRow, possibleAnchorCol).trim();

        if (valueToCheck != anchorValue){
            return false;
        }
    }

    return true;
};

DataExtractor.findPlates = function(grid, parsingConfig, examiner){
    var plateRanges = []; // elements of form [startRow, startCol, endRow, endCol]
                          // each represents a plate on the grid
    var plateHeight
        = parsingConfig.plate.coordinateRange.endRow
                - parsingConfig.plate.coordinateRange.startRow + 1;
    var plateWidth = parsingConfig.plate.coordinateRange.endCol
                - parsingConfig.plate.coordinateRange.startCol + 1;

    var lastRowToCheck = examiner.rowsSize - plateHeight + 1;
    var lastColumnToCheck = examiner.colsSize - plateWidth + 1;

    for (var row = 1; row<=lastRowToCheck; row++){
        for (var col = 1; col<=lastColumnToCheck; col++){
            if (DataExtractor.isPlateTopLeftCorner(row, col, grid, parsingConfig)) {
                plateRanges.push([row,
                                  col,
                                  row + plateHeight - 1,
                                  col + plateWidth - 1]);
            }
        }

    }

    return plateRanges;
};

DataExtractor.findExperimentLevelFeatureCoords = function(featureName, parsingConfig){
    var feature = parsingConfig.features[featureName];
    var row = feature.coordinateRange.startRow;
    var col = feature.coordinateRange.startCol;

    return [row, col];
};

DataExtractor.findPlateLevelFeatureCoords = function(featureName, plates, parsingConfig){
    var plateFeatures = [];
    var feature = parsingConfig.features[featureName];

    for (var j=0; j<plates.length; j++){
        var plateTopLeftRow = plates[j][0];
        var plateTopLeftCol = plates[j][1];
        var row = plateTopLeftRow + feature.relativeToLeftY;
        var col = plateTopLeftCol + feature.relativeToLeftX;

        plateFeatures.push([row, col]);
    }

    return plateFeatures;
};

DataExtractor.findPlateLevelFeatureValues = function(featureName,
                                                     plates,
                                                     parsingConfig,
                                                     grid){
    var result = [];
    var featureCoords = DataExtractor.findPlateLevelFeatureCoords(featureName,
                                                                  plates,
                                                                  parsingConfig);

    for (var i=0; i<featureCoords.length; i++){
        var gridRow = featureCoords[i][0];
        var gridCol = featureCoords[i][1];

        result.push(grid.getDataPoint(gridRow, gridCol));
    }

    return result;
};

DataExtractor.findWellLevelFeatureCoords = function(featureName, plates, parsingConfig){
    var wellFeatures = [];
    var feature = parsingConfig.features[featureName];

    for (var j=0; j<plates.length; j++){
        var plateTopLeftRow = plates[j][0];
        var plateTopLeftCol = plates[j][1];
        var wellCounter = 0;
        var width = feature.coordinateRange.endCol - feature.coordinateRange.startCol + 1;
        var height = feature.coordinateRange.endRow - feature.coordinateRange.startRow +1;
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

DataExtractor.getFeatureCoords = function(featureName, plates, parsingConfig){
    var feature = parsingConfig.features[featureName];
    var coords = [];
    var plate;
    var coordinates;

    if (feature.typeOfFeature == WELL_LEVEL){
        var wellFeatureCoords = DataExtractor.findWellLevelFeatureCoords(featureName,
                                                                         plates,
                                                                         parsingConfig);

        for (plate = 0; plate < wellFeatureCoords.length; plate++){
            var plateCoords = wellFeatureCoords[plate];

            for (var i=0; i<plateCoords.length; i++){
                coordinates = plateCoords[i];

                coords.push(coordinates);
            }
        }
    } else if (feature.typeOfFeature == PLATE_LEVEL) {
        var plateFeatureCoords = DataExtractor.findPlateLevelFeatureCoords(featureName,
                                                                           plates,
                                                                           parsingConfig);

        for (plate = 0; plate < plateFeatureCoords.length; plate++){
            coordinates = plateFeatureCoords[plate];

            coords.push(coordinates);
        }
    } else if (feature.typeOfFeature == EXPERIMENT_LEVEL){
        coords.push(DataExtractor.findExperimentLevelFeatureCoords(featureName,
                                                                   parsingConfig));
    }

    return coords;
};

DataExtractor.getFeatureValuesDescriptors = function(featureName,
                                                     plates,
                                                     grid,
                                                     parsingConfig){
    var result = [];
    var featureCoords;
    var feature = parsingConfig.features[featureName];
    var plateIndex;
    var gridRow;
    var gridCol;
    var cell;
    var value;
    var descriptor;

    if (feature.typeOfFeature == WELL_LEVEL){
        featureCoords = DataExtractor.findWellLevelFeatureCoords(featureName,
                                                                 plates,
                                                                 parsingConfig);

        for (plateIndex = 0; plateIndex < featureCoords.length; plateIndex++){
            var plate = featureCoords[plateIndex];

            for (var wellIndex = 0; wellIndex < plate.length; wellIndex++){
                gridRow = plate[wellIndex][0];
                gridCol = plate[wellIndex][1];
                cell = Grid.getRowLabel(gridRow) + gridCol;
                value = grid.getDataPoint(gridRow, gridCol);

                var coordsOnPlate = ParsingConfig.wellNumberToPlateCoords(wellIndex,
                                                        plate.length,
                                                        ParsingConfig.WELL_ROW_FACTOR,
                                                        ParsingConfig.WELL_COL_FACTOR);
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
        featureCoords = DataExtractor.findPlateLevelFeatureCoords(featureName,
                                                                  plates,
                                                                  parsingConfig);

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
        featureCoords = DataExtractor.findExperimentLevelFeatureCoords(featureName, parsingConfig);

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

DataExtractor.featureIsNumeric = function(featureName, plates, parsingConfig, grid){
    var result = true;
    var featureCoords = DataExtractor.getFeatureCoords(featureName,
                                                       plates,
                                                       parsingConfig);

    for (var i = 0; i<featureCoords.length; i++){
        var value = grid.getDataPoint(featureCoords[i][0], featureCoords[i][1]);

        if (!$.isNumeric(value) && value !== ""){
            result = false;
            break
        }
    }

    return result;
};


DataExtractor.fillImportData = function(importData, parsingConfig, plates, grid){
    var plate;

    for (var featureName in parsingConfig.features){
        var feature = parsingConfig.features[featureName];

        if (feature.typeOfFeature == WELL_LEVEL){
            DataExtractor.fillImportDataWithWellLevelFeatureValues(importData,
                                                                   featureName,
                                                                   parsingConfig,
                                                                   plates,
                                                                   grid);
        } else if (feature.typeOfFeature == PLATE_LEVEL) {
            DataExtractor.fillImportDataWithPlateLevelFeatureValues(importData,
                                                                    featureName,
                                                                    parsingConfig,
                                                                    plates,
                                                                    grid);
        } else if (feature.typeOfFeature == EXPERIMENT_LEVEL){
            DataExtractor.fillImportDataWithExperimentLevelFeatureValues(importData,
                                                                         featureName,
                                                                         parsingConfig,
                                                                         grid);
        }
    }

    return importData;
};

DataExtractor.fillImportDataWithWellLevelFeatureValues = function(importData,
                                                                  featureName,
                                                                  parsingConfig,
                                                                  plates,
                                                                  grid){

    var wellFeatureCoords = DataExtractor.findWellLevelFeatureCoords(featureName,
                                                                     plates,
                                                                     parsingConfig);
    var isNumeric = DataExtractor.featureIsNumeric(featureName,
                                                   plates,
                                                   parsingConfig,
                                                   grid);


    importData.addWellLevelCategory(featureName, isNumeric);

    for (var plate = 0; plate < wellFeatureCoords.length; plate++){
        var plateCoords = wellFeatureCoords[plate];

        for (var i=0; i<plateCoords.length; i++){
            var gridCoordinates = plateCoords[i];
            var gridRow = gridCoordinates[0];
            var gridColumn = gridCoordinates[1];
            var plateCoordinates = ParsingConfig.wellNumberToPlateCoords(i,
                                                        plateCoords.length,
                                                        ParsingConfig.WELL_ROW_FACTOR,
                                                        ParsingConfig.WELL_COL_FACTOR);
            var plateRow = plateCoordinates[0];
            var plateColumn = plateCoordinates[1];

            var value = grid.getDataPoint(gridRow, gridColumn);

            importData.setWellLevelLabel(plate,
                                         plateRow,
                                         plateColumn,
                                         featureName,
                                         value);
        }
    }
};

DataExtractor.fillImportDataWithPlateLevelFeatureValues = function(importData,
                                                                   featureName,
                                                                   parsingConfig,
                                                                   plates,
                                                                   grid){
    var plateFeatureCoords = DataExtractor.findPlateLevelFeatureCoords(featureName,
                                                                       plates,
                                                                       parsingConfig);
    importData.addPlateLevelCategory(featureName);

    for (var plate = 0; plate < plateFeatureCoords.length; plate++){
        var gridCoordinates = plateFeatureCoords[plate];
        var gridRow = gridCoordinates[0];
        var gridColumn = gridCoordinates[1];
        var value = grid.getDataPoint(gridRow, gridColumn);

        importData.setPlateLevelLabel(plate, featureName, value);
    }
};

DataExtractor.fillImportDataWithExperimentLevelFeatureValues = function(importData,
                                                                        featureName,
                                                                        parsingConfig,
                                                                        grid){
    importData.addExperimentLevelCategory(featureName);

    var gridCoordinates = DataExtractor.findExperimentLevelFeatureCoords(featureName);
    var gridRow = gridCoordinates[0];
    var gridColumn = gridCoordinates[1];
    var value = grid.getDataPoint(gridRow, gridColumn);

    importData.setExperimentLevelLabel(featureName, value);
};