CellRange.MINIMUM_VALUE = 1;

/**
 * CellRange.js
 *
 * The constructor for CellRange objects. CellRange objects represent a rectangular
 * contiguous range of cells on the Grid.
 *
 * @param startRow
 * @param startCol
 * @param endRow
 * @param endCol
 * @constructor
 *
 * Note: - This constructor throws an ILLEGAL_ARGUMENT error if any of the given arguments
 *      is not a Number.
 *       - This constructor throws a NON_POSITIVE_ROW or NON_POSITIVE_COLUMN error if any
 *      of the given arguments is less than the MINIMUM_VALUE.
 *       - This constructor throws a STARTING_ROW_GREATER_THAN_ENDING_ROW error if the
 *       given starting row is greater than the given ending row.
 *       - This constructor throws a STARTING_COLUMN_GREATER_THAN_ENDING_COLUMN error if
 *       the given starting column is greater than the given ending column.
 *
 * @author Team SurNorte
 * CSCI-E99
 * May 7, 2015
 */

function CellRange(startRow, startCol, endRow, endCol){
    if (!(typeof startRow === "number")){
        throw new CellRangeError(CellRangeError.ILLEGAL_ARGUMENT,
                                 startRow,
                                 "start row",
                                 "construct a new CellRange object");
    }

    if (!(typeof startCol === "number")){
        throw new CellRangeError(CellRangeError.ILLEGAL_ARGUMENT,
            startCol,
            "start column",
            "construct a new CellRange object");
    }

    if (!(typeof endRow === "number")){
        throw new CellRangeError(CellRangeError.ILLEGAL_ARGUMENT,
            endRow,
            "end row",
            "construct a new CellRange object");
    }

    if (!(typeof endCol === "number")){
        throw new CellRangeError(CellRangeError.ILLEGAL_ARGUMENT,
            endCol,
            "end column",
            "construct a new CellRange object");
    }

    if (startRow < CellRange.MINIMUM_VALUE){
        throw new CellRangeError(CellRangeError.NON_POSITIVE_ROW,
                                 startRow,
                                 "start",
                                 "construct a new CellRange object")
    }

    if (endRow < CellRange.MINIMUM_VALUE){
        throw new CellRangeError(CellRangeError.NON_POSITIVE_ROW,
            endRow,
            "end",
            "construct a new CellRange object")
    }

    if (startCol < CellRange.MINIMUM_VALUE){
        throw new CellRangeError(CellRangeError.NON_POSITIVE_COLUMN,
            startCol,
            "start",
            "construct a new CellRange object")
    }

    if (endCol < CellRange.MINIMUM_VALUE){
        throw new CellRangeError(CellRangeError.NON_POSITIVE_COLUMN,
            endCol,
            "end",
            "construct a new CellRange object")
    }

    if (startRow > endRow){
        throw new CellRangeError(CellRangeError.STARTING_ROW_GREATER_THAN_ENDING_ROW,
                                 startRow,
                                 endRow,
                                 "construct a new CellRange object");
    }

    if (startCol > endCol) {
        throw new CellRangeError(CellRangeError.STARTING_COLUMN_GREATER_THAN_ENDING_COLUMN,
                                 startCol,
                                 endCol,
                                 "construct a new CellRange object");
    }

    this.startRow = startRow;
    this.startCol = startCol;
    this.endRow = endRow;
    this.endCol = endCol;


    /**
     * This override of the toString method, returns a string that list the cell range
     * in row letter, column number format. So for example if the calling CellRange object
     * has the following field values:
     *          startRow = 3
     *          startCol = 5
     *          endRow = 4
     *          endCol = 13
     * calling the toString method would return "C5:D13"
     * @returns {string} - the row letter, column number format string of the cell range
     */
    this.toString = function(){
        return Grid.getRowLabel(this.startRow) + this.startCol + ":"
            + Grid.getRowLabel(this.endRow) + this.endCol;
    }
}

// types of CellRangeErrors
CellRangeError.STARTING_ROW_GREATER_THAN_ENDING_ROW
    = "starting row greater than ending row";
CellRangeError.STARTING_COLUMN_GREATER_THAN_ENDING_COLUMN
    = "starting column greater than ending column";
CellRangeError.NON_POSITIVE_ROW = "non-positive row";
CellRangeError.NON_POSITIVE_COLUMN = "non-positive column";
CellRangeError.ILLEGAL_ARGUMENT = "illegal argument";

/**
 *
 * @param type
 * @param descriptor1
 * @param descriptor2
 * @param attemptedAction
 * @constructor
 */
function CellRangeError(type, descriptor1, descriptor2, attemptedAction){
    this.type = type;
    this.descriptor1 = descriptor1;
    this.descriptor2 = descriptor2;
    this.attemptedAction = attemptedAction;

    this.getMessage = function(){
        if (this.type === CellRangeError.STARTING_ROW_GREATER_THAN_ENDING_ROW) {
            return "The starting row cannot be greater than the ending row for a cell" +
                " range, in this case " + descriptor1 + " is greater than " + descriptor2
                + ".";
        } else if (this.type === CellRangeError.STARTING_COLUMN_GREATER_THAN_ENDING_COLUMN){
            return "The starting column cannot be greater than the ending column for a " +
                "cell range, in this case " + descriptor1 + " is greater than " +
                descriptor2 + ".";
        } else if (this.type === CellRangeError.NON_POSITIVE_ROW){
            return "Cell range row values must be greater than 0. The given "
                + this.descriptor2 + " row number, " + this.descriptor1
                + ", is less than 1.";
        } else if (this.type === CellRangeError.NON_POSITIVE_COLUMN){
            return "Cell range row values must be greater than 0. The given "
                + this.descriptor2 + " column " + "number, " + this.descriptor1
                + ", is less than 1.";
        } else if (this.type === CellRangeError.ILLEGAL_ARGUMENT){
            return "The given " + this.descriptor2 + " must be a number, \""
                + this.descriptor1
                + "\" is not an acceptable value to construct a new CellRange object."
        }
    }
}