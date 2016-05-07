

function Scatter(experiment) {
	var plate = experiment.currentPlateIndex;
	var colors = new Object();
	//Keep track of which column/row each dot in the plot belongs to
	this.dotIndexes = Array();
	var uniqueCompounds = 0;

	
    this.getDosage = function(rowIdx, colIdx) {
    	if(experiment.experiment.plates[experiment.currentPlateIndex].rows[rowIdx] == undefined) {
    		return 0.0;
    	}
    	
    	var labels = experiment.experiment.plates[experiment.currentPlateIndex].rows[rowIdx].columns[colIdx].labels;
    	if(labels.dosage !== undefined) {
    		var dosage = labels.dosage;
    		//"0__dot__3703703703703704"
    		var dosage = dosage.split("__dot__");
    		if(dosage.length == 1) {
    			return parseInt(dosage[0]);
    		}
    		var dosageVal = dosage[0]+"."+dosage[1];
    		
    		return parseInt(dosageVal);
    	}
    	
    	return 0.0;
    	
    },
   	this.cValue = function(rowIdx, colIdx) { 
    	var colorValues = d3.scale.category20().range();
    	if(experiment.experiment.plates[experiment.currentPlateIndex].rows[rowIdx] == undefined) {
    		return "#000000";
    	}
    	var labels = experiment.experiment.plates[experiment.currentPlateIndex].rows[rowIdx].columns[colIdx].labels;
    	if(labels.compound !== undefined) {
    		var compound = labels.compound;
    		//Get color from existing compound array
    		if(colors[compound] !== undefined) {
    			return colors[compound];
    		}
    		//Add compound to object
    		colors[compound] = colorValues[uniqueCompounds];
    		if(uniqueCompounds > 19) {
    			//Too many compounds, reset
    			uniqueCompounds = 0;
    		} else {
    			uniqueCompounds = uniqueCompounds+1;
    		}
    		
    		return colors[compound];
    	}
    	//If there isn't a compound associated, return black
    	return "#000000";
    	
    };
    
    
	this.setData = function(matrixData) {
		//Clear any existing data in the plot
		$('#scatterplot').html('');
		//This is in a set of rows and columns
		//var data = [[5,3], [10,17], [15,4], [2,8]];
		var i = 0;
		var data = [];
		self = this;
		$.each(matrixData, function(rowIdx, row){
			$.each(row, function(colIdx ,column){
				data.push([i, column]);
				i = i+1;
				//dotIndex array is 0 indexed
				self.dotIndexes[i-1] = [experiment.currentPlateIndex, rowIdx, colIdx, plate]
			});
		});
	   
	    var margin = {top: 30, right: 30, bottom: 60, left: 60}
	      , width = 960 - margin.left - margin.right
	      , height = 500 - margin.top - margin.bottom;
	    
	    var x = d3.scale.linear()
	              .domain([d3.min(data, function(d) { return +d[0]; }), d3.max(data, function(d) { return +d[0]; })])
	              .range([ 0, width ]);
	    
	    var y = d3.scale.linear()
	    	      .domain([d3.min(data, function(d) { return +d[1]; }), d3.max(data, function(d) { return +d[1]; })])
	    	      .range([ height, 0 ]);
	    
	    var chart = d3.select('#scatterplot')
		.append('svg:svg')
		.attr('width', width + margin.right + margin.left)
		.attr('height', height + margin.top + margin.bottom)
		.attr('class', 'chart')

	    var main = chart.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
		.attr('width', width)
		.attr('height', height)
		.attr('class', 'main')   
	        
	    // draw the x axis
	    var xAxis = d3.svg.axis()
		.scale(x)
		.orient('bottom');

	    main.append('g')
		.attr('transform', 'translate(0,' + height + ')')
		.attr('class', 'main axis date')
		.call(xAxis);

	    // draw the y axis
	    var yAxis = d3.svg.axis()
		.scale(y)
		.orient('left');

	    main.append('g')
		.attr('transform', 'translate(0,0)')
		.attr('class', 'main axis date')
		.call(yAxis);
	    
	    var g = main.append("svg:g"); 
	    var self = this;
	    g.selectAll("scatter-dots")
	      .data(data)
	      .enter().append("svg:circle").attr("class", "circle")
	          .attr("cx", function (d,i) { return x(d[0])} )
	          .attr("cy", function (d) { 
	        	  return y(d[1]); 
	        	  } )
	          .attr("r", 8).attr("index", function (d,i) { return d[0]; })
	          .attr("plate", function (d,i) { 
	        	  return self.dotIndexes[d[0]][0]; 
	        	  })
	          .attr("row", function (d,i) { return self.dotIndexes[d[0]][1]; })
	          .attr("col", function (d,i) { return self.dotIndexes[d[0]][2]; })
	          .style("fill", function(d) { 
	        	  var row = self.dotIndexes[d[0]][1];
	        	  var col = self.dotIndexes[d[0]][2];
	        	  return self.cValue(row, col);
	        	  });
	    $("body").trigger("done_drawing");
	}
	
}

