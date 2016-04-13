function Histogram(json_data, experiment) {
    var json_data = JSON.parse(json_data);
//    var experiment = experiment;
    var x_data;
    var margin;
    var width;
    var height;

    this.initiateVis = function() {
        margin = {top: 10, right: 30, bottom: 30, left: 50};
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

        return x_data;
    }

    this.getXValues = function(x_data) {
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

    this.getCutoffData = function(x_data, cutoff_value) {console.log(x_data);
        var cutoff_values = [];
        var replicate_option = $("input[name=replicate_option]:checked").val(); //"mean", "median", or "none"

        if (replicate_option.localeCompare("none") !== 0) {
            x_data.forEach(function(compound) {
                if (compound[replicate_option] >= cutoff_value)
                    cutoff_values.push([compound["key"], compound[replicate_option]]);
            })
        }
        else {
             x_data.forEach(function(compound) {
                compound.values.forEach(function(data) {
                    if (data.value >= cutoff_value)
                        cutoff_values.push([compound["key"], data.value]);
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

    this.updateGraph = function() {
        var x_data = this.getXData();
        var x_values = this.getXValues(x_data);
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

        var cutoff = +document.getElementById("cutoff").value;
        var cutoff_data = this.getCutoffData(x_data, cutoff);

        this.updateAxes(xScale, yScale);
        this.updateBars(data, xScale, yScale, bin_width + min_x, cutoff);
        this.updateTable(cutoff_data);
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

    this.updateBars = function(data, xScale, yScale, bin_width_from_min_x, cutoff) {
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

    this.updateTable = function(cutoff_data) {
        var cutoff_data = cutoff_data.sort(function(a, b) {
            return d3.ascending(a[1], b[1]);
        });

        var heading = d3.select("tr.heading").selectAll("th")
            .data(["Compound", "Value"]);
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

