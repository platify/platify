

function Scatter(experiment) {
	var plate = experiment.currentPlate.plateID;
	//Keep track of which column/row each dot in the plot belongs to
	this.dotIndexes = Array();
	
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
				self.dotIndexes[i-1] = [rowIdx, colIdx, plate]
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
	          .attr("cy", function (d) { return y(d[1]); } )
	          .attr("r", 8).attr("index", function (d,i) { return d[0]; })
	          .attr("row", function (d,i) { return self.dotIndexes[d[0]][0]; })
	          .attr("col", function (d,i) { return self.dotIndexes[d[0]][1]; })
	          .attr("plate", function (d,i) { return self.dotIndexes[d[0]][2]; });
	    $("body").trigger("done_drawing");
	}
	
}

