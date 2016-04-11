var graph;
var table;
var x_scale;
var y_scale;
var margin;
var width;
var height;

function init() {
    margin = {top: 10, right: 30, bottom: 30, left: 40};
    width = 650 - margin.left - margin.right;
    height = 575 - margin.top - margin.bottom;

    createGraphAndTable();
}

$("#stdCurveButton").click(function() {
    updateDoseResponseCurve();
});

function updateDoseResponseCurve() {
    var reference_data = REFERENCE_DATA_JSON;
    var unknown_data = IMPORT_DATA_JSON;

    var reference_points = getRefPoints(reference_data);

    var fitModel = $("input[name=fitModel]:checked").val();
    var degree = document.getElementById('degree').value;
    var merged_points = mergeUnknownAndKnownPoints(reference_points, unknown_data);
    var merged_regression_data = getRegression(merged_points, fitModel, degree); //regression.js determines unknown y-coordinate

    // Get inferred data to update graph and table
    var inferred_data = getInferredPointsFromRegression(reference_points, merged_regression_data.points);
    createAxes(reference_points.concat(inferred_data.concat(merged_regression_data.points)), width, height);
    plotPoints(reference_points, reference_SVGgroup);
    plotPoints(inferred_data, inferred_SVGgroup);

    drawLine(merged_regression_data.points);

    fillInferredTable(inferred_data);
}

/*
    Currently unused; for later add-on.
*/
function updateRegressionPreview(referenceData) {
    REFERENCE_DATA_JSON = JSON.stringify(referenceData);

    var reference_data = JSON.parse(REFERENCE_DATA_JSON);

    var reference_points = getRefPoints(reference_data);

    var reference_SVGgroup = ".reference_group";

    var regression_data = getRegression(reference_points); //regression.js determines unknown y-coordinate

    createAxes(reference_points.concat(regression_data.points), width, height);
    plotPoints(reference_points, reference_SVGgroup);
    drawLine(regression_data.points);
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
    var circles = chart.select(group).selectAll("circle")
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

    chart.selectAll("path.line")
        .attr("d", line(interpolated_points))
        .attr("stroke", "lightblue")
        .attr("fill", "none");
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

window.onload = init;
