/**
 * Created by zacharymartin on 4/13/15.
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


    this.toString = function(){
        return Grid.getRowLabel(this.startRow) + this.startCol + ":"
            + Grid.getRowLabel(this.endRow) + this.endCol;
    }
}

CellRangeError.STARTING_ROW_GREATER_THAN_ENDING_ROW
    = "starting row greater than ending row";
CellRangeError.STARTING_COLUMN_GREATER_THAN_ENDING_COLUMN
    = "starting column greater than ending column";

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