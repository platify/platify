var graph;
var table;
var x_scale;
var y_scale;
var margin;
var width;
var height;

function init() {
    margin = {top: 20, right: 20, bottom: 30, left: 30};
    width = 650 - margin.left - margin.right;
    height = 650 - margin.top - margin.bottom;

    createGraphAndTable();
}

function updateStdCurve(referenceData) {
    REFERENCE_DATA_JSON = JSON.stringify(referenceData);

    var reference_data = JSON.parse(REFERENCE_DATA_JSON);
    var unknown_data = JSON.parse(IMPORT_DATA_JSON);

    var reference_points = getPoints(reference_data);
    createAxes(reference_points, width, height);

    // Plot points of reference wells
    var reference_group = ".reference_group";
    plotPoints(reference_points, reference_group);
    var regression_data = addRegression(reference_points);
    drawLine(regression_data.points);

    var inferred_data = inferUnknownProperties(regression_data, unknown_data);
    fillInferredTable(inferred_data);
}

function getPoints(experiment_json) {
    // Extract x- and y-coordinate from reference wells
    var reference_points = [];
    experiment_json.plates[0].wells.forEach(function(well) {
        var x_coord = null;
        var y_coord = null;

        well.labels.forEach(function(label) {
            if (label.category == X_CATEGORY)
                x_coord = parseFloat(label.name);
            if (label.category == Y_CATEGORY)
                y_coord = parseFloat(label.name);
        });

        if (x_coord !== null && y_coord !== null)
            reference_points.push([x_coord, y_coord]);
    });

    return reference_points;
}

function addRegression(reference_points) {
    // Draw line according to selected curve fit
    var regression_model = "linearThroughOrigin";
    var regression_data = regression(regression_model, reference_points);
    var newReferencePoints = regression_data.points;

    return regression_data;
}

function createGraphAndTable() {
    chart = d3.select('#stdCurveVis')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "stdCurveGraph");

    // Create axes
    chart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x_axis");
    chart.append("g").attr("class", "y_axis");

    chart.append("path").attr("class", "line");

    chart.attr("class", "points");

    // Create groups of data sets
    chart.append("g").attr("class", "reference_group");
    chart.append("g").attr("class", "inferred_group");

    // Create table
    table = d3.select("#inferredTable").append("table").attr("class", "table");
    table.append("thead").append("tr").attr("class", "heading");
    table.append("tbody").attr("class", "body");

}

function createAxes(points) {
    var max_x = d3.max(points, function(d) { return d[0]; });
    x_scale = d3.scale.linear()
        .domain([0, max_x])
        .range([0, width]);

    var max_y = d3.max(points, function(d) { return d[1]; });
    y_scale = d3.scale.linear()
        .domain([0, max_y])
        .range([height, 0]);

    // Create graph axes
    chart.select(".x_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis()
            .scale(x_scale)
            .orient("bottom"));
    chart.select(".y_axis")
        .call(d3.svg.axis()
            .scale(y_scale)
            .orient("left"));
}

function plotPoints(points, group) {
    chart.select(group).selectAll("circle")
        .data(points).exit().remove()
        .data(points).enter()
        .append("circle")
        .attr("cx", function(d) { return x_scale(d[0]); } )
        .attr("cy", function(d) { return y_scale(d[1]); } )
        .attr("r", 2)
        .style("fill", function(){
            if (group == ".inferred_group")
                return "red";
            if (group == ".reference_group")
                return "green";
        });
}

function drawLine(points) {
    points.push([0,0]);

    var line = d3.svg.line()
        .x(function(d) { return x_scale(d[0]); })
        .y(function(d) { return y_scale(d[1]); });

    chart.selectAll("path.line")
        .attr("d", line(points))
        .attr("stroke", "lightblue");
}

function inferUnknownProperties(regression_data, unknown_data) {
     // Extract x- and y-coordinate from reference wells
        var unknown_points = [];
        unknown_data.plates[2].rows.forEach(function(row) {
            var x_coord = null;
            var y_coord = null;

            row.columns.forEach(function(column) {
                x_coord_string = column.rawData[X_CATEGORY];
                y_coord_string = column.rawData[Y_CATEGORY];

                if (x_coord_string !== undefined)
                    x_coord = parseFloat(x_coord_string);
                if (y_coord_string !== undefined)
                    y_coord = parseFloat(y_coord_string);

                if (!(x_coord == null && y_coord == null))
                    unknown_points.push([x_coord, y_coord]);
            });
        });

        merged_points = regression_data.points.concat(unknown_points);
        var merged_regression_data = addRegression(merged_points); //regression.js determines unknown y-coordinate
        createAxes(merged_regression_data.points, width, height);

        // Extract, plot, and return inferred properties
        var inferred_start_index = regression_data.points.length;
        var inferred_array = merged_regression_data.points.slice(inferred_start_index);
        plotPoints(inferred_array, ".inferred_group");
        return inferred_array;
}

function fillInferredTable(inferred_data) {
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

window.onload = init;
