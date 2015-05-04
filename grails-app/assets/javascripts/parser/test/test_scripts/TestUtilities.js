/**
 * Created by zacharymartin on 5/1/15.
 */

function TestUtilities(){

}

TestUtilities.getRandomInt = function(a, b){
    var max = Math.max(a,b);
    var min = Math.min(a,b);
    var diff = max - min;

    return Math.floor((Math.random() * (diff + 1)) + min);
};

/**
 * This solution for generating random strings is based on a solution posted in the
 * following thread in stackOverflow:
 *
 * http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
 *
 */
TestUtilities.getRandomString = function(a, b){
    var length = TestUtilities.getRandomInt(a, b);

    var randomString = "";
    var possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));

    return randomString;
};

/**
 * This solution for generating random strings is based on a solution posted in the
 * following thread in stackOverflow:
 *
 * http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
 *
 */
TestUtilities.getRandomHexColorString = function(){
    var length = 6;

    var randomString = "";
    var possibleChars = "ABCDEF0123456789";

    for( var i=0; i < length; i++ )
        randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));

    return "#" + randomString;
};

TestUtilities.getRandomRange = function(startRowBound,
                                        startColBound,
                                        endRowBound,
                                        endColBound){
    var startRow = TestUtilities.getRandomInt(startRowBound, endRowBound);
    var startCol = TestUtilities.getRandomInt(startColBound, endColBound);
    var endRow = TestUtilities.getRandomInt(startRow, endRowBound);
    var endCol = TestUtilities.getRandomInt(startCol, endColBound);

    return new CellRange(startRow, startCol, endRow, endCol);
};

TestUtilities.getRandomWellLevelFeatureRange = function(plateRange, plateDimensions){
    var plateAreaHeight = plateRange.endRow - plateRange.startRow + 1;
    var plateAreaWidth = plateRange.endCol - plateRange.startCol + 1;

    var numPlateWellRows = plateDimensions[0];
    var numPlateWellCols = plateDimensions[1];

    var startRow = TestUtilities.getRandomInt(plateRange.startRow,
                                              plateRange.endRow - numPlateWellRows + 1);
    var endRow = startRow + numPlateWellRows - 1;
    var startCol = TestUtilities.getRandomInt(plateRange.startCol,
                                              plateRange.endCol - numPlateWellCols + 1);
    var endCol = startCol + numPlateWellCols - 1;

    return new CellRange(startRow, startCol, endRow, endCol);
};

TestUtilities.getRandomCell = function(range){
    var row = TestUtilities.getRandomInt(range.startRow, range.endRow);
    var col = TestUtilities.getRandomInt(range.startCol, range.endCol);

    return [row, col];
};


TestUtilities.getRandomImportDataObject = function(){
    var numPlates = TestUtilities.getRandomInt(1, 20);
    var numRows = TestUtilities.getRandomInt(1, 20);
    var numCols = TestUtilities.getRandomInt(1, 30);
    var numWellLevelCategories = TestUtilities.getRandomInt(0, 5);
    var numPlateLevelCategories = TestUtilities.getRandomInt(0, 5);
    var numExperimentLevelCategories = TestUtilities.getRandomInt(0, 5);

    var experimentID = TestUtilities.getRandomString(1, 16);
    var parsingID = TestUtilities.getRandomString(1, 16);
    var i, plate, row, col;
    var plateIDs = [];
    var experimentLevelCategories = [];
    var plateLevelCategories = [];
    var wellLevelCategories = {};
    var category;

    var importData = new ImportData(numPlates, numRows, numCols);

    // create numPlates unique plate IDs
    for (i=0; i<numPlates; i++){
        var plateID = TestUtilities.getRandomString(1, 16);
        if (TestUtilities.arrayContainsElement(plateIDs, plateID)){
            i--;
        } else {
            plateIDs.push(plateID);
        }
    }
    for (i=0; i<numWellLevelCategories; i++){
        var numeric;

        if (TestUtilities.getRandomInt(0,1)){
            numeric = true;
        } else {
            numeric = false;
        }

        category = TestUtilities.getRandomString(1, 16);
        if (wellLevelCategories[category] !== true && wellLevelCategories[category] !== false){
            wellLevelCategories[category] = numeric;
            importData.addWellLevelCategory(category, numeric);
        } else {
            i--;
        }
    }
    for (i=0; i<numPlateLevelCategories; i++){
        category = TestUtilities.getRandomString(1, 16);

        if (!TestUtilities.arrayContainsElement(plateLevelCategories, category)){
            plateLevelCategories.push(category);
            importData.addPlateLevelCategory(category);
        } else {
            i--;
        }
    }
    for (i=0; i<numExperimentLevelCategories; i++){
        category = TestUtilities.getRandomString(1, 16);

        if (!TestUtilities.arrayContainsElement(experimentLevelCategories, category)){
            experimentLevelCategories.push(category);
            importData.addExperimentLevelCategory(category);
        } else {
            i--;
        }
    }


    importData.setExperimentID(experimentID);
    importData.setParsingID(parsingID);
    importData.setPlateIdentifiersWithArray(plateIDs);

    for (i = 0; i<experimentLevelCategories.length; i++){
        var value;

        if (TestUtilities.getRandomInt(0,1)){
            value = TestUtilities.getRandomString(1, 16);
        } else {
            value = Math.random() * TestUtilities.getRandomInt(1, 1000000);
        }

        importData.setExperimentLevelLabel(experimentLevelCategories[i], value + "");
    }

    for (i = 0; i<plateLevelCategories.length; i++){
        for (plate = 0; plate<numPlates; plate++){
            var value;

            if (TestUtilities.getRandomInt(0,1)){
                value = TestUtilities.getRandomString(1, 16);
            } else {
                value = Math.random() * TestUtilities.getRandomInt(1, 1000000);
            }

            importData.setPlateLevelLabel(plate, plateLevelCategories[i], value + "");
        }
    }

    for (var category in wellLevelCategories){
        for (plate = 0; plate<numPlates; plate++){
            for (row = 0; row<numRows; row++){
                for(col = 0; col<numCols; col++){
                    var value;

                    if (wellLevelCategories[category]){
                        value = Math.random() * TestUtilities.getRandomInt(1, 1000000);
                    } else {
                        value = TestUtilities.getRandomString(1, 16);
                    }

                    importData.setWellLevelLabel(plate, row, col,category, value + "");
                }
            }
        }
    }

    return importData;
};

TestUtilities.getRandomParsingConfigObject = function(){
    var i;
    var featureName, featureCell, featureRange, featureColor;

    var name = TestUtilities.getRandomString(1, 16);
    var machine = TestUtilities.getRandomString(1, 16);
    var description = TestUtilities.getRandomString(1, 256);
    var delimiter = TestUtilities.getRandomString(1, 16);

    var parsingConfig = new ParsingConfig(name, machine, description, delimiter);
    parsingConfig.setColorPickerIndex(TestUtilities.getRandomInt(0, 500));
    parsingConfig.setID(TestUtilities.getRandomInt(1, 1000000));

    var plateRange = TestUtilities.getRandomRange(1,1,100, 100);
    var plateColor = TestUtilities.getRandomHexColorString();

    parsingConfig.addPlate(plateRange, plateColor);


    var numAnchors = TestUtilities.getRandomInt(1, 10);

    for (i = 0; i<numAnchors; i++){
        var anchorCoords = TestUtilities.getRandomCell(plateRange);
        var anchorRow = anchorCoords[0];
        var anchorCol = anchorCoords[1];
        var anchorValue = TestUtilities.getRandomString(0, 16);

        if (parsingConfig.findPlateAnchorIndex(anchorRow, anchorCol) === null){
            parsingConfig.addPlateAnchor(anchorRow, anchorCol, anchorValue);
        }
    }

    var numExperimentLevelFeatures = TestUtilities.getRandomInt(0, 10);

    for (i=0; i<numExperimentLevelFeatures; i++){
        featureName = TestUtilities.getRandomString(1, 16);
        featureCell = TestUtilities.getRandomCell(new CellRange(1,1, 100, 100));
        featureRange = new CellRange(featureCell[0],
                                     featureCell[1],
                                     featureCell[0],
                                     featureCell[1]);
        featureColor = TestUtilities.getRandomHexColorString();

        if (!parsingConfig.features[featureName]){
            parsingConfig.createFeature(featureName,
                                        featureRange,
                                        EXPERIMENT_LEVEL,
                                        featureColor);
        }
    }

    var numPlateLevelFeatures = TestUtilities.getRandomInt(0, 10);

    for (i=0; i<numPlateLevelFeatures; i++){
        featureName = TestUtilities.getRandomString(1, 16);
        featureCell = TestUtilities.getRandomCell(plateRange);
        featureRange = new CellRange(featureCell[0],
                                     featureCell[1],
                                     featureCell[0],
                                     featureCell[1]);
        featureColor = TestUtilities.getRandomHexColorString();

        if (!parsingConfig.features[featureName]){
            parsingConfig.createFeature(featureName,
                featureRange,
                PLATE_LEVEL,
                featureColor);
        }
    }


    var numWellLevelFeatures = TestUtilities.getRandomInt(0,10);
    var rowPerWellFormat = TestUtilities.getRandomInt(0,1);
    var plateDimensions = [];
    var plateRangeHeight = plateRange.endRow - plateRange.startRow + 1;
    var plateRangeWidth = plateRange.endCol - plateRange.startCol + 1;
    var maxBase;
    var base;

    if (rowPerWellFormat){
        maxBase = Math.floor(Math.sqrt((plateRangeHeight)/
                        (ParsingConfig.WELL_ROW_FACTOR * ParsingConfig.WELL_COL_FACTOR)));
        if (maxBase > 0){
            base = TestUtilities.getRandomInt(1, maxBase);
            plateDimensions[0] = base * base * ParsingConfig.WELL_ROW_FACTOR * ParsingConfig.WELL_COL_FACTOR;
            plateDimensions[1] = 1;
        } else {
            plateDimensions = null;
        }
    } else {
        // grid format
        maxBase = Math.floor(Math.min(plateRangeHeight/ParsingConfig.WELL_ROW_FACTOR,
                             plateRangeWidth/ParsingConfig.WELL_COL_FACTOR));

        if (maxBase > 0){
            base = TestUtilities.getRandomInt(1, maxBase);
            plateDimensions[0] = base * ParsingConfig.WELL_ROW_FACTOR;
            plateDimensions[1] = base * ParsingConfig.WELL_COL_FACTOR;
        } else {
            plateDimensions = null;
        }
    }

    if (plateDimensions) {
        for (i=0; i<numWellLevelFeatures; i++){

            featureName = TestUtilities.getRandomString(1, 16);
            featureRange = TestUtilities.getRandomWellLevelFeatureRange(plateRange, plateDimensions);
            featureColor = TestUtilities.getRandomHexColorString();

            if (!parsingConfig.features[featureName]){
                parsingConfig.createFeature(featureName,
                    featureRange,
                    WELL_LEVEL,
                    featureColor);
            }
        }
    }

    return parsingConfig;
};


TestUtilities.arrayContainsElement = function(array, element){
    for (var i=0; i<array.length; i++){
        if (array[i] === element){
            return true;
        }
    }

    return false;
};

TestUtilities.arraysContainSameElements = function(array1, array2){
    if (array1.length !== array2.length){
        return false;
    }

    for (var i=0; i<array1.length; i++){
        var element = array1[i];

        if (!TestUtilities.arrayContainsElement(array2, element)){
            return false;
        }
    }
    return true;
};