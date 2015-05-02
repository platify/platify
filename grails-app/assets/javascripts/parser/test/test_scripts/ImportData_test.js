/**
 * Created by zacharymartin on 5/1/15.
 */

QUnit.module("ImportData", {
    beforeEach: function(){

    },
    afterEach: function(){

    }
});

test('ImportData constructor errors', function(assert) {
    var importData;

    try{
        importData = new ImportData(-1, 1, 1);
        assert.ok(false, "A NEGATIVE_NUMBER_OF_PLATES error should have been thrown.");
    } catch (error) {
        assert.ok(error.type = ImportDataError.NEGATIVE_NUMBER_OF_PLATES,
            "A NEGATIVE_NUMBER_OF_PLATES error should have been thrown, but a(n) "
            + error.type + " error was thrown instead.");
    }

    try{
        importData = new ImportData(1, -1, 1);
        assert.ok(false, "A NEGATIVE_NUMBER_OF_ROWS error should have been thrown.");
    } catch (error) {
        assert.ok(error.type = ImportDataError.NEGATIVE_NUMBER_OF_ROWS,
            "A NEGATIVE_NUMBER_OF_ROWS error should have been thrown, but a(n) "
            + error.type + " error was thrown instead.");
    }

    try{
        importData = new ImportData(1, 1, -1);
        assert.ok(false, "A NEGATIVE_NUMBER_OF_COLUMNS error should have been thrown.");
    } catch (error) {
        assert.ok(error.type = ImportDataError.NEGATIVE_NUMBER_OF_COLUMNS,
            "A NEGATIVE_NUMBER_OF_COLUMNS error should have been thrown, but a(n) "
            + error.type + " error was thrown instead.");
    }
});

test("ImportData constructor", function(assert){
    var importData;

    var constructorTestArgs = [
        // [numPlates, numRows, numColumns]
        [0, 0, 0],
        [1,0,0],
        [1,1,0],
        [1,0,1],
        [1,10,10],
        [1,20,40],
        [2,10,10],
        [2,20,40],
        [2,1000,1000],
        [100,10,10],
        [100,20,40],
        [1000,10,10],
        [24,16,24],
        [4,8,12],
        [7,23,98],
        [3,47,2],
        [8,9,2],
        [10000,2,3],
        [1,1,1]
    ];

    for (var i=0; i<constructorTestArgs.length; i++){
        var numPlates = constructorTestArgs[i][0];
        var numRows = constructorTestArgs[i][1];
        var numCols = constructorTestArgs[i][2];

        importData = new ImportData(numPlates, numRows, numCols);
        assert.ok(importData, "An ImportData object should have been constructed.");
        assert.ok(importData.numPlates() === numPlates,
            "The ImportData object should have " + numPlates + " plates");
        assert.ok(importData.numberOfPlateRows() === numRows,
            "The ImportData object should have " + numRows + " rows.");
        assert.ok(importData.numberOfPlateColumns() === numCols,
            "The ImportData object should have " + numCols + " columns.");
    }
});


test("get and set experiment ID", function(assert){
    var importData;

    var constructorTestArgs = [
        // [numPlates, numRows, numColumns]
        [0, 0, 0],
        [1,0,0],
        [1,1,0],
        [1,0,1],
        [1,10,10],
        [1,20,40],
        [2,10,10],
        [2,20,40],
        [2,1000,1000],
        [100,10,10],
        [100,20,40],
        [1000,10,10],
        [24,16,24],
        [4,8,12],
        [7,23,98],
        [3,47,2],
        [8,9,2],
        [10000,2,3],
        [1,1,1]
    ];

    for (var i=0; i<constructorTestArgs.length; i++){
        var numPlates = constructorTestArgs[i][0];
        var numRows = constructorTestArgs[i][1];
        var numCols = constructorTestArgs[i][2];
        var id = undefined;

        importData = new ImportData(numPlates, numRows, numCols);

        assert.ok(importData.getExperimentID() === ImportData.NO_ID,
            "The experiment ID should initially equal NO_ID");

        try {
            importData.setExperimentID(id);
            assert.ok(false,
                "An INVALID_EXPERIMENT_ID error should be thrown for an undefined ID.");
        } catch (error){
            assert.ok(error.type === ImportDataError.INVALID_EXPERIMENT_ID,
                "An INVALID_EXPERIMENT_ID error should be thrown for an undefined ID but"+
                " an " + error.type + " error was thrown instead.");
        }

        id = null;

        try {
            importData.setExperimentID(id);
            assert.ok(false,
                "An INVALID_EXPERIMENT_ID error should be thrown for a null ID.");
        } catch (error){
            assert.ok(error.type === ImportDataError.INVALID_EXPERIMENT_ID,
                "An INVALID_EXPERIMENT_ID error should be thrown for a null ID but"+
                " an " + error.type + " error was thrown instead.");
        }

        id = "";

        try {
            importData.setExperimentID(id);
            assert.ok(false,
                "An INVALID_EXPERIMENT_ID error should be thrown for an empty string " +
                "ID.");
        } catch (error){
            assert.ok(error.type === ImportDataError.INVALID_EXPERIMENT_ID,
                "An INVALID_EXPERIMENT_ID error should be thrown for an empty string ID "+
                "but an " + error.type + " error was thrown instead.");
        }

        var testIDs = [0, 1 , 23, 4020240, -3, -3843, "348348", "0", ImportData.NO_ID,
        "dsffjsak;fj;sdfk;aekrk;asjkfjkwerj;rj341jkef;kjdsf", "testID"];

        for (var j=0; j<testIDs.length; j++){
            id = testIDs[j];
            importData.setExperimentID(id);
            assert.ok(importData.getExperimentID() == id,
                "The experiment ID should be " + id + ".");
        }

    }
});

test("get and set parsing ID", function(assert){
    var importData;

    var constructorTestArgs = [
        // [numPlates, numRows, numColumns]
        [0, 0, 0],
        [1,0,0],
        [1,1,0],
        [1,0,1],
        [1,10,10],
        [1,20,40],
        [2,10,10],
        [2,20,40],
        [2,1000,1000],
        [100,10,10],
        [100,20,40],
        [1000,10,10],
        [24,16,24],
        [4,8,12],
        [7,23,98],
        [3,47,2],
        [8,9,2],
        [10000,2,3],
        [1,1,1]
    ];

    for (var i=0; i<constructorTestArgs.length; i++){
        var numPlates = constructorTestArgs[i][0];
        var numRows = constructorTestArgs[i][1];
        var numCols = constructorTestArgs[i][2];
        var id = undefined;

        importData = new ImportData(numPlates, numRows, numCols);

        assert.ok(importData.getParsingID() === ImportData.NO_ID,
            "The parsing ID should initially equal NO_ID");

        try {
            importData.setParsingID(id);
            assert.ok(false,
                "An INVALID_PARSING_ID error should be thrown for an undefined ID.");
        } catch (error){
            assert.ok(error.type === ImportDataError.INVALID_PARSING_ID,
                "An INVALID_PARSING_ID error should be thrown for an undefined ID but"+
                " an " + error.type + " error was thrown instead.");
        }

        id = null;

        try {
            importData.setParsingID(id);
            assert.ok(false,
                "An INVALID_PARSING_ID error should be thrown for a null ID.");
        } catch (error){
            assert.ok(error.type === ImportDataError.INVALID_PARSING_ID,
                "An INVALID_PARSING_ID error should be thrown for a null ID but"+
                " an " + error.type + " error was thrown instead.");
        }

        id = "";

        try {
            importData.setParsingID(id);
            assert.ok(false,
                "An INVALID_PARSING_ID error should be thrown for an empty string " +
                "ID.");
        } catch (error){
            assert.ok(error.type === ImportDataError.INVALID_PARSING_ID,
                "An INVALID_PARSING_ID error should be thrown for an empty string ID "+
                "but an " + error.type + " error was thrown instead.");
        }

        var testIDs = [0, 1 , 23, 4020240, -3, -3843, "348348", "0", ImportData.NO_ID,
            "dsffjsak;fj;sdfk;aekrk;asjkfjkwerj;rj341jkef;kjdsf", "testID"];

        for (var j=0; j<testIDs.length; j++){
            id = testIDs[j];
            importData.setParsingID(id);
            assert.ok(importData.getParsingID() == id,
                "The parsing ID should be " + id + ".");
        }

    }
});

test("add categories errors", function(assert){
    var j;
    var category;

    for (var i=0; i<20; i++){
        var importData = TestUtilities.getRandomImportDataObject();
        var wellLevelCategories = importData.getWellLevelCategories();
        var plateLevelCategories = importData.getPlateLevelCategories();
        var experimentLevelCategories = importData.getExperimentLevelCategories();

        try{
            importData.addWellLevelCategory(undefined, true);
            assert.ok(false, "Adding an undefined category should throw a " +
            "ILLEGAL_ARGUMENT error.");
        } catch (error){
            assert.ok(error.type = ImportDataError.ILLEGAL_ARGUMENT,
                "Adding an undefined category should throw a " +
                "ILLEGAL_ARGUMENT error.")
        }

        try{
            importData.addWellLevelCategory(null, true);
            assert.ok(false, "Adding a null category should throw a " +
            "ILLEGAL_ARGUMENT error.");
        } catch (error){
            assert.ok(error.type = ImportDataError.ILLEGAL_ARGUMENT,
                "Adding a null category should throw a " +
                "ILLEGAL_ARGUMENT error.")
        }

        try{
            importData.addWellLevelCategory("", true);
            assert.ok(false, "Adding an empty string category should throw a " +
            "ILLEGAL_ARGUMENT error.");
        } catch (error){
            assert.ok(error.type = ImportDataError.ILLEGAL_ARGUMENT,
                "Adding an empty string category should throw a " +
                "ILLEGAL_ARGUMENT error.")
        }

        for (j=0; j<wellLevelCategories.length; j++){
            category = wellLevelCategories[j];
            try{
                importData.addWellLevelCategory(category, true);
                assert.ok(false, "Adding a category that already exists should throw a " +
                "CATEGORY_ALREADY_DEFINED error.");
            } catch (error){
                assert.ok(error.type = ImportDataError.CATEGORY_ALREADY_DEFINED,
                    "Adding a category that already exists should throw a " +
                    "CATEGORY_ALREADY_DEFINED error.")
            }
        }

        try{
            importData.addPlateLevelCategory(undefined);
            assert.ok(false, "Adding an undefined category should throw a " +
            "ILLEGAL_ARGUMENT error.");
        } catch (error){
            assert.ok(error.type = ImportDataError.ILLEGAL_ARGUMENT,
                "Adding an undefined category should throw a " +
                "ILLEGAL_ARGUMENT error.")
        }

        try{
            importData.addPlateLevelCategory(null);
            assert.ok(false, "Adding a null category should throw a " +
            "ILLEGAL_ARGUMENT error.");
        } catch (error){
            assert.ok(error.type = ImportDataError.ILLEGAL_ARGUMENT,
                "Adding a null category should throw a " +
                "ILLEGAL_ARGUMENT error.")
        }

        try{
            importData.addPlateLevelCategory("");
            assert.ok(false, "Adding an empty string category should throw a " +
            "ILLEGAL_ARGUMENT error.");
        } catch (error){
            assert.ok(error.type = ImportDataError.ILLEGAL_ARGUMENT,
                "Adding an empty string category should throw a " +
                "ILLEGAL_ARGUMENT error.")
        }

        for (j=0; j<plateLevelCategories.length; j++){
            category = plateLevelCategories[j];
            try{
                importData.addPlateLevelCategory(category);
                assert.ok(false, "Adding a category that already exists should throw a " +
                "CATEGORY_ALREADY_DEFINED error.");
            } catch (error){
                assert.ok(error.type = ImportDataError.CATEGORY_ALREADY_DEFINED,
                    "Adding a category that already exists should throw a " +
                    "CATEGORY_ALREADY_DEFINED error.")
            }
        }

        try{
            importData.addExperimentLevelCategory(undefined);
            assert.ok(false, "Adding an undefined category should throw a " +
            "ILLEGAL_ARGUMENT error.");
        } catch (error){
            assert.ok(error.type = ImportDataError.ILLEGAL_ARGUMENT,
                "Adding an undefined category should throw a " +
                "ILLEGAL_ARGUMENT error.")
        }

        try{
            importData.addExperimentLevelCategory(null);
            assert.ok(false, "Adding a null category should throw a " +
            "ILLEGAL_ARGUMENT error.");
        } catch (error){
            assert.ok(error.type = ImportDataError.ILLEGAL_ARGUMENT,
                "Adding a null category should throw a " +
                "ILLEGAL_ARGUMENT error.")
        }

        try{
            importData.addExperimentLevelCategory("");
            assert.ok(false, "Adding an empty string category should throw a " +
            "ILLEGAL_ARGUMENT error.");
        } catch (error){
            assert.ok(error.type = ImportDataError.ILLEGAL_ARGUMENT,
                "Adding an empty string category should throw a " +
                "ILLEGAL_ARGUMENT error.")
        }

        for (j=0; j<experimentLevelCategories.length; j++){
            category = experimentLevelCategories[j];
            try{
                importData.addExperimentLevelCategory(category);
                assert.ok(false, "Adding a category that already exists should throw a " +
                "CATEGORY_ALREADY_DEFINED error.");
            } catch (error){
                assert.ok(error.type = ImportDataError.CATEGORY_ALREADY_DEFINED,
                    "Adding a category that already exists should throw a " +
                    "CATEGORY_ALREADY_DEFINED error.")
            }
        }
    }
});


test("add categories", function(assert){
    var j;
    var category;
    var numeric;

    for (var i=0; i<10; i++){
        var importData = TestUtilities.getRandomImportDataObject();
        var wellLevelCategories = importData.getWellLevelCategories();
        var plateLevelCategories = importData.getPlateLevelCategories();
        var experimentLevelCategories = importData.getExperimentLevelCategories();

        for (j=0; j<10; j++){
            category = TestUtilities.getRandomString(1, 16);
            numeric = TestUtilities.getRandomInt(0,1);

            if (!TestUtilities.arrayContainsElement(wellLevelCategories, category)){
                importData.addWellLevelCategory(category, numeric);
                wellLevelCategories.push(category);
            }
        }

        assert.ok(TestUtilities.arraysContainSameElements(
                                                     importData.getWellLevelCategories(),
                                                     wellLevelCategories),
            "The import data object should have all of the categories that were added.");

        for (j=0; j<10; j++){
            category = TestUtilities.getRandomString(1, 16);

            if (!TestUtilities.arrayContainsElement(plateLevelCategories, category)){
                importData.addPlateLevelCategory(category);
                plateLevelCategories.push(category);
            }
        }

        assert.ok(TestUtilities.arraysContainSameElements(
                importData.getPlateLevelCategories(),
                plateLevelCategories),
            "The import data object should have all of the categories that were added.");

        for (j=0; j<10; j++){
            category = TestUtilities.getRandomString(1, 16);

            if (!TestUtilities.arrayContainsElement(experimentLevelCategories, category)){
                importData.addExperimentLevelCategory(category);
                experimentLevelCategories.push(category);
            }
        }

        assert.ok(TestUtilities.arraysContainSameElements(
                importData.getExperimentLevelCategories(),
                experimentLevelCategories),
            "The import data object should have all of the categories that were added.");
    }
});


test("remove categories", function(assert){
    var j;
    var category;
    var length;

    for (var i=0; i<10; i++){
        var importData = TestUtilities.getRandomImportDataObject();
        var wellLevelCategories = importData.getWellLevelCategories();
        var plateLevelCategories = importData.getPlateLevelCategories();
        var experimentLevelCategories = importData.getExperimentLevelCategories();

        length = wellLevelCategories.length;
        for (j=0; j<length; j++){
            category = wellLevelCategories.pop();

            importData.removeWellLevelCategory(category);
            assert.ok(TestUtilities.arraysContainSameElements(
                                                      importData.getWellLevelCategories(),
                                                      wellLevelCategories),
                "The category " + category + "should be removed from the ImportData" +
                " object at the well level.");
        }

        length = plateLevelCategories.length;
        for (j=0; j<length; j++){
            category = plateLevelCategories.pop();

            importData.removePlateLevelCategory(category);
            assert.ok(TestUtilities.arraysContainSameElements(
                    importData.getPlateLevelCategories(),
                    plateLevelCategories),
                "The category " + category + "should be removed from the ImportData" +
                " object at the plate level.");
        }

        length = experimentLevelCategories.length;
        for (j=0; j<length; j++){
            category = experimentLevelCategories.pop();

            importData.removeExperimentLevelCategory(category);
            assert.ok(TestUtilities.arraysContainSameElements(
                    importData.getExperimentLevelCategories(),
                    experimentLevelCategories),
                "The category " + category + "should be removed from the ImportData" +
                " object at the experiment level.");
        }

    }
});


test("Convert to DTO and back", function(assert){

    for (var i=0; i<10; i++){
        var importData = TestUtilities.getRandomImportDataObject();
        assert.ok(importData);

        var DTO = importData.getJSONImportDataObject();
        var reconstitutedImportData = ImportData.createImportDataObjectFromJSON(DTO);

        assert.deepEqual(importData, reconstitutedImportData,
            "A reconstituted ImportData object should be the same as the original.");
    }
});