/**
 * Created by zacharymartin on 4/13/15.
 */

function GridHighlighter(grid){

    this.grid = grid;

    var colorKeyCounter = 0;
    var plateHighlightKeys = [];
    var featureHighlightKeys = [];
    var selectionHighlightKeys = [];

    this.selectCellsInRange = function(range, color){
        // highlight selected cells with the current color
        var coordinatesToHighlight = [];
        for (var i=range.startRow; i<=range.endRow; i++){
            for (var j=range.startCol; j<=range.endCol; j++){
                coordinatesToHighlight.push([i,j]);
            }
        }
        var colorKey = getDistinctColorKey();

        grid.setCellColors(coordinatesToHighlight,
                           color,
                           colorKey);
        selectionHighlightKeys.push(colorKey);
    };


    this.highlightPlatesAndFeatures = function(parsingConfig){
        // first highlight plates
        this.highlightAllPlates(parsingConfig);

        // next highlight features
        this.highlightAllFeatures(parsingConfig);
    };

    this.highlightPlate = function(plateIndex, parsingConfig){
        var colorKey;

        var plateRange = parsingConfig.plates[plateIndex];
        var startRow = plateRange[0];
        var startCol = plateRange[1];
        var endRow = plateRange[2];
        var endCol = plateRange[3];
        colorKey = getDistinctColorKey();

        var coordsToHighlight = ParsingConfig.getCoordsInARange(startRow,
            startCol,
            endRow,
            endCol);

        this.grid.setCellColors(coordsToHighlight,
                            parsingConfig.plate.color,
                            colorKey);

        plateHighlightKeys.push(colorKey);
    };

    this.highlightAllPlates = function(parsingConfig){

        // highlight all plates
        for (var plateIndex = 0; plateIndex < parsingConfig.plates.length; plateIndex++){
            this.highlightPlate(plateIndex, parsingConfig);
        }

    };

    this.highlightFeature = function(featureName, parsingConfig){
        var feature = parsingConfig.features[featureName];
        var colorKey = getDistinctColorKey();

        var coordsToHighlight = parsingConfig.getFeatureCoords(featureName);

        grid.setCellColors(coordsToHighlight,
            feature.color,
            colorKey);

        featureHighlightKeys.push(colorKey);
    };

    this.highlightAllFeatures = function(parsingConfig){

        for(var featureName in parsingConfig.features){
            this.highlightFeature(featureName, parsingConfig);
        }
    };


    this.removeAllHighlighting = function(){
        this.removeSelectionHighlightKeys();
        this.removeAllFeatureHighlightKeys();
        this.removeAllPlateHighlightKeys();
    };

    this.removeSelectionHighlightKeys = function(){
        var length = selectionHighlightKeys.length;

        for(var i=0; i<length; i++){
            grid.removeCellColors(selectionHighlightKeys.pop());
        }
    };

    this.removeAllPlateHighlightKeys = function(){
        var length = plateHighlightKeys.length;

        for(var i=0; i<length; i++){
            grid.removeCellColors(plateHighlightKeys.pop());
        }
    };

    this.removeAllFeatureHighlightKeys = function(){
        var length = featureHighlightKeys.length;

        for(var i=0; i<length; i++){
            grid.removeCellColors(featureHighlightKeys.pop());
        }
    };


    function getDistinctColorKey(){
        var colorKey = "colorKey" + colorKeyCounter;
        colorKeyCounter++;
        return colorKey;
    }
}