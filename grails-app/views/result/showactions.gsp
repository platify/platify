<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<title>Results</title>

		<asset:stylesheet href="jquery-ui.css"/>
		<asset:stylesheet href="grid/style.css"/>
		<asset:stylesheet href="grid/slick.grid.css"/>
		<asset:stylesheet href="grid/slick-default-theme.css"/>
		<asset:stylesheet href="grid/Grid.css"/>
		<asset:stylesheet href="scatter/Scatter.css"/>
		<asset:stylesheet href="colorbrewer.css"/>
		<asset:stylesheet href="dataTables.bootstrap.css"/>
		<asset:stylesheet href="dataTables.tableTools.css"/>

	</head>

	<body>
		<div class="container">
			<div class="row">
				<h3 style="margin-left: 15px">Results</h3>
				<ol class="breadcrumb">
					<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
					<li><a href="${createLink(controller: 'experimentalPlateSet', action: 'index')}">Assays</a></li>
					<li>Results</li>
				</ol>
			</div>

			<div class="panel panel-default">
				<div class="panel-heading">
					<h4 class="panel-title">
						Plates
						<span id="downloadButtons" class="pull-right">
							Download:
                            <button class="btn btn-info btn-xs" type="submit" data-fileformat="json">JSON</button>
							<button class="btn btn-info btn-xs" type="submit" data-fileformat="csv">CSV</button>
							<button class="btn btn-info btn-xs" type="submit" data-fileformat="tsv">TSV</button>
						</span>
					</h4>
				</div>
				<div class="panel-body">
					<table id="plateTable" class="table table-bordered table-condensed table-striped display">
						<thead>
							<tr>
								<th>Plate ID</th>
								<th>Results Imported</th>
								<th>Z-Factor</th>
								<th>Z'-Factor</th>
								<th>Mean Negative Control</th>
								<th>Mean Positive Control</th>
                                <th>Mean Non-Control</th>
							</tr>
						</thead>
					</table>
				</div>
				<div id="slider"></div>
			</div>

			<div class="panel panel-default">
				<div class="panel-heading">
					<h4 class="panel-title">
						<span id="rawDataLabel"></span>
						<span class="pull-right">
							<label class="btn btn-info btn-xs">
								<input id="normalizeButton" type="checkbox">Normalize Data
							</label>
							<label class="btn btn-info btn-xs">
								<input id="heatMapButton" type="checkbox" checked>Show Heat Map
							</label>
						</span>
					</h4>
				</div>
				<div class="panel-body">
				<div id="tabs" >
                    <ul style="background-color:#d9edf7;" >
                        <li><a href="#resultGrid">Result Grid</a></li>
                        <li><a href="#scatterplot">Scatter Plot</a></li>
                        <li><a href="#scatterplot_control">Controls Plot</a></li>
                        <li><a href="#standardCurve">Standard Curve</a></li>
                        <li><a href="#histogram">Histogram</a></li>
                    </ul>
					<div id="resultGrid" class="Blues" style="width:100%;height:650px;"></div>
					<div id="scatterplot" style="width:100%;height:650px;"></div>
					<div id="scatterplot_control" style="width:100%;height:650px;"></div>
                    <div id="standardCurve" style="width:100%;height:650px;">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="row">
                                    <h5><b>PROPERTIES</b></h5>
                                    Known Property: <span id="refXCategorySelect"></span><br>
                                    Unknown Property: <span id="refYCategorySelect"></span>
                                </div><br>
                                <div class="row">
                                    <h5><b>STANDARD CURVE SOURCE</b></h5>
                                    <g:select name="scPlate" id="scPlate"
                                              from="" noSelection="[null:'default']"/>
                                </div><br>
                                <div class="row">
                                    <h5><b>REGRESSION MODEL</b></h5>
                                    <input type="radio" name="fitModel" value="linearThroughOrigin" checked="checked"> Linear<br>
                                    <input type="radio" name="fitModel" value="exponential"> Exponential<br>
                                    <input type="radio" name="fitModel" value="logarithmic"> Logarithmic<br>
                                    <input type="radio" name="fitModel" value="power"> Power<br>
                                    <input type="radio" name="fitModel" value="polynomial"> Polynomial
                                    <input type="text" id="degree" name="degree" placeholder="degree" maxlength="1" size="4"><br>
                                </div><br>
                                <div class="row">
                                    <input id="regressionCheckbox" type="checkbox" checked="checked"> Apply settings to all plates
                                    <br><br>
                                    <div class="centerWrapper" style="text-align: center">
                                        <button id="stdCurveButton">Generate</button>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-9">
                                <div class="panel panel-default">
                                    <div class="panel-heading">
                                        <h4 class="panel-title">
                                            <span id="stdCurveLabel"></span>
                                        </h4>
                                    </div>
                                    <div class="panel-body">
                                        <div id="stdCurveVis"></div>
                                    </div>
                                </div>
                            </div>
                            %{--<div class="col-md-4">--}%
                                %{--<div class="panel panel-default" style="height: 430px; overflow: auto;">--}%
                                    %{--<div class="panel-heading">--}%
                                        %{--<h4 class="panel-title">--}%
                                            %{--<span id="inferredLabel">Inferred Properties</span>--}%
                                        %{--</h4>--}%
                                    %{--</div>--}%
                                    %{--<div class="panel-body">--}%
                                        %{--<div id="inferredTable"></div>--}%
                                    %{--</div>--}%
                                %{--</div>--}%
                            %{--</div>--}%
                        </div>
                    </div>

                    <div id="histogram" style="width:100%;height:650px;">
                        <div class="col-md-2">
                            <div class="row">
                                <h5><b>Replicates</b></h5>
                                <input type="radio" name="replicate_option" value="mean"> Mean<br>
                                <input type="radio" name="replicate_option" value="median"> Median<br>
                                <input type="radio" name="replicate_option" value="none" checked="checked"> None<br>
                            </div>
                            <div class="row">
                                <h5><b>Bin Width</b></h5>
                                <input type="text" id="bin_width" placeholder="bin_width" size="5" value=5>
                            </div>
                            <div class="row">
                                <h5><b>Cut-off</b></h5>
                                <input type="text" id="cutoff" placeholder="cutoff" size="5" value=0>
                            </div>
                            <div class="row">
                                <button id="histogramButton">Generate</button>
                            </div>
                        </div>
                        <div class="col-md-7">
                            <div id="histogramVis"></div>
                            <div id="histogramOutliers"></div>
                        </div>
                        <div class="col-md-3" style="height:600px;overflow: auto;">
                            <div id="cutoffTable"></div>
                        </div>
                    </div>

                </div>
				</div>


			</div>
		</div>

	<!-- library scripts, for using Slickgrid -->
	<asset:javascript src="jquery-ui.js" />
	<asset:javascript src="jquery.event.drag-2.2.js" />
	<asset:javascript src="grid/slick.autotooltips.js" />
	<asset:javascript src="grid/slick.cellcopymanager.js" />
	<asset:javascript src="grid/slick.cellrangedecorator.js" />
	<asset:javascript src="grid/slick.cellrangeselector.js" />
	<asset:javascript src="grid/slick.cellselectionmodel.js" />
	<asset:javascript src="grid/slick.core.js" />
	<asset:javascript src="grid/slick.editors.js" />
	<asset:javascript src="grid/slick.grid.js" />

	<!-- The SlickGrid wrapper script -->
	<asset:javascript src="grid/Grid.js" />

	<!-- d3 -->
	<asset:javascript src="d3.v3.min.js" />

	<!-- datatables -->
	<asset:javascript src="jquery.dataTables.js" />
	<asset:javascript src="dataTables.tableTools.js" />

	<!-- importData forked from the parser -->
	<asset:javascript src="result/ImportData.js" />
	<asset:javascript src="result/ImportDataFileGenerator.js" />

	<!-- results-specific js -->
	<asset:javascript src="plate-statistics/statistics.js" />

    %{-- standard curve js--}%
    <asset:javascript src="regression.js"/>
    <asset:javascript src="analysis/StdCurve.js" />

	<g:javascript>
        var RESULT_SAVE_REFACTORED_DATA_URL = "${createLink(controller: 'refactoredData', action: 'save', resultInstance: null)}";
        var IMPORT_DATA_JSON = JSON.stringify(${importData.encodeAsJSON()});
        var EXPERIMENT_ID = ${exp_id};

        %{-- standard curve start --}%

        var PLATE_ID;
        var PLATE_BARCODE;
        var X_CATEGORY;
        var Y_CATEGORY;

        %{--<g:remoteFunction controller="stdCurve" action="getPlates"--}%
                          %{--update="scPlateSelect"--}%
                          %{--params="'experiment_id='+EXPERIMENT_ID"/>--}%

        <g:remoteFunction controller="stdCurve" action="getReferenceXCategories"
                          update="refXCategorySelect"
                          params="'experiment_id='+EXPERIMENT_ID"/>

        function scPlateChanged(plateId) {
            var plateSelect = document.getElementById("scPlate");
            PLATE_ID = plateId;
            PLATE_BARCODE = plateSelect.options[plateSelect.selectedIndex].text;
        }

        function xCategoryChanged(xCategory) {
            X_CATEGORY = document.getElementById("refXCategory").value;
        }

        function yCategoryChanged() {
            Y_CATEGORY = document.getElementById("refYCategory").value;
        }

        %{-- standard curve start --}%

    </g:javascript>
        
	<asset:javascript src="result/ExperimentModel.js" />
	<asset:javascript src="result/showactions.js" />
	<asset:javascript src="result/ResultUI.js"/>

	<!-- scatter plot -->
	<asset:javascript src="scatter/Scatter.js" />
	<asset:javascript src="scatter/Scatter_control.js" />

    %{-- histogram js--}%
    <asset:javascript src="histogram/Histogram.js" />

	</body>
</html>
