/**
 * Created by zacharymartin on 3/19/15.
 */

// Some constants for row letter labeling
var ROW_HEAD_BASE = 26;
var STARTING_CHAR_CODE = 65;

var DRAG_SCROLL_BORDER_THRESHOLD_PX = 30;
var DRAG_SCROLL_AMOUNT = 20;

/**
 * Grid Objects! The constructor takes the id of the container element in which the grid
 * will be displayed, this element is most likely a div and must have its dimensions
 * specified along the lines of
 * @param containerID
 * @constructor
 */
function Grid(containerID){
    var _self = this;
    this.matrix = null;
    this.data = null;
    this.colsSize =-1;
    this.rowsSize =-1;
    this.grid = null;
    this.selectedCellsCallBacks = [];
    this.colorCounter = 0;
    this.container = containerID;
    this.highlightedCellsByColor = {};
    this.highlightedCellsByKey = {};
    this.keyToColor = {};

    // current selected cells fields
    this.selectedStartRow = null;
    this.selectedEndRow = null;
    this.selectedStartCol = null;
    this.selectedEndCol = null;

    /**
     * A setter for the dataset to display in the grid. The underlying SlickGrid object
     * will keep a reference to this data object after the fillUpGrid method is called, so
     * to reset the entire displayed data set, you must call fillUpGrid after using this
     * method, in order to
     * @param data
     */
    this.setData = function(data){
        this.data = data;

        var values = data2matrix(data);

        this.matrix = values[0];
        this.rowsSize = values[1];
        this.colsSize = values[2];

        // reset highlight tracking
        this.highlightedCellsByColor = {};
        this.highlightedCellsByKey = {};
        this.keyToColor = {};
    };



    /**
     * This function creates a new SlickGrid in the constructor specified container with
     * the set data using the setData method.
     */
    this.fillUpGrid = function() {

        var columns = [];

        var options = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            numberOfColumnsToFreeze: 1
        };

        // create column labels, starting with column for the row labels
        columns.push({
            id: "0",
            name: "0",
            field: "0",
            width: 30,
            resizable: true,
            selectable: false,
            focusable: false
        });
        for (var k = 1; k <= this.colsSize; k++) {
            columns.push({
                id: k.toString(),
                name: k.toString(),
                field: k.toString(),
                width: 60
            });
        }

        if (this.grid){
            document.getElementById(containerID).innerHTML="";
            this.grid.invalidate();
        }

        this.grid = new Slick.Grid("#"+containerID, this.matrix, columns, options);

        var selectionModel = new Slick.CellSelectionModel();
        this.grid.setSelectionModel(selectionModel);
        selectionModel.onSelectedRangesChanged.subscribe(updateSelectedCells);

        $("#" + this.container).mousemove(handleMousemove);
    };

    /**
     * This method changes the displayed contents of a cell to something new
     * @param row - the row number of the cell to be changed (note that the column number
     *          labels row is considered row 0 but it cannot be changed)
     * @param column - - the column number of the cell to be changed (note that the row
     *          letter labels column is considered column is considered column 0, it
     *          can be changed, but I don't recommend it)
     * @param newContents - the new value the cell should display
     */
    this.updateCellContents = function(row, column, newContents){
        this.matrix[row-1][column.toString()] = newContents;
        this.grid.invalidateRow(row-1);
        this.grid.render();
    };

    /**
     * This method changes the displayed contents of multiple cells in the grid in one go.
     * It saves on re-rendering and should make multiple cell changes quicker than just
     * calling updateCellContents repeatedly
     * @param rowColNewContentArray an array of arrays, where the inner arrays have the
     *          form [row, column, newContents] where
     *              row - the row number of a cell to be changed (note that the column
     *                  number labels row is considered row 0 but it cannot be changed)
     *              column - - the column number of the cell to be changed (note that the
     *                  row letter labels column is considered column is considered column
     *                  0, it can be changed, but I don't recommend it)
     *              newContents - the new value the cell should display
     *
     *          These inner arrays represent one cell displayed value change
     */
    this.updateMultipleCellContents = function(rowColNewContentArray){
        for(var i=0; i<rowColNewContentArray.length; i++){
            var row = rowColNewContentArray[0];
            var column = rowColNewContentArray[1];
            var newContents = rowColNewContentArray[2];

            this.matrix[row-1][column.toString()] = newContents;
            this.grid.invalidateRow(row-1);
        }

        this.grid.render();
    };

    /**
     * This function sets the background color of a set of cells.
     * @param coordinates - an array of coordinates on the grid for which the background
     *                  color change should be made. These coordinates are arrays of
     *                  length 2 of the form [row, column]
     * @param color - the string hex representation of the desired background color for
     *              the cells
     * @param key - a string key, that can latter be used to undo the background color
     *              change using the removeCellColors method. Note that this method cannot
     *              be called more than once with the same key.
     */
    this.setCellColors = function (coordinates, color, key){
        var style = document.createElement('style');
        color = color.toUpperCase();

        style.type = 'text/css';
        style.innerHTML = '.highlight'+this.colorCounter+' { background-color: ' + color +'; }';
        document.getElementsByTagName('head')[0].appendChild(style);

        var changes = {};
        for (var i=0; i<coordinates.length; i++){
            var row = coordinates[i][0] - 1;
            var column = coordinates[i][1];

            if(!changes[row]){
                changes[row] = {};
            }

            changes[row][column] = "highlight"+this.colorCounter;
        }

        this.grid.invalidateRow(row);
        this.grid.addCellCssStyles(key, changes);
        this.grid.render();

        if (!this.highlightedCellsByColor[color]){
            this.highlightedCellsByColor[color] = [];
        }
        this.highlightedCellsByKey[key] = [];
        this.keyToColor[key] = color;

        var currentSelectedCells = this.getSelectedCells();

        for (var j=0; j<currentSelectedCells.length; j++){

            if (-1 === Grid.coordinateArrayIndexOf(this.highlightedCellsByColor[color],
                    currentSelectedCells[j]) ){
                this.highlightedCellsByColor[color].push(currentSelectedCells[j]);
            }

            this.highlightedCellsByKey[key].push(currentSelectedCells[j]);
        }

        this.colorCounter++;
    };

    /**
     * This function un-does a cell set background color change done by the setCellColors
     * method. The change that is un-done is determined by the key that was used to do the
     * color change in the first place.
     * @param key - the key used to make the color change in the first place, that is to
     *              be un-done
     */
    this.removeCellColors = function(key){
        this.grid.removeCellCssStyles(key);

        cellsToRemoveColor = this.highlightedCellsByKey[key];
        if (cellsToRemoveColor) {
            colorToRemove = this.keyToColor[key];

            for(var i=0; i<cellsToRemoveColor.length; i++){
                var index = Grid.coordinateArrayIndexOf(
                    this.highlightedCellsByColor[colorToRemove],
                    cellsToRemoveColor[i]);
                this.highlightedCellsByColor[colorToRemove].splice(index,1);
            }

            this.highlightedCellsByKey[key] = null;
            this.keyToColor[key] = null;
        }
    };

    /**
     * This function returns the currently selected cell bounds in the form of an array
     * where the:
     *      0th position - holds the start cell row number
     *      1st position - holds the start cell column number
     *      2nd position - holds the end cell row number
     *      3rd position - holds the end cell column number
     * @returns {*[]} - the bounds of the currently selected cells in the grid
     */
    this.getSelectedCellBounds = function(){
        return [this.selectedStartRow,
                this.selectedStartCol,
                this.selectedEndRow,
                this.selectedEndCol
               ];
    };

    /**
     * This function returns an array of all of the cell coordinates that are currently
     * selected, where the coordinates are arrays of the form [rowNumber, columnNumber].
     * @returns {Array|*} - an array of arrays where the inner arrays are the coordinates
     * of selected cells.
     */
    this.getSelectedCells = function(){
        result = [];

        for(var i=this.selectedStartRow; i<=this.selectedEndRow; i++){
            for(var j=this.selectedStartCol; j<=this.selectedEndCol; j++){
                result.push([i,j]);
            }
        }

        return result;
    };


    /**
     * This function returns an array of all of the cell coordinates that are currently
     * highlighted by color, where the coordinates are arrays of the form
     *              [rowNumber, columnNumber]
     * If this method is called with no argument color, then all highlighted cell
     * coordinates regardless of color are returned.
     * @param color - the color of the highlighted cells whose coordinates are to be found
     * @returns {*} - an array of the coordinates of all highlighted cells of the
     *          specified color, unless no color is specified and then all of the
     *          highlighted cell coordinates are returned regardless of color
     */
    this.getHighlightedCells = function(color){
        color = color.toUpperCase();

        if (color) {
            if (this.highlightedCellsByColor[color]){
                return this.highlightedCellsByColor[color];
            } else {
                return [];
            }
        } else {
            var result = [];

            for (var key in this.highlightedCellsByColor){
                if (this.highlightedCellsByColor[key]
                    && this.highlightedCellsByColor[key].length){
                    for (var i=0; i<this.highlightedCellsByColor[key].length; i++){
                        result.push(this.highlightedCellsByColor[key][i]);
                    }
                }
            }

            return result;
        }
    };


    /**
     * This function registers a function to be called in an observer type pattern,
     * whenever a new set of cells is selected in the grid. The callback function is
     * expected to have four parameters in the following order: startRow, startCol,
     * endRow, endCol where:
     *      startRow - is the row number of the upper left cell bounding the selected
     *          cells
     *      startCol - is the column number of the upper left cell bounding the selected
     *          cells
     *      endRow - is the row number of the lower right cell bounding the selected cells
     *      endCol - is the column number of the lower right cell bounding the selected
     *          cells
     * @param callBack - a function to be called in the event of a change of selected
     *              cells, with the parameters as listed above
     */
    this.registerSelectedCellCallBack = function(callBack){
        this.selectedCellsCallBacks.push(callBack);
    };

    this.getDataPoint = function(row, column){
      return this.grid.getDataItem(row-1)[column.toString()];
    };

    /**
     * A private method for converting a 2D data array to the array containing
     * row objects format required by SlickGrid
     * @param data - a 2D array containing data to be converted to SlickGrid data format
     */
    function data2matrix(data) {
        var result = [];
        var rows = data.length;
        var cols = -1;

        for(var j = 0; j<rows; j++){

            var information = data[j];

            if (information.length > cols){
                cols = information.length;
            }

            result[j] = {};

            // add in row headers
            result[j]["0"] = Grid.getRowLabel(j+1);

            for(var k = 1; k <= information.length; k++){
                result[j][k.toString()] = information[k-1];
            }
        }



        return [result, rows, cols];
    }

    /**
     * A private method for calling all of the registered observer functions with the
     * startRow, startCol, endRow, endCol arguments for the event that the selected
     * cells on the grid have changed. This function itself is an event handler
     * for the onSelectedCellsChanged event in the SlickGrid library for
     * cellselectionmodel
     * @param event - the event
     * @param data - the object containing the selected cell range data
     */
    function updateSelectedCells(event, data){
        _self.selectedStartRow = data[0].fromRow + 1;
        _self.selectedStartCol = data[0].fromCell;
        _self.selectedEndRow = data[0].toRow + 1;
        _self.selectedEndCol = data[0].toCell;

        _self.selectedCellsCallBacks.forEach(function(element){
           if (data[0].toCell != 0 && data[0].fromCell != 0){
               element(_self.selectedStartRow,
                       _self.selectedStartCol,
                       _self.selectedEndRow,
                       _self.selectedEndCol
               )
           }
        });
    }

    /**
     * This private function handles mouse move events for scrolling the grid when
     * cell selections are dragged to the edges of the viewport.
     * @param e - the mouse move event
     */
    function handleMousemove(e){
        var containerOffset = $(this).offset();
        var jqueryContainer = $("#" + _self.container);
        var jqueryViewport = $(".slick-viewport");
        var distToLeftBorder = e.pageX - containerOffset.left;
        var distToRightBorder = containerOffset.left + jqueryContainer.width() - e.pageX;
        var distToTopBorder = e.pageY - containerOffset.top;
        var distToBottomBorder = containerOffset.top + jqueryContainer.height() - e.pageY;

        e = e || window.event;
        var mouseButton = (typeof e.buttons != "undefined") ? e.buttons : e.which;

        if (mouseButton == 1){

            if (distToLeftBorder < DRAG_SCROLL_BORDER_THRESHOLD_PX) {
                jqueryViewport.scrollLeft(jqueryViewport.scrollLeft() - DRAG_SCROLL_AMOUNT);
            }

            if (distToRightBorder < DRAG_SCROLL_BORDER_THRESHOLD_PX) {
                jqueryViewport.scrollLeft(jqueryViewport.scrollLeft() + DRAG_SCROLL_AMOUNT);
            }

            if (distToTopBorder < DRAG_SCROLL_BORDER_THRESHOLD_PX) {
                jqueryViewport.scrollTop(jqueryViewport.scrollTop() - DRAG_SCROLL_AMOUNT);
            }

            if (distToBottomBorder < DRAG_SCROLL_BORDER_THRESHOLD_PX) {
                jqueryViewport.scrollTop(jqueryViewport.scrollTop() + DRAG_SCROLL_AMOUNT);
            }
        }
    }
}

/**
 * A "Static" convenience method on the Grid class that converts a row number to a row
 * label letter. Note that 0->"", 1 -> "A", 2->"B", etc. This function is the inverse of
 * the getRowNumber method.
 * @param number - the row number to convert to a letter label
 * @returns {string} - the row label
 */
Grid.getRowLabel = function(number) {
    "use strict";

    if (number < 0 || number % 1 !== 0) {
        return "";
    }

    var label = "";
    var remainder;

    while (number > 0) {
        remainder = (number - 1) % 26;
        label = String.fromCharCode(STARTING_CHAR_CODE + remainder) + label;
        number = Math.floor((number - remainder) / ROW_HEAD_BASE);
    }

    return label;
};

/**
 * A "Static" convenience method on the Grid class that converts a row label letter to a
 * row number. Note that ""->0, "A"-> 1, "B"-> 2, etc. This function is the inverse of
 * the getRowLabel method.
 * @param label - the row label letter to convert to a row number.
 * @returns {number}
 */
Grid.getRowNumber = function(label) {
    "use strict";

    if (label === "") {
        return 0;
    }

    var number = 0;
    label = label.toUpperCase();
    for(var i=0; i < label.length; i++) {
        number *= ROW_HEAD_BASE;
        number += label.charCodeAt(i) - STARTING_CHAR_CODE + 1 ;
    }

    return number;
};

Grid.getCellCoordinates = function(label){
    label.trim();
    var indexOfFirstNumericChar = -1;

    // first find the index of the first numeric value
    for (var i=0; i<label.length; i++){
        if (isFinite(label.charAt(i))){
            indexOfFirstNumericChar = i;
            break;
        }
    }

    var row = label.substring(0, indexOfFirstNumericChar);
     row = Grid.getRowNumber(row);
    var col = parseInt(label.substring(indexOfFirstNumericChar));

    return [row, col];
};


Grid.coordinateArrayIndexOf = function(coordinateArray, coordinatesToSearchFor){

    for(var i=0; i<coordinateArray.length; i++){
        if (coordinateArray[i][0] === coordinatesToSearchFor[0]
            && coordinateArray[i][1] === coordinatesToSearchFor[1]){
            return i;
        }
    }

    return -1;
};