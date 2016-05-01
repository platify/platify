function StdCurve() {
    this.experiment;
    var controls_editor_data;
    var allControls;
    var graph, table, x_scale, y_scale, margin, width, height; //vis variables
    var exp_id;
    var currentBarcode;
    var currentStdCurve; //barcode
    var current_result_index; // current plate index in experiment.experiment.plates
    var ref_outlier_points;
    var regressionAllChecked;
    var previouslySet; //if standard curves were previously set
    var stdCurvePlates;

    this.init = function(experiment) {
        this.experiment = experiment;
        exp_id = experiment.experiment.experimentID;
        currentBarcode = experiment.currentPlate.plateID;
        regressionAllChecked = $('#regressionCheckbox').attr('checked');
        ref_outlier_points = [];
        previouslySet = false;

        margin = {top: 10, right: 30, bottom: 50, left: 60};
        width = 700 - margin.left - margin.right;
        height = 550 - margin.top - margin.bottom;

        var jqxhr = $.ajax({
            url: hostname + "/experimentalPlateSet/getControls/" + exp_id,
            contentType: 'application/json; charset=UTF-8',
            data: null,
            type: "POST",
            processData: false
        });
        jqxhr.success(function(data) {
            controls_editor_data = data.editorControlsData;
        });

        createGraphAndTable();
    }

    $('#regressionCheckbox').on('click', function(event) {
        regressionAllChecked = this.checked;
    });

    $('#stdCurveButton').on('click', function() {
        previouslySet = true;
        currentBarcode = experiment.currentPlate.plateID;
        current_result_index = getResultPlateIndex(currentBarcode);
        setStdCurves();
        setRegression();
        updateStdCurve();
        storeNormalized();
//        persistNormalized();
    });

    $("#refXCategorySelect").on('change','select', function() {
        var exp_id = experiment.experiment.experimentID;
        var jqxhr = $.ajax({
            url: hostname + "/stdCurve/getReferenceYCategories?barcode=" + currentBarcode + "&exp_id=" + exp_id,
            contentType: 'application/json; charset=UTF-8',
            data: null,
            method: 'POST',
            processData: false,
        });
        jqxhr.success(function(data) {
            $("#refYCategorySelect").html(data);
            console.log('Retrieved categories of plate.');
        });
    });

    $("#refYCategorySelect").on('change','select', function() {
        determineStdCurves();
        displayStdCurveOptions();
    });

    function displayStdCurveOptions() {
        $('#scPlate').empty();
        var sourcePlate = document.getElementById("scPlate");
        var plateOption = new Option("default", "default", false, false);
        sourcePlate.options[sourcePlate.options.length] = plateOption;
        stdCurvePlates.forEach(function(barcode) {
            var plateOption = new Option(barcode, barcode, false, false);
            sourcePlate.options[sourcePlate.options.length] = plateOption;
        });
    }

    function determineStdCurves() {
        stdCurvePlates = [];
        controls_editor_data.plates.forEach(function(plate) {
            plate.wells[0].labels.forEach(function(label) {
                if (label.category.localeCompare(Y_CATEGORY) === 0)
                    stdCurvePlates.push(plate.plateID);
                    return;
            });
        });
    }

    // Set default std curve for each plate
    function setStdCurves() {
        var scBarcode = document.getElementById("scPlate").value;
        if (scBarcode.localeCompare("default") === 0) {
            var currentStdCurve = stdCurvePlates[0];
            experiment.experiment.plates.forEach(function(plate) {
                if (stdCurvePlates.includes(plate.plateID))
                    currentStdCurve = plate.plateID;
                if (regressionAllChecked || plate.plateID.localeCompare(currentBarcode) === 0) {
                    plate.stdCurveBarcode = currentStdCurve;
                }
            });
        }
        else if (regressionAllChecked) {
            experiment.experiment.plates.forEach(function(plate) {
                plate.stdCurveBarcode = scBarcode;
            });
        }
        else
            experiment.experiment.plates[current_result_index].stdCurveBarcode = scBarcode;
    }

    // Set regression model for all plates
    function setRegression() {
        var fitModel = $("input[name=fitModel]:checked").val();
        var degree = document.getElementById('degree').value;

        var stdCurvePlate = experiment.experiment.plates[current_result_index].stdCurveBarcode;

        // Update the fit for all plates using the same standard curve plate
        experiment.experiment.plates.forEach(function(plate) {
            if (regressionAllChecked || plate.stdCurveBarcode.localeCompare(stdCurvePlate) === 0) {
                plate.fitModel = fitModel;
                plate.degree = degree;
            }
        });
    }

    function updateStdCurve() {
        var stdCurvePlate = experiment.experiment.plates[current_result_index].stdCurveBarcode;
        document.getElementById('stdCurveLabel').textContent = "Standard Curve Source: " + stdCurvePlate;


        var reference_points = getRefPoints(currentBarcode, controls_editor_data);

        var fitModel = experiment.experiment.plates[current_result_index].fitModel;
        var degree = experiment.experiment.plates[current_result_index].degree;

        createAxes(reference_points.concat(ref_outlier_points), width, height);
        plotPoints(allControls);

        if (fitModel === undefined) {
            drawLine([], null, null);
            return;
        }

        var ref_fit = getRegression(reference_points, fitModel, degree);
        drawLine(ref_fit.points, fitModel, degree);

        var r2 = d3.round(ref_fit.r2 * 100, 2);
        if (r2 < 0)
            r2 = 0;
        fillLegend("R-squared: " + r2 + "%", ref_fit.string);

        // Commented out code to show inferred data
        //var merged_points = mergeUnknownAndKnownPoints(currentBarcode, reference_points);
        //var merged_regression_data = getRegression(merged_points, fitModel, degree); //regression.js determines unknown y-coordinate
        //var inferred_data = getInferredPointsFromRegression(reference_points, merged_regression_data.points);
        //createAxes(reference_points.concat(inferred_data.concat(merged_regression_data.points)), width, height);
        //plotPoints(inferred_data, inferred_SVGgroup); //plots the inferred points along the std curve; no longer done.
        //fillInferredTable(inferred_data);
    }

    this.updateStdCurveWithoutRecalculate = function() {
        if (previouslySet) {
            currentBarcode = experiment.currentPlate.plateID;
            current_result_index = getResultPlateIndex(currentBarcode);
            updateStdCurve();
            updateSettings(); //display regression model settings for selected plate
        }
    }

    function getResultPlateIndex(plate_barcode) {
        for (var i = 0; i < experiment.experiment.plates.length; i++) {
            if (plate_barcode.localeCompare(experiment.experiment.plates[i].plateID) === 0) {
                return i;
            }
        }
    }

    function getEditorPlateIndex(plate_barcode) {
        for (var i = 0; i < experiment.experiment.plates.length; i++) {
            if (plate_barcode.localeCompare(controls_editor_data.plates[i].plateID) === 0) {
                return i;
            }
        }
    }

    function updateSettings() {
        var fitModel = experiment.experiment.plates[current_result_index].fitModel;
        var degree = experiment.experiment.plates[current_result_index].degree;
        $("input:radio[name=fitModel]").val([fitModel]);
        document.getElementById('degree').value = degree;
    }

    function getRefPoints(barcode, editor_json) {
        allControls = [];

        // Extract x- and y-coordinate from reference wells
        var reference_points = [];
        var x = [];
        var y = [];

        var outlier_points = [];
        var x_outliers = [];
        var y_outliers = [];

        var plate_index = getResultPlateIndex(barcode);
        var stdCurveBarcode = experiment.experiment.plates[plate_index].stdCurveBarcode;
        var sc_index = getResultPlateIndex(stdCurveBarcode);

        // Get std curve "known" x-coordinate
        // todo: rename the mismatched x- & y-coord variable names
        experiment.experiment.plates[sc_index].rows.forEach(function(row, row_i) {
            var x_coord = null;
            var y_coord = null;

            row.columns.forEach(function(column, col_i) {
                if (column.control.localeCompare("POSITIVE") === 0 || column.control.localeCompare("NEGATIVE") === 0) {
                    x_coord_string = column.labels[Y_CATEGORY];
                    y_coord_string = column.rawData[X_CATEGORY];

                    var controlProperties = [];
                    if (y_coord_string !== undefined && y_coord_string !== null
                        && x_coord_string !== undefined && x_coord_string !== null) {

                        x_coord = parseFloat(replaceDot(x_coord_string));
                        y_coord = parseFloat(replaceDot(y_coord_string));

                        controlProperties["x"] = y_coord;
                        controlProperties["y"] = x_coord;
                        controlProperties["outlier"]
                            = (column.outlier === null || column.outlier.localeCompare("true") !== 0) ? "false" : "true";
                        controlProperties["row"] = row_i;
                        controlProperties["column"] = col_i;
                        allControls.push(controlProperties);
                    }

                    if (column.outlier !== "true" && y_coord_string !== undefined && y_coord_string !== null) {
                        x.push(y_coord);
                        y.push(x_coord);
                    }
                    else if (y_coord_string !== undefined && y_coord_string !== null) {
                        x_outliers.push(y_coord);
                        y_outliers.push(x_coord);
                    }
                }
            });
        });

        for (var i = 0; i < x.length; i++)
            if (x[i] !== undefined && y[i] !== undefined)
                reference_points.push([x[i], y[i]]);

        for (var i = 0; i < x_outliers.length; i++)
            if (x_outliers[i] !== undefined && y_outliers[i] !== undefined)
                outlier_points.push([x_outliers[i], y_outliers[i]]);

        ref_outlier_points = outlier_points;

        return reference_points;
    }

    function getUnknownPoints(plate_index) {
        var unknown_points = [];

        experiment.experiment.plates[plate_index].rows.forEach(function(row) {
            var x_coord = null;
            var y_coord = null;

            row.columns.forEach(function(column) {
                if (column.control.localeCompare("COMPOUND") === 0) {

                    x_coord_string = column.rawData[X_CATEGORY];
                    y_coord_string = column.rawData[Y_CATEGORY];

                    if (x_coord_string !== undefined)
                        x_coord = parseFloat(replaceDot(x_coord_string));
                    if (y_coord_string !== undefined)
                        y_coord = parseFloat(replaceDot(y_coord_string));

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
        graph.append("g").attr("class", "sc_points");

        graph.append("g")
            .attr("class", "sc_legend")
            .attr('transform', 'translate(-15,50)');

//        // Create table
//        table = d3.select("#inferredTable").append("table").attr("class", "table");
//        table.append("thead").append("tr").attr("class", "heading");
//        table.append("tbody").attr("class", "body");
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

    function plotPoints(points) {
        var circles = graph.select(".sc_points").selectAll("circle")
            .data(points);

        circles.exit().remove();
        circles.enter()
            .append("circle").attr("class", "circle");

        circles.attr("cx", function(d) { return x_scale(d["x"]); } )
            .attr("cy", function(d) { return y_scale(d["y"]); } )
            .attr("r", 3)
            .style("stroke", "darkgreen")
            .style("fill", function(d) {
                if (d["outlier"].localeCompare("true") === 0)
                    return "white";
                else
                    return "green";
            })
            .on("click", function(d) {
                d3.select(this).style("fill", function(d) {
                    var currentSC = experiment.experiment.plates[current_result_index].stdCurveBarcode;

                    if (d["outlier"].localeCompare("true") === 0) {
                        // Turn off outlier status
                        experiment.toggleOutlier(d["row"], d["column"], false, "WELL", currentSC);
                        d["outlier"] = "false";
                        return "green";
                    }
                    else {
                        experiment.toggleOutlier(d["row"], d["column"], true, "WELL", currentSC);
                        d["outlier"] = "true";
                        return "white";
                    }
                });

                setRegression();
                updateStdCurve();
                storeNormalized();
        //        persistNormalized();
            });
    }

    function drawLine(points, fitModel, degree) {
        var line = d3.svg.line()
            .x(function(d) { return x_scale(d[0]); })
            .y(function(d) { return y_scale(d[1]); });

        if (fitModel == null) {
            graph.selectAll("path.line").attr("d", line([]));
            return;
        }

        var min_x = d3.min(points, function(d) { return d[0]; });
        var max_x = d3.max(points, function(d) { return d[0]; });

        var extra_points = interpolate(min_x, max_x);
        var merged_points = points.concat(extra_points);

        var interpolated_points = getRegression(merged_points, fitModel, degree).points;
        if (interpolated_points === undefined)
            return;

        interpolated_points = interpolated_points.sort(function(a, b) {
            return d3.ascending(a[0], b[0]);
        });

        graph.selectAll("path.line")
            .attr("d", line(interpolated_points))
            .attr("stroke", "lightblue")
            .attr("fill", "none");
    }

    function fillLegend(fit_eq, r2) {
        var legend = graph.select(".sc_legend").selectAll('text')
            .data([fit_eq, r2]);

        legend.exit().remove();
        legend.enter()
            .append("text");
        legend.attr("x", 40)
            .attr("y", function(d, i){ return i * 30;})
            .style("font-style", "italic")
            .style("fill", "gray")
            .text(function(d) {
                return d;
            })
            .call(wrap, 300);
    }

    // Mike Bostock's wrap function
    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = 0, //parseFloat(text.attr("dy")),
                tspan = text.text(null)
                            .append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan")
                                .attr("x", x)
                                .attr("y", y)
                                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                                .text(word);
                }
            }
        });
    }

    function mergeUnknownAndKnownPoints(barcode, reference_points) {
        // Extract x- and y-coordinate from reference wells
        var plate_index;
        for (var i = 0; i < experiment.experiment.plates.length; i++) {
            if (barcode.localeCompare(experiment.experiment.plates[i].plateID) === 0) {
                plate_index = i;
                break;
            }
        }

        var unknown_points = getUnknownPoints(plate_index);

        return reference_points.concat(unknown_points);
    }

    function getInferredPointsFromRegression(reference_points, regression_points) {
        // Extract, plot, and return inferred properties
        var inferred_start_index = reference_points.length;
        var inferred_array = regression_points.slice(inferred_start_index);

        return inferred_array;
    }

    // No longer used, but keeping method in case needed in future
    /*function fillInferredTable(inferred_data) {
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
    }*/

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

    // stores normalized values in ExperimentModel
    function storeNormalized() {

        var stdCurvePlate = experiment.experiment.plates[current_result_index].stdCurveBarcode;

        var label = X_CATEGORY;

        this.experiment.experiment.plates.forEach(function(plate) {
            if (plate.stdCurveBarcode.localeCompare(stdCurvePlate) === 0 || regressionAllChecked) {
                var reference_points = getRefPoints(plate.plateID, controls_editor_data);
                var merged_points = mergeUnknownAndKnownPoints(plate.plateID, reference_points);
                var merged_regression_points = getRegression(merged_points, plate.fitModel, plate.degree).points; //regression.js determines unknown y-coordinate

                merged_regression_points = d3.nest()
                    .key(function(point) { return point[0]; })
                    .rollup(function(v) { return v[0][1]; })
                    .map(merged_regression_points);

                plate.rows.forEach(function(row) {
                    row.columns.forEach(function(well) {
                        var inferred_val;
                        if (well.control.localeCompare("COMPOUND") !== 0)
                            inferred_val = well.labels[Y_CATEGORY];
                        else
                            inferred_val = merged_regression_points[well.rawData[X_CATEGORY]];

                        well.normalizedData[label] = inferred_val.toString();
                    });
                });
            }
        });
    }


//    function persistNormalized() {
//        if (!regressionAllChecked) {
//
//        }
//
//        else {
//            // the save endpoint only wants the current plate
//            var data = {
//                experimentID: exp_id,
//                parsingID: this.experiment.currentPlate.parsingID,
//                plates: this.experiment.experiment.plates
//            }
//
//            var url = RESULT_SAVE_REFACTORED_DATA_URL + '/' + 0; //todo: don't actually need result ID for url
//            var jqxhr = $.ajax({
//                url: url,
//                contentType: 'application/json; charset=UTF-8',
//                data: JSON.stringify(data),
//                method: 'POST',
//                processData: false,
//            });
//            jqxhr.done(function() {
//                console.log('POST of std curve normalized data complete');
//            });
//        }
//    }

    function replaceDot(dotString) {
        return dotString.replace("__dot__", ".");
    }
}