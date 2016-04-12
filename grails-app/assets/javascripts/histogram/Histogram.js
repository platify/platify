function Histogram(json_data, experiment) {
    var json_data = JSON.parse(json_data);
    var experiment = experiment;
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
        var x_data = [];

        var replicate_option = $("input[name=replicate_option]:checked").val();
        if (replicate_option.localeCompare("none") !== 0) {
//            var first_compound_label = null;
//            if (data_json.rows[0].columns[0].labels)
//                first_compound_label = data_json.rows[0].columns[0].labels.compound;
//            if ()
        }
        else {
        //        json_data = JSON.parse('{"plates": [{"rows": ['
        //+'{"columns": [{"labels": {"absorbance": "0.0508","compound": "CMPD4"},"rawData": {"absorbance": "0.0508"},'
        //+'"normalizedData": {},"control": "POSITIVE"},{"labels": {"absorbance": "0.0491","compound": "CMPD4"},'
        //+'"rawData": {"absorbance": "0.0491"},"normalizedData": {},"control": "COMPOUND"}]}]}]}');

            $.each(json_data.plates, function(i, plate){
                $.each(plate.rows, function (i, row) {
                    $.each(row.columns, function(i, column){
                        var compound_name = "";
                        if (Object.keys(column.labels).length !== 0)
                            compound_name = column.labels.compound;

                        var value_label = Object.keys(column.rawData).sort()[0];

                        //x_data.push({
                        //    "name": compound_name,
                        //    "value": +column.rawData[value_label]
                        //});

                        x_data.push(+column.rawData[value_label]);
                    });
                });
            });
        }

        return x_data;
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
        var x_data = this.getXData();
        var min_x = d3.min(x_data/*, function(d) {
            return d.value;
        }*/);
        var max_x = d3.max(x_data/*, function(d) {
            return d.value;
        }*/);

        var bin_width = document.getElementById('bin_width').value;
        var num_bins = (max_x - min_x) / bin_width;

        var xScale = d3.scale.linear()
            .domain([min_x, max_x+6])
            .range([0, width]);

        var ticks = xScale.ticks(num_bins);

//        var x_values = [];
//        x_data.forEach(function(data) {
//            x_values.push(data.value);
//        });

        var histogram = d3.layout.histogram();
        var bins = histogram.bins(ticks);
        var data = bins(x_data/*, function(d) { return d.value; }*/);

        var yScale = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.y; })])
            .range([height, 0]);

        this.updateAxes(xScale, yScale);
        this.updateBars(data, xScale, yScale, bin_width);
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

    this.updateBars = function(data, xScale, yScale, bin_width) {
        var bar = d3.select(".bar_group").selectAll(".bar")
            .data(data);

        bar.enter().append("rect");
        bar.attr("class", "bar")
            .attr("width", xScale(bin_width))
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

