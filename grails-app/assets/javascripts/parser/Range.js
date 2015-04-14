/**
 * Created by zacharymartin on 4/13/15.
 */

function Range(startRow, startCol, endRow, endCol){
    this.startRow = startRow;
    this.startCol = startCol;
    this.endRow = endRow;
    this.endCol = endCol;


    this.toString = function(){
        return Grid.getRowLabel(this.startRow) + this.startCol + ":"
            + Grid.getRowLabel(this.endRow) + this.endCol;
    }
}