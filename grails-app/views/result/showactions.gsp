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
							</tr>
						</thead>
					</table>
				</div>
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
                        <li><a href="#histogram">Histogram</a></li>
                    </ul>
					<div id="resultGrid" class="Blues" style="width:100%;height:650px;"></div>
					<div id="scatterplot" style="width:100%;height:650px;"></div>
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
	<g:javascript>
	var RESULT_SAVE_REFACTORED_DATA_URL = "${createLink(controller: 'refactoredData', action: 'save', resultInstance: null)}";
        var IMPORT_DATA_JSON = '${importData.encodeAsJSON()}';
	</g:javascript>
	<asset:javascript src="result/ExperimentModel.js" />
	<asset:javascript src="result/showactions.js" />
	<asset:javascript src="result/ResultUI.js"/>
	
	<!-- scatter plot -->
	<asset:javascript src="scatter/Scatter.js" />

    %{-- histogram js--}%
    <asset:javascript src="histogram/Histogram.js" />

	</body>
</html>
