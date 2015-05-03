/**
 * Created by zacharymartin on 4/13/15.
 */

function GridHighlighter(grid){
    var _self = this;

    this.grid = grid;

    var colorKeyCounter = 0;
    var plateHighlightKeys = [];
    var featureHighlightKeys = [];
    var selectionHighlightKeys = [];

    this.selectCellsInRange = function(range, color){
        if (range.startRow < 1
                || range.endRow > _self.grid.getNumberOfRows()
                || range.startCol < 1
                || range.endCol > _self.grid.getNumberOfColumns()) {
            throw new GridHighlighterError(GridHighlighterError.RANGE_OUTSIDE_GRID_BOUNDS,
                                           "select cells in a range");
        }

        // highlight selected cells with the current color
        var coordinatesToHighlight = [];
        for (var i=range.startRow; i<=range.endRow; i++){
            for (var j=range.startCol; j<=range.endCol; j++){
                coordinatesToHighlight.push([i,j]);
            }
        }
        var colorKey = getDistinctColorKey();

        this.grid.setCellColors(coordinatesToHighlight,
                           color,
                           colorKey);
        selectionHighlightKeys.push(colorKey);
    };


    this.highlightPlatesAndFeatures = function(parsingConfig, plates){
        // first highlight plates
        this.highlightAllPlates(plates);

        // next highlight features
        this.highlightAllFeatures(parsingConfig, plates);
    };

    this.highlightPlate = function(plateIndex, plates){
        var colorKey;

        var plateRange =plates[plateIndex];
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
                                ColorPicker.PLATE_COLOR,
                                colorKey);

        plateHighlightKeys.push(colorKey);
    };

    this.highlightAllPlates = function(plates){

        // highlight all plates
        for (var plateIndex = 0; plateIndex < plates.length; plateIndex++){
            this.highlightPlate(plateIndex, plates);
        }

    };

    this.highlightFeature = function(featureName, parsingConfig, plates){
        var feature = parsingConfig.features[featureName];
        var colorKey = getDistinctColorKey();

        var coordsToHighlight = DataExtractor.getFeatureCoords(featureName,
                                                               plates,
                                                               parsingConfig);

        grid.setCellColors(coordsToHighlight,
            feature.color,
            colorKey);

        featureHighlightKeys.push(colorKey);
    };

    this.highlightAllFeatures = function(parsingConfig, plates){

        for(var featureName in parsingConfig.features){
            this.highlightFeature(featureName, parsingConfig, plates);
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

GridHighlighterError.RANGE_OUTSIDE_GRID_BOUNDS = "range outside grid bounds";


function GridHighlighterError(type, attemptedAction){
    this.type = type;
    this.attemptedAction = attemptedAction;

    this.getMessage = function(){
        if (this.type === GridHighlighterError.RANGE_OUTSIDE_GRID_BOUNDS){
            return "The given range is outside grid bounds.";
        }
    };
}