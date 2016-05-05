function Histogram(json_data) {
    //var json_data = JSON.parse(json_data);
//    var experiment = experiment;
    var x_data;
    var data_points;
    var margin;
    var width;
    var height;

    /**
     * Use this to update the experiment data
     */
    this.update_data = function(new_data) {
    	json_data = new_data;
    }
    
    this.initiateVis = function() {
        margin = {top: 10, right: 40, bottom: 80, left: 50};
        width = document.getElementById('histogramBody').offsetWidth - 60 - margin.left - margin.right;
        height = 550 - margin.top - margin.bottom;

        this.setUpGraph();
        this.setUpGraphOutliers();
    }
    
    this.getXDataOutliers = function() {
        // Collect all compound names & result values in experiment
        var x_data = [];
        var data_points = [];
        var self = this;
        var data_type = ($('#normalizeButton').is(":checked")) ? "normalizedData" : "rawData";
        $.each(json_data.plates, function(plateIdx, plate){
            $.each(plate.rows, function (rowIdx, row) {
                $.each(row.columns, function(colIdx, column){
                    var compound_name = "unknown";
                    if (Object.keys(column.labels).length !== 0)
                        compound_name = column.labels.compound;
                    if(column.outlier == "true") {
                        var value_label = Object.keys(column.rawData).sort()[0];

                        data_points.push({
                            "name": compound_name,
                            "value": +column[data_type][value_label],
                            "row":rowIdx,
                            "col":colIdx,
                            "plate":plateIdx,
                            "outlier": column.outlier
                        });
                    }
                });
            });
        });

        //x-data is in a more useful format than before this
        // Group data by compound name
        x_data = d3.nest().key(function(d) {
            return d.name;
        }).entries(data_points);

        // Calculate & store median and mean values for each compound
        x_data.forEach(function(compound) {
            var mean = d3.mean(compound.values, function(d) { 
            	
            	return d.value; 
            	});
            var median = d3.median(compound.values, function(d) { return d.value; });

            compound.mean = +mean;
            compound.median = +median;
        });

        return x_data;
    }

    this.getXData = function() {
        // Collect all compound names & result values in experiment
        x_data = [];
        data_points = [];
        var self = this;
        var data_type = ($('#normalizeButton').is(":checked")) ? "normalizedData" : "rawData";

        $.each(json_data.plates, function(plateIdx, plate){
            $.each(plate.rows, function (rowIdx, row) {
                $.each(row.columns, function(colIdx, column){
                    var compound_name = "unknown";
                    if (Object.keys(column.labels).length !== 0)
                        compound_name = column.labels.compound;

                    var value_label = Object.keys(column.rawData).sort()[0];

                    data_points.push({
                        "name": compound_name,
                        "value": +column[data_type][value_label],
                        "plate": plateIdx,
                        "row":rowIdx,
                        "col":colIdx,
                        "outlier": column.outlier
                    });
                });
            });
        });

        //x-data is in a more useful format than before this
        // Group data by compound name
        x_data = d3.nest().key(function(d) {
            return d.name;
        }).entries(data_points);

        // Calculate & store median and mean values for each compound
        x_data.forEach(function(compound) {
            var mean = d3.mean(compound.values, function(d) {
                return (!d.outlier || d.outlier.localeCompare("true" !== 0)) ? d.value : null; });
            var median = d3.median(compound.values, function(d) {
                return (!d.outlier || d.outlier.localeCompare("true" !== 0)) ? d.value : null; });

            compound.mean = +mean;
            compound.median = +median;
        });

        return x_data;
    }

    /**
     * Analogous to getXValues -- returns data only if "outlier" is false
     */
    this.getOutlierValues = function(x_data) {
    	var outlier_values = [];
    	var replicate_option = $("input[name=replicate_option]:checked").val(); //"mean", "median", or "none"

        if (replicate_option.localeCompare("none") !== 0) {
            return [];
        }
        else {
             x_data.forEach(function(compound) {
                compound.values.forEach(function(data) {
                	if(data.outlier == "true") {
                		outlier_values.push(data.value);
                	}
                });
            });
        }

        return outlier_values;
    }
    
    //Probably don't need to pass x_data in here
    this.getXValues = function() {
        var x_values = [];
        var replicate_option = $("input[name=replicate_option]:checked").val(); //"mean", "median", or "none"

        if (replicate_option.localeCompare("none") !== 0) {
            x_data.forEach(function(compound) {
                x_values.push(compound[replicate_option]);
            })
        }
        else {
             x_data.forEach(function(compound) {
                compound.values.forEach(function(data) {
                    x_values.push(data.value);
                });
            });
        }

        return x_values;
    }

    this.getCutoffData = function(x_data, cutoff_value) {
        var cutoff_values = [];
        var replicate_option = $("input[name=replicate_option]:checked").val(); //"mean", "median", or "none"

        if (replicate_option.localeCompare("none") !== 0) {
            x_data.forEach(function(compound) {
                if (compound[replicate_option] >= cutoff_value)
                    cutoff_values.push([compound["key"], d3.format(".3f")(compound[replicate_option])]);
            })
        }
        else {
             x_data.forEach(function(compound) {
                compound.values.forEach(function(data) {
                    if (data.value >= cutoff_value && (!data.outlier || data.outlier.localeCompare("true") !== 0))
                        cutoff_values.push([compound["key"], experiment.experiment.plates[data.plate].plateID+"\n[" + data.row + "," + data.col + "]", d3.format(".3f")(data.value)]);
                });
            });
        }

        return cutoff_values;
    }

    
    
    this.setUpGraph = function() {
        var histogram = d3.select('#histogramVis')
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Set up axes
        histogram.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x_axis");
        histogram.append("g").attr("class", "y_axis");

        // Create group for histogram bars
        histogram.append("g").attr("class", "bar_group");

        // Set up table
        var table = d3.select("#cutoffTable").append("table").attr("class", "cutoffTable");
        table.append("thead").append("tr").attr("class", "heading");
        table.append("tbody").attr("class", "body");
    }
    
    this.setUpGraphOutliers = function() {
        var histogram = d3.select('#histogramOutliers')
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//        // Set up axes
//        histogram.append("g")
//            .attr("transform", "translate(0," + height + ")")
//            .attr("class", "x_axis");
//        histogram.append("g").attr("class", "y_axis");

        // Create group for histogram bars
        histogram.append("g").attr("class", "bar_group_outliers");
    }

    this.updateGraphOutlier = function() {
    	//I think we can assume that x_data has already been populated here
    	var x_data_out = this.getXDataOutliers();
        var x_values_out = this.getOutlierValues(x_data_out);

        if(x_values_out.length == 0) {
        	//No outlier values. Hide outliers
        	$(".bar_group_outliers").css("display", "none");
        	return;
        } else {
        	$(".bar_group_outliers").css("display", "inline");
        }

        //Used to calculate the regular scale for the histogram
        var x_data = this.getXData();
        var x_values = this.getXValues(x_data);


        var min_x = d3.min(x_values);
        var max_x = d3.max(x_values);

        var min_x_out = d3.min(x_values_out);
        var max_x_out = d3.max(x_values_out);

        var bin_width = +document.getElementById('bin_width').value;
        var num_bins;
        if (min_x === max_x)
            num_bins = 1;
        else
            num_bins = (max_x - min_x) / bin_width;

        var xScale = d3.scale.linear()
            .domain([min_x, max_x + 6])
            .range([0, width]);

        var ticks;
        if (num_bins === 1)
            ticks = [min_x, max_x];
        else
            ticks = xScale.ticks(num_bins);

        var histogram = d3.layout.histogram()
            .frequency(true)
            .bins(ticks);

        var data = histogram(x_values_out);
      //Use the yScale from the original histogram data
        var histogram_scale = d3.layout.histogram()
        .frequency(true)
        .bins(ticks);

        var data_scale = histogram_scale(x_values);

        var yScale = d3.scale.linear()
            .domain([0, d3.max(data_scale, function(d) { return d.y; })])
            .range([height, 0]);

        var cutoff = +document.getElementById("cutoff").value;

        this.updateBarsOutliers(data, xScale, yScale, bin_width + min_x, cutoff);
    }
    
    this.updateGraph = function() {
        x_data = this.getXData();
        var x_values = this.getXValues();
        var min_x = d3.min(x_values);
        var max_x = d3.max(x_values);

        var bin_width = +document.getElementById('bin_width').value;
        var num_bins;
        if (min_x === max_x)
            num_bins = 1;
        else
            num_bins = (max_x - min_x) / bin_width;

        var xScale = d3.scale.linear()
            .domain([min_x, max_x + 6])
            .range([0, width]);

        var ticks;
        if (num_bins === 1)
            ticks = [min_x, max_x];
        else
            ticks = xScale.ticks(num_bins);

        var histogram = d3.layout.histogram()
            .frequency(true)
            .bins(ticks);
        var data = histogram(x_values);

        var yScale = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.y; })])
            .range([height, 0]);

        var cutoff = +document.getElementById("cutoff").value;
        var cutoff_data = this.getCutoffData(x_data, cutoff);

        this.updateAxes(xScale, yScale);
        this.updateBars(data, xScale, yScale, bin_width + min_x, cutoff);
        this.updateTable(cutoff_data);
        //This will trigger an update of the outlier Histogram
        $("body").trigger("done_drawing");
    }

    this.updateAxes = function(xScale, yScale) {
    	//Check to make sure this transforms both axis
        d3.select("#histogramVis .x_axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis()
                .scale(xScale)
                .orient("bottom"))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");
        d3.select("#histogramVis .y_axis")
            .call(d3.svg.axis()
                .scale(yScale)
                .orient("left"));
    }

    
  //This will sort your array
    this.sortByValue = function (a, b){
    	var sortVal = ((parseFloat(a.value) < parseFloat(b.value)) ? 1 : 0);
      return sortVal;
    }

    
    this.updateBars = function(data, xScale, yScale, bin_width_from_min_x, cutoff) {
        var bar = d3.select(".bar_group").selectAll(".bar")
            .data(data);
        var i = 0;
        var sortedPoints = data_points.slice();
        var tmp = sortedPoints.sort(function(a, b){
        	
        	return a.value-b.value;
        });
        
        bar.enter().append("rect");
        //In the "indexes" attr here, use the global data var, and an incrementing index
        bar.attr("class", "bar")
            .attr("width", xScale(bin_width_from_min_x))
            .attr("indexes", function(d){
            	var indexStr = "";
            	for(var sample = 0; sample < d.length; sample++) {
            		indexStr = indexStr+String(sortedPoints[i].plate)+","+String(sortedPoints[i].row)+","+String(sortedPoints[i].col)+";";
            		i++;
            	}
            	
            	return indexStr.slice(0, - 1);
            })
            .attr("height", function(d) { return height - yScale(d.y); })
            .attr("transform", function(d) {
                return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")";
            })
            .attr("x", 5)
            .style("fill", function(d) {
                if (d.x >= cutoff)
                    return "lightgreen";
                else
                    return "pink";
            })
            .style("stroke", function(d) {
                if (d.x >= cutoff)
                    return "green";
                else
                    return "red";
            });

        bar.exit().remove();
    }
    
    this.updateBarsOutliers = function(data, xScale, yScale, bin_width_from_min_x, cutoff) {
        var bar = d3.select(".bar_group_outliers").selectAll(".bar")
            .data(data);
        var i = 0;
        bar.enter().append("rect");
        //In the "indexes" attr here, use the global data var, and an incrementing index
        bar.attr("class", "bar")
            .attr("width", xScale(bin_width_from_min_x))
            .attr("indexes", function(d){return 0})
            .attr("height", function(d) { return height - yScale(d.y); })
            .attr("transform", function(d) {
                return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")";
            })
            .attr("x", 5)
            .style("fill", function(d) {
                if (d.x >= cutoff)
                    return "gray";
                else
                    return "pink";
            })
            .style("stroke", function(d) {
                if (d.x >= cutoff)
                    return "gray";
                else
                    return "red";
            });

        bar.exit().remove();
    }

    this.updateTable = function(cutoff_data) {
        var cutoff_data = cutoff_data.sort(function(a, b) {
            return d3.ascending(a[1], b[1]);
        });

        var heading = d3.select("tr.heading").selectAll("th")
            .data(["Compound", "Pos","Value"]);
        heading.enter().append("th");
        heading.text(function(d) { return d; });

        var rows = d3.select("tbody.body").selectAll("tr")
            .data(cutoff_data);
        rows.exit().remove();
        rows.enter().append("tr");

        var cells = rows.selectAll("td")
            .data(function(d) {
                return d;
            });
        cells.exit().remove();
        cells.enter().append("td");
        cells.text(function(d) { return d; });
    }
}

