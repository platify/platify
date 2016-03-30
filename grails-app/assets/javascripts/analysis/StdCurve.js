var graph;
var x_scale;
var y_scale;
var margin;
var width;
var height;

function getReferenceData(referenceData) {
    REFERENCE_DATA_JSON = JSON.stringify(referenceData);

    plotData();
}

function plotData() {
    // Extract x- and y-coordinate from reference wells
    var referencePoints = [];
    var experiment_json = JSON.parse(REFERENCE_DATA_JSON);
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
            referencePoints.push([x_coord, y_coord]);
    });

    createAxes(referencePoints, width, height);

    // Plot points of reference wells
    var reference_group = ".reference_group";
    plotPoints(referencePoints, reference_group);

    // Draw line according to selected curve fit
    var regression_model = "linearThroughOrigin";
    var newReferencePoints = regression(regression_model, referencePoints).points;
    drawLine(newReferencePoints);
}

function init() {
    //console.log(IMPORT_DATA_JSON);

    margin = {top: 20, right: 20, bottom: 30, left: 30};
    width = 650 - margin.left - margin.right;
    height = 650 - margin.top - margin.bottom;

    createGraph();
}

function createGraph() {
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
        .attr("r", 2);
}

function drawLine(points) {
    points.push([0,0]);

    var line = d3.svg.line()
        .x(function(d) { return x_scale(d[0]); })
        .y(function(d) { return y_scale(d[1]); });

    chart.selectAll("path.line")
        .attr("d", line(points))
        .attr("stroke", "blue");
}

window.onload = init;
