function DataVis(){
}

/**
 * Creates a color scale for the supplied parameters. Expects,
 *
 * params = {
     *   colorOne: the first color in the scale [defaults to "#edf8b1"],
     *   colorTwo: the second color in the scale [defaults to "#2c7fb8"],
     *   data: array of numbers that make up the scale [required]
     * }
 *
 * @param params The parameters which make up the scale.
 *
 * @returns a d3 linear color scale
 */
DataVis.prototype.colorScale =  function(params){

  // Hash defaults.
  var defaults = {
    data: null,
    colorOne: "#1f78b4",
    colorTwo: "#b2df8a"
  };
  $.extend(true, defaults, params );
  params = defaults;


  // Make sure params are complete.
  if(!params.data){
    throw "params.data is required";
  }

  // Create Scale.
  var min = d3.min(params.data);
  var max = d3.max(params.data);
  return {
    scale: d3.scale.linear().range([defaults.colorOne, defaults.colorTwo]).domain([min, max]),
    min: min,
    max: max
  };

};

/**
 * Render a single heat map from the supplied parameters in the supplied
 * location. Expects,
 *
 * params = {
 *    location: the location to render in [required: this must be a SVG element],
 *    data: the data to be used to render the heatmap [required, format follows],
 *    colorScale: the color scale to use to render the heat map [defaults to a default green scale]
 *    mapClass: the class of the parent svg.
 *    title: the title to be display [default to no title]
 *    mapFormat: {
 *      margin: margin around the heatmap [defaults 0],\
        fixedsize_x: fixes the x access of the heatmaps size [defaults to null and off],
        fixedsize_y: fixes the y access of the heatmaps size [defaults to null and off]
 *    },
 *    cellFormat:{
 *      cellMargin: the amount of margin around a cell [defaults to 1 px],
 *      cellSize: the size of a cell [defaults to 18 px].
 *    },
 *    onCellClick: a call back function for when the cell is clicked.
 *  }
 *
 * dataformat = {
     *  row: rowindex for the data point
     *  col: columnindex for the data point
     *  value: value of the data point
     *  included: whether or not this well is included
     * }
 *
 * @param params
 */
DataVis.prototype.renderSingleHeatMap = function(params){

  // Merge in defaults.
  var defaults = {
    mapClass: "heatmap",
    location: null,
    data: null,
    colorScale: null,
    title: null,
    mapFormat: {
      margin_x: 2,
      margin_y: 2,
      fixedsize_x: null,
      fixedsize_y: null
    },
    cellFormat:{
      cellMargin: 3,
      cellSize: 30
    },
    onCellClick: null,
    onMouseDown: null,
    onMouseUp: null,
    onMouseMove: null,
    rowLabels: null,
    colLabels: null
  };
  $.extend(true, defaults, params );
  params = defaults;


  // Validate input
  if(!params.data){ throw "params.data is required"; }
  var displaySvg =
    d3.select(params.location)
      .append('g')
      .attr('class', params.mapClass);

  // Compute color scale if missing.
  if(!params.colorScale){
    params.colorScale = this.colorScale({
      data: params.data.map(function(d) {return d.value; })
    });
  };

  // Determine number of rows and columns.
  var rows = d3.max(params.data.map(function(d) {return d.row; })) + 1;
  var cols = d3.max(params.data.map(function(d) {return d.col; })) + 1;

  // If fixed size is enabled then derive the cell size to fit the space.
  if(params.mapFormat.fixedsize_x & params.mapFormat.fixedsize_y) {

    if(  params.mapFormat.fixedsize_x / cols <
         params.mapFormat.fixedsize_y / rows ) {
      // Cols are the limiting factor.
      params.cellFormat.cellSize = ( (params.mapFormat.fixedsize_x  + (params.mapFormat.margin_x * 2) ) / cols ) -  params.cellFormat.cellMargin;
    }else{
      // Rows are the limiting factor.
      params.cellFormat.cellSize = ( (params.mapFormat.fixedsize_y + (params.mapFormat.margin_y * 2) ) / rows) -  params.cellFormat.cellMargin;
    }

  }else if(params.mapFormat.fixedsize_x){
    params.cellFormat.cellSize = ( (params.mapFormat.fixedsize_x  + (params.mapFormat.margin_x * 2) ) / cols ) -  params.cellFormat.cellMargin;
  }
  else if(params.mapFormat.fixedsize_y){
    params.cellFormat.cellSize = ( (params.mapFormat.fixedsize_y + (params.mapFormat.margin_y * 2) ) / rows) -  params.cellFormat.cellMargin;
  }

  params.cellFormat.cellMargin = params.cellFormat.cellMargin / 10;
  params.cellFormat.itemSize = params.cellFormat.cellMargin + params.cellFormat.cellSize;

  // Write row labels.
  var rowTextWidth = 0;
  if(params.rowLabels){

    displaySvg.selectAll("text.rowlabels")
      .data(params.rowLabels).enter()
      .append("text")
      .attr("class", "rowlabels")
      .text(function(d) {
        rowTextWidth = Math.max(rowTextWidth, d.length);
        return d;
      })
      .attr("x", function(d){
        return params.mapFormat.margin_x;
      })
      .attr("y", function(d, i){
        return (i * params.cellFormat.itemSize) + 16 + params.mapFormat.margin_y;
      })
      .attr("font-family", "Arial Black")
      .attr("font-size", function(){ return params.cellFormat.itemSize / 2.5;})
      .style("text-anchor", "right");

    rowTextWidth = rowTextWidth * 4;
  }
  params.mapFormat.margin_y = params.mapFormat.margin_y + rowTextWidth;

  // Col labels
  var colHeight = 0;
  if(params.colLabels){

    displaySvg.selectAll("text.collabels")
      .data(params.colLabels).enter()
      .append("text")
      .attr("class", "collabels")
      .text(function(d) {return d;})
      .attr("x", function(d, i){
        return (i * params.cellFormat.itemSize) + 16 + params.mapFormat.margin_x;
      })
      .attr("y", function(d, i){
        return params.mapFormat.margin_y;

      })
      .attr("font-family", "Arial Black")
      .attr("font-size", function(){ return params.cellFormat.itemSize / 2.5;})
      .style("text-anchor", "middle")

    colHeight = 16;
  }
  params.mapFormat.margin_x = params.mapFormat.margin_x + colHeight;


  // Draw rectangles
  var rect = displaySvg.selectAll('rect')
    .data(params.data).enter()
    .append('rect')
    .attr('width', params.cellFormat.cellSize )
    .attr('height', params.cellFormat.cellSize )
    .attr('x',function(d) {
      return params.mapFormat.margin_x + (params.cellFormat.itemSize * d.col);
    })
    .attr('y',function(d) {
      return params.mapFormat.margin_y + (params.cellFormat.itemSize * d.row);
    })
    .attr('fill',function(d) { return params.colorScale(d.value); })
    .attr("style", function(d) {
      if(!d.included) {
        return "stroke-width:3;stroke:rgb(203,24,29)";
      }else if (d.wellType === "NEG_CONTROL" || d.wellType === "POS_CONTROL") {
        return "stroke-width:3;stroke:rgb(82,82,82)";
      }else if(d.wellType === "EMPTY"){
        return "stroke-width:3;stroke:rgb(0,0,0)";
      }else {
        return "stroke-width:2;stroke:rgb(192,192,192)";
      }
    })
    .on('click', function(d) { if(params.onCellClick) {params.onCellClick(d);} } )
    .on('mouseup', function(d) { if(params.onMouseUp) {params.onMouseUp(d); } } )
    .on('mousedown', function(d) {if(params.onMouseDown) { params.onMouseDown(d);} })
    .on('mouvemove', function() { if(params.onMouseMove) { params.onMouseMove();}})
    .append("title")
    .text(function(d) { return "Well " + d.col + "x" + d.row + " with value " + (Math.round(d.value * 100) / 100); });

  // Add Text

  displaySvg.selectAll('text.well-label')
    .data(params.data).enter()
    .append('text')
    .attr("x", function(d){
      return (params.mapFormat.margin_x + (params.cellFormat.itemSize * d.col) + (params.cellFormat.itemSize / 2));
    })
    .attr("y", function(d){
      return (params.mapFormat.margin_y + (params.cellFormat.itemSize * d.row)) + (params.cellFormat.itemSize / 2);
    })
    .attr("font-family", "Arial Black")
    .attr("font-size", function(){ return params.cellFormat.itemSize / 2.5;})
    .style("text-anchor", "middle")
    .text(function(d){
      if(!d.included & d.wellType === "NEG_CONTROL"){
        return "E/NC";
      }else if(!d.included & d.wellType === "POS_CONTROL"){
        return "E/PC";
      }else if(d.wellType === "NEG_CONTROL"){
        return "NC";
      }else if(d.wellType === "POS_CONTROL"){
        return "PC";
      }else if(!d.included){
        return "E";
      }else{
        return null;
      }
    })
    .attr("class","well-label")
    .on('click', function(d) { if(params.onCellClick) {params.onCellClick(d);} } )
    .on('mouseup', function(d) { if(params.onMouseUp) {params.onMouseUp(d); } } )
    .on('mousedown', function(d) {if(params.onMouseDown) { params.onMouseDown(d);} })
    .on('mouvemove', function() { if(params.onMouseMove) { params.onMouseMove();}});

  // If there is a title render it.

  if(params.title) {

    var maxRow = d3.max(params.data.map(function(d) {return d.row; })) + 1;
    var maxCol = d3.max(params.data.map(function(d) {return d.col; })) + 1;

    var y = ( maxRow * ( params.cellFormat.cellSize + params.cellFormat.cellMargin ) )
      + (params.mapFormat.margin_y * 2) + 12;

    var x = params.mapFormat.margin_x +
      ( maxCol * ( params.cellFormat.cellSize + params.cellFormat.cellMargin ) ) / 2;

    displaySvg.selectAll('text.heatmap-title')
      .data([params]).enter()
      .append('text')
      .attr('x', x  )
      .attr('y', y )
      .text(function (d) { return params.title; })
      .attr("class","heatmap-title")
      .style("text-anchor", "middle");
  }

  return {
    x: params.mapFormat.margin_x,
    y: params.mapFormat.margin_y,
    width: params.cellFormat.itemSize * cols,
    height: params.cellFormat.itemSize * rows
  };

};

DataVis.prototype.addDarkOverlay = function(params){
  var defaults = {
    color: 'rgba(0, 0, 0, 0.2)',
    offset_x: 0,
    offset_y: 0,
    width: 100,
    height: 100
  };
  $.extend(true, defaults, params );
  params = defaults;

  d3.select(params.location)
    .append("rect")
    .attr("fill", params.color)
    .attr("x", params.offset_x)
    .attr("y", params.offset_y)
    .attr("width", params.width)
    .attr("height", params.height);

};

DataVis.prototype.heatMapColorGuide = function(params){

  var iterations = 5;
  var values = [];
  for(var i = 0; i < iterations; i++){
    values.push(params.min + (i * ((params.max - params.min) / iterations)) );
  }
  values.push(params.max);

  var loc = d3.select(params.location).html("");

  loc.selectAll("rect")
    .data(values).enter()
    .append("rect")
    .attr("width","20")
    .attr("height","20")
    .attr("x", "5")
    .attr("y", function(d,i) {return i * 24; })
    .attr("fill", function(d) { return params.colorScale(d); });

  loc.selectAll("text")
    .data(values).enter()
    .append("text")
    .attr("x","30")
    .attr("y", function(d,i) {return (i * 24) + 16; })
    .text(function(d) {return Math.round(d * 1000) / 1000;})
    .style("text-anchor", "left");
};

DataVis.prototype.renderScatterPlot = function(params) {
  var defaults = {
      width: 600,
      height: 600,
      xScaleIsDate: true,
      scaleX: null,
      scaleY: null,
      axisTitle: {
        x: "",
        y: ""
      },
      lineFunction: null,
      linePoints: null
  };


  $.extend(true, defaults, params);
  params = defaults;

  if(!params.scaleY){
    params.scaleY = {min: null, max: null};
    params.scaleY.min = d3.min(params.data.map(function (d) { return d.value; }));
    params.scaleY.max = d3.max(params.data.map(function (d) { return d.value; }));
  }

  var yScale = d3.scale.linear()
    .domain([params.scaleY.max, params.scaleY.min])
    .range([50, (params.height - 50 )]);

  var yAxis = d3.svg.axis()
    .scale(yScale).orient("left");

  if(!params.scaleX){
    params.scaleX = {min: null, max: null};
    if(params.xScaleIsDate){
      params.scaleX.min = new Date(d3.min(params.data.map(function (d) { return d.date; })));
      params.scaleX.max = new Date(d3.max(params.data.map(function (d) { return d.date; })));
    }else{
      params.scaleX.min = d3.min(params.data.map(function (d) { return d.amount; }));
      params.scaleX.max = d3.max(params.data.map(function (d) { return d.amount; }));
    }
  }

  var xScale = null;
  if (params.xScaleIsDate) {
    xScale = d3.time.scale()
      .domain([params.scaleX.min, params.scaleX.max])
      .range([50, (params.width - 50 )]);
  }else{
    xScale = d3.svg.axis().scale()
      .domain([ params.scaleX.min, params.scaleX.max ])
      .range([50, (params.width - 50 )]);
  }

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(5);

  if(params.xScaleIsDate){
    xAxis.tickFormat(d3.time.format('%m-%d-%y %H:%M'));
  }

  var svg = d3.select(params.location);

  function jitter(){
    return 0;
  }

  // x-axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (params.height - 30) + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", params.width - 10)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text(params.axisTitle.x);

  // y-axis
  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(30,0)")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text(params.axisTitle.y);


  var scatterPlot = svg.append("g").attr("id", "scatterPlotBody");

  scatterPlot.selectAll(".dot")
    .data(params.data)
    .enter().append("circle")
    .attr("class","dot")
    .attr("r", 4.5)
    .attr("cx", function(d) {
      if(params.xScaleIsDate) {
        return xScale(d.date) + jitter();
      } else {
        return xScale(d.amount) + jitter();
      }
    })
    .attr("cy", function(d) {
      return yScale(d.value) + jitter();
    } )
    .style("fill", function(d) {
      if (d.wellType === "NEG_CONTROL"){
        return "rgb(239,237,245)";
      }else if (d.wellType === "POS_CONTROL"){
        return "rgb(117,107,177)";
      }else{
        return "rgb(255,255,255)";
      }
    })
    .attr("stroke-width", 2)
    .attr("stroke", function(d) {
      if(d.included){
        return "black";
      }else{
        return "red";
      }
    })
    .on('click', function(d) { if(params.onCellClick) {params.onCellClick(d);} } );

    if(params.lineFunction != null || params.linePoints != null){
      this.renderLine({
        hasAxis: false,
        width: params.width,
        height: params.height,
        location: "#scatterPlotBody",
        scaleX: params.scaleX,
        scaleY: params.scaleY,
        lineFunction: params.lineFunction,
        linePoints: params.linePoints,
        color: "blue"
      });
    }
};

DataVis.prototype.renderLine = function(params) {

  var svg = d3.select(params.location);

  var xs = d3.scale.linear()
    .domain([params.scaleX.min, params.scaleX.max])
    .range([50, params.width]);

  var ys = d3.scale.linear()
    .domain([params.scaleY.min, params.scaleY.max])
    .range([params.height - 50, 0]);

  var points = [];

  if(!params.linePoints) {

    var diff = ( params.scaleX.max - params.scaleX.min ) / 200;
    var x = params.scaleX.min;
    var y = params.lineFunction(x);
    while (x < params.scaleX.max & y < params.scaleY.max) {
      points.push({
        x: x,
        y: params.lineFunction(x)
      });
      x += diff;
      y = params.lineFunction(x);
    }

  }
  else{
    points = params.linePoints;
  }

  if(params.hasAxis){

    var yScale = d3.scale.linear()
      .domain([params.scaleY.max, params.scaleY.min])
      .range([50, (params.height - 50 )]);

    var yAxis = d3.svg.axis()
      .scale(yScale).orient("left");

    var xScale = d3.svg.axis().scale()
      .domain([ params.scaleX.min, params.scaleX.max ])
      .range([50, (params.width - 50 )]);

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .ticks(5);


    // x-axis
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (params.height - 30) + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", params.width - 10)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text(params.axisTitle.x);

    // y-axis
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(30,0)")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(params.axisTitle.y);
  }

  var line = d3.svg.line()
    .x(function(d) { return  xs(d.x); })
    .y(function(d) { return ys(d.y); })
    .interpolate("basis");

  svg.append("path")
    .attr("d", line(points))
    .attr("stroke", params.color)
    .attr("stroke-width", 2)
    .attr("fill", "none");
};


DataVis.prototype.convertPlateResultData = function(data){

  var plateResults = data.map(function(plateResult){

    // Create well array.
    var wd = [];
    var row = 0;
    var col = 0;

    for(row = 0; row < plateResult.plate.plateType.dim.rows; row++){
      wd.push([]);
      for(col = 0; col < plateResult.plate.plateType.dim.cols; col++){
        wd[row].push({ row: row, col: col });
      }
    }

    // Build array.
    plateResult.wellResults.forEach(function(wr){

      row = wr.coordinate.row;
      col = wr.coordinate.col;

      if(wr.resultStatus === "INCLUDED"){
        wd[row][col].included = true;
      }else{
        wd[row][col].included = false;
      }

      wd[row][col].value = wr.samples[0].value;

      wd[row][col].date = Date.parse(plateResult.created);

    });
    plateResult.plate.wells.forEach(function(well){

      row = well.coordinate.row;
      col = well.coordinate.col;

      var wellType;
      switch(well.type){
        case "COMP": wellType = "NORMAL"; break;
        case "NEGATIVE": wellType = "NEG_CONTROL"; break;
        case "POSITIVE": wellType = "POS_CONTROL"; break;
        case "EMPTY": wellType = "EMPTY"; break;
        default: throw "Processing error: welltype=" + well.type;
      }

      wd[row][col].wellType = wellType;
      wd[row][col].wellIndex = well.id;

      wd[row][col].compound = well.contents[0].compound.name;
      wd[row][col].amount = well.contents[0].amount.number;

    });

    var dataSet = [];
    wd.forEach(function(row) {row.forEach(function(d) { dataSet.push(d); })} );

    var ro = function(d){
      return Math.round( d * 100.0) / 100.0;
    };

    console.log(plateResult);

    function plateName(){
      if(plateResult.plate.barcode){
        return plateResult.plate.barcode;
      }else{
        return plateResult.plate.name;
      }
    }

    if(plateResult.metrics.length != 0) {
      return {
        plateIndex: plateResult.plate.id,
        experimentIndex: plateResult.plate.experimentId,
        data: dataSet,
        name: plateName().substr(0,10),
        z: ro(plateResult.metrics[0].zee),
        z_prime: ro(plateResult.metrics[0].zeePrime),
        pos_avg: ro(plateResult.metrics[0].avgPositive),
        neg_avg: ro(plateResult.metrics[0].avgNegative)
      };
    }else{
      return {
        plateIndex: plateResult.plate.id,
        experimentIndex: plateResult.plate.experimentId,
        data: dataSet,
        name: plateName(),
        z: null,
        z_prime: null,
        pos_avg: null,
        neg_avg: null
      };
    }
  });

  return plateResults;

};

/**
 * Transforms supplied data into the form required for the controller to
 * handle the interface.
 *
 * @param data
 * @returns {Array}
 */
DataVis.prototype.convertDoseResponseData = function(data){

  var compounds = [];

  data.forEach(function(compound){

    function toBool(string){
      if(string === "INCLUDED"){
        return true;
      }else{
        return false;
      }
    }

    var newCompound = {
      compound: compound.compound.name,
      curve: compound.curveFitPoints.map(function(cp){
        return {
          x: cp.x,
          y: cp.y
        }
      }),
      wells: compound.experimentPoints.map(function (ep){
        return {
          plateId: ep.plateId,
          amount: ep.logx,
          value: ep.y,
          included: toBool(ep.resultStatus),
          wellIndex: ep.doseId
        }
      })
    };

    function ro(d){
      return Math.round(d * 100.0) / 100.0;
    }

    if(compound.fitParameterMap.EC50){
      newCompound.hasCurve = true;
      newCompound.EC50 = ro(compound.fitParameterMap.EC50.value);
      newCompound.MIN = ro(compound.fitParameterMap.Min.value);
      newCompound.MAX = ro(compound.fitParameterMap.Max.value);
      newCompound.SLOPE = ro(compound.fitParameterMap.Slope.value);
    }else{
      newCompound.hasCurve = false;
      newCompound.EC50 = null;
      newCompound.MIN = null;
      newCompound.MAX = null;
      newCompound.SLOPE = null;
    }

    compounds.push(newCompound);

  });

  return compounds;

};
