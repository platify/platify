/**
 * Created by zacharymartin on 5/5/15.
 */

QUnit.module("CellRange", {
    beforeEach: function(){

    },
    afterEach: function(){

    }
});

test("constructor errors", function(assert){
    var testArgs = [             //  elements of form [startRow, startCol, endRow, endCol]
        [NaN,null,undefined,""],
        ["4","5","6","7"],
        ["4", 5,6,7],
        [4, "5", 6, 7],
        [4, 5, "6", 7],
        [4, 5, 6, "7"],
        [-1,3,7,5],
        [1,-3,7,5],
        [1,3,-7,5],
        [1,3,7,-5],
        [-1,-3,7,5],
        [-1,3,-7,5],
        [-1,3,7,-5],
        [1,-3,-7,5],
        [1,-3,7,-5],
        [1,3,-7,-5],
        [1,-3,-7,-5],
        [-1,3,-7,-5],
        [-1,-3,7,-5],
        [-1,-3,-7,5],
        [-1,-3,-7,-5],
        [4,3,2,8],
        [3,9,8,7]
    ];

    for (var i=0; i<testArgs.length; i++){
        var startRow = testArgs[i][0];
        var startCol = testArgs[i][1];
        var endRow = testArgs[i][2];
        var endCol = testArgs[i][3];

        try {
            var cellRange = new CellRange(startRow, startCol, endRow, endCol);
            assert.ok(false, "An error should have been thrown");
        } catch (error) {
            assert.ok(error.type, "The error should have a type property");
            assert.ok(error.getMessage instanceof Function,
                "The error should have a getMessage function");
            assert.ok(typeof error.getMessage() === "string",
                "The get message function on the error should return a String");

            if (error.type === CellRangeError.ILLEGAL_ARGUMENT){
                assert.ok(!(typeof startRow === "number")
                    || !(typeof startCol === "number")
                    || !(typeof endRow === "number")
                    || !(typeof endCol === "number"),
                    "If the error type is ILLEGAL_ARGUMENT then one of the " +
                    "arguments should not be a number.");
            } else if (error.type === CellRangeError.NON_POSITIVE_COLUMN){
                assert.ok(startCol < CellRange.MINIMUM_VALUE
                    || endCol < CellRange.MINIMUM_VALUE,
                    "If the error type is NON_POSITIVE_COLUMN, then the start or end " +
                    "column should be less than MINIMUM_VALUE.");
            } else if (error.type === CellRangeError.NON_POSITIVE_ROW){
                assert.ok(startRow < CellRange.MINIMUM_VALUE
                    || endRow < CellRange.MINIMUM_VALUE,
                    "If the error type is NON_POSITIVE_ROW, then the start or end " +
                    "row should be less than MINIMUM_VALUE.");
            } else if (error.type === CellRangeError.STARTING_ROW_GREATER_THAN_ENDING_ROW){
                assert.ok(startRow > endRow,
                    "If the error type is STARTING_ROW_GREATER_THAN_ENDING_ROW, then " +
                    "the starting row should be greater than the ending row");
            } else if (error.type === CellRangeError.STARTING_COLUMN_GREATER_THAN_ENDING_COLUMN){
                assert.ok(startCol > endCol,
                    "If the error type is STARTING_COLUMN_GREATER_THAN_ENDING_COLUMN, " +
                    "then the starting column should be greater than the ending column");
            }
        }
    }
});

test("successful construction", function(assert){

    for (var i=0; i<100; i++){
        var startRow = TestUtilities.getRandomInt(1, 1000000);
        var startCol = TestUtilities.getRandomInt(1, 1000000);
        var endRow = TestUtilities.getRandomInt(startRow, 1000000);
        var endCol = TestUtilities.getRandomInt(startCol, 1000000);

        var cellRange = new CellRange(startRow, startCol, endRow, endCol);

        assert.ok(cellRange instanceof CellRange, "The constructor should return a CellRange object");
        assert.ok(typeof cellRange.startRow === "number", "The CellRange object should have a startRow property that is a number");
        assert.ok(typeof cellRange.startCol === "number", "The CellRange object should have a startCol property that is a number");
        assert.ok(typeof cellRange.endRow === "number", "The CellRange object should have a endRow property that is a number");
        assert.ok(typeof cellRange.endCol === "number", "The CellRange object should have a endCol property that is a number");
        assert.ok(cellRange.startRow === startRow, "The CellRange object should have a startRow property correctly set");
        assert.ok(cellRange.startCol === startCol, "The CellRange object should have a startCol property correctly set");
        assert.ok(cellRange.endRow === endRow, "The CellRange object should have a endRow property correctly set");
        assert.ok(cellRange.endCol === endCol, "The CellRange object should have a endCol property correctly set");
        assert.ok(cellRange.toString instanceof Function, "The CellRange object should have a toString function");
    }
});

test("to string", function(assert){
    for (var i=0; i<100; i++){
        var startRow = TestUtilities.getRandomInt(1, 1000000);
        var startCol = TestUtilities.getRandomInt(1, 1000000);
        var endRow = TestUtilities.getRandomInt(startRow, 1000000);
        var endCol = TestUtilities.getRandomInt(startCol, 1000000);

        var cellRange = new CellRange(startRow, startCol, endRow, endCol);

        var string = cellRange.toString();
        assert.ok(typeof string === "string", "toString should return a string.");
        var reconstitutedRange = ParserUI.convertStringToCellRange(string);

        assert.ok(cellRange.startRow === reconstitutedRange.startRow, "The start rows should be the same.");
        assert.ok(cellRange.startCol === reconstitutedRange.startCol, "The start columns should be the same.");
        assert.ok(cellRange.endRow === reconstitutedRange.endRow, "The end rows should be the same.");
        assert.ok(cellRange.endCol === reconstitutedRange.endCol, "The end columns should be the same.");
    }
});

