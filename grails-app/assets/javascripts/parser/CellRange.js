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
 * @author Team SurNorte
 * CSCI-E99
 * May 7, 2015
 */

function CellRange(startRow, startCol, endRow, endCol){
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
        }
    }
}