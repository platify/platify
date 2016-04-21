function StdCurve() {
    var graph;
    var table;
    var x_scale;
    var y_scale;
    var margin;
    var width;
    var height;

    this.init = function() {
        margin = {top: 10, right: 30, bottom: 30, left: 40};
        width = 650 - margin.left - margin.right;
        height = 430 - margin.top - margin.bottom;

        createGraphAndTable();
    }

    $("#stdCurveButton").click(function() {
        updateStdCurve();
    });

    function updateStdCurve(data) {
        var editor_data = JSON.parse(EDITOR_DATA_JSON);
        var result_data = JSON.parse(IMPORT_DATA_JSON);

        var reference_points = getRefPoints(editor_data, result_data);

        var reference_SVGgroup = ".reference_group";
        var inferred_SVGgroup = ".inferred_group";

        var fitModel = $("input[name=fitModel]:checked").val();
        var degree = document.getElementById('degree').value;
        var merged_points = mergeUnknownAndKnownPoints(reference_points, result_data);
        var merged_regression_data = getRegression(merged_points, fitModel, degree); //regression.js determines unknown y-coordinate

        // Get inferred data to update graph and table
        var inferred_data = getInferredPointsFromRegression(reference_points, merged_regression_data.points);
        createAxes(reference_points.concat(inferred_data.concat(merged_regression_data.points)), width, height);
        plotPoints(reference_points, reference_SVGgroup);
        plotPoints(inferred_data, inferred_SVGgroup);

        drawLine(merged_regression_data.points);

        fillInferredTable(inferred_data);
    }

    function getRefPoints(editor_json, result_json) {
        // Extract x- and y-coordinate from reference wells
        var reference_points = [];
        var x = [];
        var y = [];

        var plate_index;
        for (var i = 0; i < editor_json.plates.length; i++) {
                if (PLATE_BARCODE.localeCompare(editor_json.plates[i].plateID) === 0) {
                    plate_index = i;
                    break;
                }
        }

        editor_json.plates[0].wells.forEach(function(well) {
            var x_coord = null;

            well.labels.forEach(function(label) {
                if (label.category == Y_CATEGORY)
                    x_coord = parseFloat(replaceDot(label.name));
            });

            if (x_coord !== null)
                y.push(x_coord);
        });

        result_json.plates[plate_index].rows.forEach(function(row) {
            var y_coord = null;

            row.columns.forEach(function(column) {
                if (column.control.localeCompare("POSITIVE") === 0
                    || column.control.localeCompare("NEGATIVE") === 0) {
                    y_coord_string = column.rawData[X_CATEGORY];

                    if (y_coord_string !== undefined) {
                        y_coord = parseFloat(y_coord_string);
                        x.push(y_coord);
                    }
                }
            });
        });

        for (var i = 0; i < x.length; i++)
            if (x[i] !== undefined && y[i] !== undefined)
                reference_points.push([x[i], y[i]]);
        return reference_points;
    }

    function getUnknownPoints(result_data, plate_index) {
        var unknown_points = [];

        result_data.plates[plate_index].rows.forEach(function(row) {
            var x_coord = null;
            var y_coord = null;

            row.columns.forEach(function(column) {
                if (column.control.localeCompare("COMPOUND") === 0) {
                    x_coord_string = column.rawData[X_CATEGORY];
                    y_coord_string = column.rawData[Y_CATEGORY];

                    if (x_coord_string !== undefined)
                        x_coord = parseFloat(x_coord_string);
                    if (y_coord_string !== undefined)
                        y_coord = parseFloat(y_coord_string);

                    if (!(x_coord == null && y_coord == null))
                        unknown_points.push([x_coord, y_coord]);
                }
            });
        });

        return unknown_points;
    }


    function getRegression(reference_points, fitModel, degree) {
        // Draw line according to selected curve fit
        var regression_data;
        if (fitModel === "polynomial") {
            regression_data = regression(fitModel, reference_points, parseFloat(degree));
        }
        else
            regression_data = regression(fitModel, reference_points);

        var newReferencePoints = regression_data.points;

        return regression_data;
    }

    function createGraphAndTable() {
        graph = d3.select('#stdCurveVis')
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "stdCurveGraph");

        // Create axes
        graph.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x_axis");
        graph.append("g").attr("class", "y_axis");

        graph.append("path").attr("class", "line");

        graph.attr("class", "points");

        // Create groups of data sets
        graph.append("g").attr("class", "reference_group");
        graph.append("g").attr("class", "inferred_group");

        // Create table
        table = d3.select("#inferredTable").append("table").attr("class", "table");
        table.append("thead").append("tr").attr("class", "heading");
        table.append("tbody").attr("class", "body");
    }

    function createAxes(points) {
        var min_x = d3.min(points, function(d) { return d[0]; });
        var max_x = d3.max(points, function(d) { return d[0]; });
        x_scale = d3.scale.linear()
            .domain([min_x, max_x])
            .range([0, width]);

        var min_y = d3.min(points, function(d) { return d[1]; });
        var max_y = d3.max(points, function(d) { return d[1]; });
        y_scale = d3.scale.linear()
            .domain([min_y, max_y])
            .range([height, 0]);

        // Create graph axes
        graph.select(".x_axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis()
                .scale(x_scale)
                .orient("bottom"));
        graph.select(".y_axis")
            .call(d3.svg.axis()
                .scale(y_scale)
                .orient("left"));
    }

    function plotPoints(points, group) {
        var circles = graph.select(group).selectAll("circle")
            .data(points);

        circles.exit().remove();
        circles.enter()
            .append("circle");

        circles.attr("cx", function(d) { return x_scale(d[0]); } )
            .attr("cy", function(d) { return y_scale(d[1]); } )
            .attr("r", function() {
                if (group == ".inferred_group")
                    return 2;
                if (group == ".reference_group")
                    return 3;
            })
            .style("stroke", function() {
                if (group == ".inferred_group")
                    return "red";
                if (group == ".reference_group")
                    return "green";
            })
            .style("fill", function() {
                if (group == ".inferred_group")
                    return "none";
                if (group == ".reference_group")
                    return "green";
            });
    }

    function drawLine(points) {
        var min_x = d3.min(points, function(d) { return d[0]; });
        var max_x = d3.max(points, function(d) { return d[0]; });

        var extra_points = interpolate(min_x, max_x);
        var merged_points = points.concat(extra_points);

        var fitModel = $("input[name=fitModel]:checked").val();
        var degree = document.getElementById('degree').value;
        var interpolated_points = getRegression(merged_points, fitModel, degree).points;

        interpolated_points = interpolated_points.sort(function(a, b) {
            return d3.ascending(a[0], b[0]);
        });

        var line = d3.svg.line()
            .x(function(d) { return x_scale(d[0]); })
            .y(function(d) { return y_scale(d[1]); });

        graph.selectAll("path.line")
            .attr("d", line(interpolated_points))
            .attr("stroke", "lightblue")
            .attr("fill", "none");
    }

    function mergeUnknownAndKnownPoints(reference_points, result_data) {
        // Extract x- and y-coordinate from reference wells
        var plate_index;
        for (var i = 0; i < result_data.plates.length; i++) {
                if (PLATE_BARCODE.localeCompare(result_data.plates[i].plateID) === 0) {
                    plate_index = i;
                    break;
                }
        }

        var unknown_points = getUnknownPoints(result_data, plate_index);

        return reference_points.concat(unknown_points);
    }

    function getInferredPointsFromRegression(reference_points, regression_points) {
        // Extract, plot, and return inferred properties
        var inferred_start_index = reference_points.length;
        var inferred_array = regression_points.slice(inferred_start_index);

        return inferred_array;
    }

    function fillInferredTable(inferred_data) {
        inferred_data = inferred_data.sort(function(a, b) {
                return d3.ascending(a[0], b[0]);
            });

        var heading = d3.select("tr.heading").selectAll("th")
            .data([X_CATEGORY, Y_CATEGORY]);
        heading.exit().remove();
        heading.enter().append("th");
        heading.text(function(d) { return d; });

        var rows = d3.select("tbody.body").selectAll("tr")
            .data(inferred_data);
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

    function interpolate(start, end) {
        var length = end - start;
        var interval_length = length/50;
        var points = [];
        var x = start;
        for (var i = 0; i < 50; i++) {
            points.push([x+(i*interval_length), null]);
        }

        return points;
    }

    function replaceDot(dotString) {
        return dotString.replace("__dot__", ".");
    }
}