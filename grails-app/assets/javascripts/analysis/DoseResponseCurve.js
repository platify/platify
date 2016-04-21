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

$("#doseResponseButton").click(function() {

    updateDoseResponseCurve2(replaceDot($("#minParameter").val()),
        replaceDot($("#maxParameter").val()),
        replaceDot($("#ec50Parameter").val()),
        replaceDot($("#slopeParameter").val()));
});

function renderDoseResponseCurve(data) {

    var dose_points = zip2(data.x, data.y1);
    var fitted_points = zip2(data.x, data.y2);
    var extra_points = zip2(data.x3, data.y3);

    var dose_SVGgroup = ".dose_group";
    var fitted_SVGgroup = ".fitted_group";

    createAxes(dose_points.concat(fitted_points), width, height);
    plotPoints(dose_points, dose_SVGgroup);
    plotPoints(fitted_points, fitted_SVGgroup);
    drawLine(fitted_points.concat(extra_points));

    $("#minParameter").val(data.parameters['Min_ROUT'].toFixed(2));
    $("#maxParameter").val(data.parameters['Max_ROUT'].toFixed(2));
    $("#ec50Parameter").val(data.parameters['EC50_ROUT'].toFixed(2));
    $("#slopeParameter").val(data.parameters['Slope_ROUT'].toFixed(2));
}

function zip2(a1, a2)
{
    var i;
    var z = [];
    for(i=0; i < a1.length; i++)
        z.push([a1[i], a2[i]]);
    return z;
}

function createGraphAndTable() {
    chart = d3.select('#doseResponseCurveVis')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // Create axes
    chart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x_axis");
    chart.append("g").attr("class", "y_axis");

    chart.append("path").attr("class", "line");

    chart.attr("class", "points");

    // Create groups of data sets
    chart.append("g").attr("class", "dose_group");
    chart.append("g").attr("class", "fitted_group");

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
            if (group == ".dose_group")
                return 2;
            if (group == ".fitted_group")
                return 3;
        })
        .style("stroke", function() {
            if (group == ".dose_group")
                return "red";
            if (group == ".fitted_group")
                return "green";
        })
        .style("fill", function() {
            if (group == ".dose_group")
                return "none";
            if (group == ".fitted_group")
                return "green";
        });
}


function drawLine(points) {
    var min_x = d3.min(points, function(d) { return d[0]; });
    var max_x = d3.max(points, function(d) { return d[0]; });

    var sorted_points = points.sort(function(a, b) {
        return d3.ascending(a[0], b[0]);
    });

    var line = d3.svg.line()
        .x(function(d) { return x_scale(d[0]); })
        .y(function(d) { return y_scale(d[1]); });

    chart.selectAll("path.line")
        .attr("d", line(sorted_points))
        .attr("stroke", "lightblue")
        .attr("fill", "none");
}

function replaceDot(dotString) {
    return dotString.replace("__dot__", ".");
}


window.onload = init;
