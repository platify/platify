// constants
var CELL_HEIGHT = 25;
var CELL_WIDTH = 40;
var DIMENSION = 100;

// globals
var data;
var grid;
var importData;


/**
 * A function that creates a blank data set for initializing the grid example
 * page. The data set is of dimension DIMENSION x DIMENSION.
 */
function createBlankData(){
  var result = [];

  for (var i=0; i<DIMENSION; i++){
    result[i] = [];
    for (var j=0; j<DIMENSION; j++){
      result[i][j] = null;
    }
  }

  return result;
}

function createGrid() {
    grid = new Grid('grid');
    data = createBlankData();
    grid.setData(data);
    grid.fillUpGrid(CELL_WIDTH, CELL_HEIGHT);
}

function init() {
    createGrid();
}

window.onload = init;
