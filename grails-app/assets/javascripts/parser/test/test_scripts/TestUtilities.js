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
    var name = TestUtilities.getRandomString(1, 16);
    var machine = TestUtilities.getRandomString(1, 16);
    var description = TestUtilities.getRandomString(1, 256);
    var delimiter = TestUtilities.getRandomString(1, 16);

    var parsingConfig = new ParsingConfig(name, machine, description, delimiter);


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