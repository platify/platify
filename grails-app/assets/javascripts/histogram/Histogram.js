function Histogram(json_data, experiment) {
    var json_data = JSON.parse(json_data);
//    var experiment = experiment;
    var x_data;
    var margin;
    var width;
    var height;

    this.initiateVis = function() {
        margin = {top: 10, right: 30, bottom: 30, left: 40};
        width = 650 - margin.left - margin.right;
        height = 575 - margin.top - margin.bottom;

        this.setUpGraph();
    }

    this.getXData = function() {
        // Collect all compound names & result values in experiment
        var x_data = [];
        $.each(json_data.plates, function(i, plate){
            $.each(plate.rows, function (i, row) {
                $.each(row.columns, function(i, column){
                    var compound_name = "";
                    if (Object.keys(column.labels).length !== 0)
                        compound_name = column.labels.compound;

                    var value_label = Object.keys(column.rawData).sort()[0];

                    x_data.push({
                        "name": compound_name,
                        "value": +column.rawData[value_label]
                    });
                });
            });
        });

        // Group data by compound name
        x_data = d3.nest().key(function(d) {
            return d.name;
        }).entries(x_data);

        // Calculate & store median and mean values for each compound
        x_data.forEach(function(compound) {
            var mean = d3.mean(compound.values, function(d) { return d.value; });
            var median = d3.median(compound.values, function(d) { return d.value; });

            compound.mean = +mean;
            compound.median = +median;
        });

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
    }

    this.updateGraph = function() {
        var x_values = this.getXData();
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
            .frequency(false)
            .bins(ticks);
        var data = histogram(x_values);

        var yScale = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.y; })])
            .range([height, 0]);

        this.updateAxes(xScale, yScale);
        this.updateBars(data, xScale, yScale, bin_width + min_x);
    }

    this.updateAxes = function(xScale, yScale) {
        d3.select(".x_axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis()
                .scale(xScale)
                .orient("bottom"));
        d3.select(".y_axis")
            .call(d3.svg.axis()
                .scale(yScale)
                .orient("left"));
    }

    this.updateBars = function(data, xScale, yScale, bin_width_from_min_x) {
        var bar = d3.select(".bar_group").selectAll(".bar")
            .data(data);

        bar.enter().append("rect");
        bar.attr("class", "bar")
            .attr("width", xScale(bin_width_from_min_x))
            .attr("height", function(d) { return height - yScale(d.y); })
            .attr("transform", function(d) {
                return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")";
            })
            .attr("x", 5)
            .style("fill", "lightgreen")
            .style("stroke", "black");

        bar.exit().remove();
    }
}

