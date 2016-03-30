var graph;
var reference_group;
var newReference_group;
var x_scale;
var y_scale;

function getReferenceData(referenceData) {
    REFERENCE_DATA_JSON = JSON.stringify(referenceData);
    console.log(REFERENCE_DATA_JSON);
}

function init() {
//console.log(IMPORT_DATA_JSON);

    // Extract x- and y-coordinate from reference wells
    var referencePoints = [];
    var experiment_json = JSON.parse(IMPORT_DATA_JSON);
    experiment_json.plates[0].wells.forEach(function(well) {
        var x_coord = null;
        var y_coord = null;

        well.labels.forEach(function(label) {
            if (label.category == "dosage")
                x_coord = parseFloat(label.name);
            if (label.category == "Absorbance")
                y_coord = parseFloat(label.name);
        });

        if (x_coord !== null && y_coord !== null)
            referencePoints.push([x_coord, y_coord]);
    });

//    console.log(referencePoints);

    // Plot points of reference wells
    createGraph(referencePoints);
    plotPoints(referencePoints, reference_group);

    // Draw line according to selected curve fit
    var regression_model = "linearThroughOrigin";
    var newReferencePoints = regression(regression_model, referencePoints).points;
    plotPoints(newReferencePoints, newReference_group);
    drawLine(referencePoints);

    // Plot points of unknown samples
}

function createGraph(points) {
    var margin = {top: 20, right: 20, bottom: 30, left: 30};
    var width = 650 - margin.left - margin.right;
    var height = 650 - margin.top - margin.bottom;

    chart = d3.select('#stdCurveVis')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "stdCurveGraph");

    createAxes(points, width, height);

    // Create groups needed for different data sets
    reference_group = chart.append("g");
    newReference_group = chart.append("g");
}

function createAxes(points, width, height) {
    var max_x = d3.max(points, function(d) { return d[0]; });
    x_scale = d3.scale.linear()
        .domain([0, max_x])
        .range([0, width]);

    var max_y = d3.max(points, function(d) { return d[1]; });
    y_scale = d3.scale.linear()
        .domain([0, max_y])
        .range([height, 0]);

    // Create graph axes
    chart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis()
            .scale(x_scale)
            .orient("bottom"));
    chart.append("g")
        .call(d3.svg.axis()
            .scale(y_scale)
            .orient("left"));
}

function plotPoints(points, group) {
    group.selectAll("points")
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

    chart.selectAll("path")
        .data(points).enter()
        .append("path")
        .attr("d", line(points))
        .attr("stroke", "blue");
}

window.onload = init;
