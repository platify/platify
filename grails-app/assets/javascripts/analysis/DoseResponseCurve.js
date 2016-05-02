function DoseResponseCurve() {
    this.experiment;
    var currentCompoundData;
    var graph;
    var table;
    var x_scale;
    var y_scale;
    var margin;
    var width;
    var height;

    this.init = function(experiment) {
        this.experiment = experiment;
        margin = {top: 10, right: 30, bottom: 60, left: 60};
        width = 650 - margin.left - margin.right;
        height = 550 - margin.top - margin.bottom;

        createGraphAndTable();
    }

    $("#compoundSelect").on('change','select', function() {
        if (COMPOUND=="null")
            return;

        var jqxhr = $.ajax({
            url: hostname + "/doseResponse/getfittedData?experiment_id=" + experiment.experiment.experimentID + "&compound_name=" + COMPOUND,
            contentType: 'application/json; charset=UTF-8',
            data: null,
            method: 'POST',
            processData: false,
        });
        jqxhr.success(function(data) {
            renderDoseResponseCurve(data);
        });
    });

    function updateDoseResponseCurve2(min_param, max_param, ec50, slope) {
        var jqxhr = $.ajax({
            url: hostname + "/doseResponse/getfittedData2?experiment_id=" + experiment.experiment.experimentID + "&compound_name=" + COMPOUND
                + '&min_param=' + min_param + '&max_param=' + max_param + '&ec50=' + ec50 + '&slope=' + slope,
            contentType: 'application/json; charset=UTF-8',
            data: null,
            method: 'POST',
            processData: false,
        });
        jqxhr.success(function(data) {
            renderDoseResponseCurve(data);
        });
    }

    $("#doseResponseButton").click(function() {
        updateDoseResponseCurve2(replaceDot($("#minParameter").val()),
            replaceDot($("#maxParameter").val()),
            replaceDot($("#ec50Parameter").val()),
            replaceDot($("#slopeParameter").val()));
    });

    function renderDoseResponseCurve(data) {
        if (data.err==false) {
            var dose_points = zip2(data.x, data.y1, data.compounds);
            var fitted_points = zip2(data.x, data.y2, data.compounds);

            var dose_SVGgroup = ".dose_group";
//            var fitted_SVGgroup = ".fitted_group";

            createAxes(dose_points.concat(fitted_points), width, height);
            plotPoints(dose_points, dose_SVGgroup);
//            plotPoints(fitted_points, fitted_SVGgroup);
            drawLine(fitted_points);

            $("#minParameter").val(data.parameters['Min_ROUT'].toFixed(2));
            $("#maxParameter").val(data.parameters['Max_ROUT'].toFixed(2));
            $("#ec50Parameter").val(data.parameters['EC50_ROUT'].toFixed(2));
            $("#slopeParameter").val(data.parameters['Slope_ROUT'].toFixed(2));
        } else {
            $('#errorMessage').text("something went wrong:" + data.msg).delay(500).fadeIn('normal', function() {
                $(this).delay(2500).fadeOut();
            });

        }
    }

    function zip2(a1, a2, c)
    {
        var i;
        var z = [];
        for(i=0; i < a1.length; i++)
            z.push([a1[i], a2[i], c[i]]);
        return z;
    }

    function createGraphAndTable() {
        graph = d3.select('#doseResponseCurveVis')
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        // Create axes
        graph.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x_axis");
        graph.append("g").attr("class", "y_axis");

        graph.append("path").attr("class", "line");

        graph.attr("class", "points");

        // Create groups of data sets
        graph.append("g").attr("class", "dose_group");
        graph.append("g").attr("class", "fitted_group");

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
                .ticks(5)
                .orient("bottom"));

        graph.select(".x_axis")
            .append("text")
            .attr("x", 300 )
            .attr("y", 30 )
            .style("text-anchor", "middle")
            .text("log10(dosage)");

        graph.select(".y_axis")
            .call(d3.svg.axis()
                .scale(y_scale)
                .ticks(5)
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
                if (group == ".dose_group")
                    return 3;
                if (group == ".fitted_group")
                    return 3;
            })
            .style("stroke", function() {
                if (group == ".dose_group")
                    return "darkblue";
                if (group == ".fitted_group")
                    return "green";
            })
            .style("fill", function(d) {
                if (group == ".dose_group" && (!d[2].outlier || d[2].outlier.localeCompare("true") !== 0))
                    return "blue";
                else
                    return "white";
            })
            .on("click", function(d) {
                d3.select(this).style("fill", function(d) {console.log(d);
                    if (d[2].outlier && d[2].outlier.localeCompare("true") === 0) {
                        // Turn off outlier status
                        experiment.toggleOutlier(d[2].row, d[2].column, false, "WELL", d[2].barcode);
                        d[2].outlier = "false";
                        return "blue";
                    }
                    else {
                        experiment.toggleOutlier(d[2].row, d[2].column, true, "WELL", d[2].barcode);
                        d[2].outlier = "true";
                        return "white";
                    }
                });

                updateDoseResponseCurve2(replaceDot($("#minParameter").val()),
                            replaceDot($("#maxParameter").val()),
                            replaceDot($("#ec50Parameter").val()),
                            replaceDot($("#slopeParameter").val()));
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

        graph.selectAll("path.line")
            .attr("d", line(sorted_points))
            .attr("stroke", "gray")
            .attr("fill", "none")
            .attr("width", 2);
    }

    function replaceDot(dotString) {
        return dotString.replace("__dot__", ".");
    }
}
