

function Scatter_control() {
	
	//Keep track of which column/row each dot in the plot belongs to
	this.dotIndexes = Array();
	
	this.setData = function(experiment) {
		//Clear any existing data in the plot
		$('#scatterplot_control').html('');
		//This is in a set of rows and columns
		//var data = [[5,3], [10,17], [15,4], [2,8]];
		var i = 0;
		var j = 0;
		var positive = [];
		var negative = [];
		var plateLabels = Array();
		
		self = this;
		
		$.each(experiment.plates, function(plateIdx, plate){
			$.each(plate.rows, function(rowIdx, row){
				$.each(row.columns, function(colIdx ,column){
					if(column.control == "NEGATIVE") {
						//negative.push([i,column.rawData["smoots"]]);
						var keys = Object.keys(column.rawData);
						if(keys.length > 0){
							negative.push([i,column.rawData[keys[0]],column.outlier,plate.plateID,rowIdx,colIdx]);
							//dotIndex array is 0 indexed
							self.dotIndexes[i] = [rowIdx, colIdx, plate.plateID];
							//Plate plateIdx applies to all indexes "i" or lower
							plateLabels[i] = plateIdx+":"+plate.plateID;
							i = i+1;
						}
						
					}
					
					if(column.control == "POSITIVE") {
						var keys = Object.keys(column.rawData);
						if(keys.length > 0){
							positive.push([i,column.rawData[keys[0]],column.outlier,plate.plateID,rowIdx,colIdx]);
							//dotIndex array is 0 indexed
							self.dotIndexes[i] = [rowIdx, colIdx, plate.plateID];
							//Plate plateIdx applies to all indexes "i" or lower
							plateLabels[i] = plateIdx+":"+plate.plateID;
							i = i+1;
						}
					}

				});
			});
			if(i > j) {
				//let j catch up
				j = i;
			}
			if(j > i) {
				//let i catch up
				i = j;
			}
			
			
		});
	   
	    var margin = {top: 20, right: 15, bottom: 60, left: 60}
	      , width = 960 - margin.left - margin.right
	      , height = 500 - margin.top - margin.bottom;
	    
	    var x = d3.scale.linear()
	              .domain([0, i+1])
	              .range([ 0, width ]);
	    
	    var y = d3.scale.linear()
	    	      .domain([d3.min(positive.concat(negative), function(d) { return +d[1]; }), d3.max(positive.concat(negative), function(d) { return +d[1]; })])
	    	      .range([ height, 0 ]);
	    
	    var chart = d3.select('#scatterplot_control')
		.append('svg:svg')
		.attr('width', width + margin.right + margin.left)
		.attr('height', height + margin.top + margin.bottom)
		.attr('class', 'chart')

	    var main = chart.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
		.attr('width', width)
		.attr('height', height)
		.attr('class', 'main')   
	        
		
	    var formatPlate = function(d) {
	    	//plateLabels.push([i, plateIdx]);
	        return plateLabels[d];      
	    }
	    
	    
	    // draw the x axis
	    var xAxis = d3.svg.axis()
		.scale(x)
		.orient('bottom').tickFormat(formatPlate);

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
	      .data(negative)
	      .enter().append("svg:circle").attr("class", "circle")
	          .attr("cx", function (d,i) { return x(d[0])} )
	          .attr("cy", function (d) { return y(d[1]); } )
	          .attr("r", 8).attr("index", function (d,i) { return d[0]; })
	          .style("fill", function (d) { return "red"; })
	          .attr("row", function (d,i) { return self.dotIndexes[d[0]][0]; })
              .attr("col", function (d,i) { return self.dotIndexes[d[0]][1]; })
              .attr("plate", function (d,i) { return self.dotIndexes[d[0]][2]; });
	    
	    g.selectAll("scatter-dots")
	      .data(positive)
	      .enter().append("svg:circle").attr("class", "circle")
	          .attr("cx", function (d,j) { return x(d[0])} )
	          .attr("cy", function (d) { return y(d[1]); } )
	          .attr("r", 8).attr("index", function (d,j) { return d[0]; })
	          .style("fill", function (d) { return "green"; })
	    
	          .attr("row", function (d,i) { return self.dotIndexes[d[0]][0]; })
	          .attr("col", function (d,i) { return self.dotIndexes[d[0]][1]; })
	          .attr("plate", function (d,i) { return self.dotIndexes[d[0]][2]; });
	}
	
}