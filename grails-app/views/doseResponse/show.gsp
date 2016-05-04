<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="edu.harvard.capstone.editor.PlateSet; edu.harvard.capstone.editor.ExperimentalPlateSet" %>
<html>
<head>
	<meta name="layout" content="main">
	<title>Dose Response Curve</title>

	<asset:stylesheet href="jquery-ui.css"/>
	<asset:stylesheet href="grid/style.css"/>
	<asset:stylesheet href="grid/slick.grid.css"/>
	<asset:stylesheet href="grid/slick-default-theme.css"/>
	<asset:stylesheet href="grid/Grid.css"/>
</head>

<body>
<div class="container">
	<div class="alert alert-error" id="errorMessage"  style="display:inline"></div>
	<div class="row">
		<h3 style="margin-left: 15px">Dose Response Curve</h3>
	</div>
	<div class="col-md-8">
		<div class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title">
					<span id="selectRefLabel">Settings</span>
				</h4>
			</div>
			<div class="panel-body">
				<div class="col-md-8">
					Experiment: <g:select id="experiment" name="refExperiment" from ="${experimentList}"
										  optionKey="id" optionValue="name" noSelection="[null:' ']" onchange="updateCompounds(this.value)"/><br>
					Compound: <span id="compoundSelect"></span><br>
				</div>
				<div class="col-md-8">
					<div class="form-group">
						<label class="control-label col-sm-2" for="maxParameter">Max:</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="maxParameter" value=""/>
						</div>
						<label class="control-label col-sm-2" for="minParameter">Min:</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="minParameter" value=""/>
						</div>
						<label class="control-label col-sm-2" for="ec50Parameter">EC50:</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="ec50Parameter" value=""/>
						</div>
						<label class="control-label col-sm-2" for="slopeParameter">Slope:</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="slopeParameter" value=""/>
						</div>
					</div>
				</div>
				<div class="centerWrapper" style="text-align: left">
					<button id="doseResponseButton">Update Parameters</button>
				</div>
			</div>
		</div>
	</div>
	<div class="col-md-8">
		<div class="panel panel-default">
			<div class="panel-body">
				<div id="doseResponseCurveVis"></div>
			</div>
		</div>
	</div>
</div>

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

<asset:javascript src="doseResponse/DoseResponseCurve.js" />

<g:javascript>
    var EXPERIMENT_ID;
    var COMPOUND;
	var DR_CURVE_DATA_JSON;

    function updateCompounds(experimentId) {
        EXPERIMENT_ID = experimentId;

        <g:remoteFunction controller="doseResponse" action="updateCompounds"
						  update="compoundSelect"
						  params="'experiment_id='+experimentId"/>
	}

    function updateDoseResponseCurve(compound) {
		COMPOUND = compound;
		if (compound=="null")
			return;
		<g:remoteFunction controller="doseResponse" action="getfittedData"
						  onSuccess="renderDoseResponseCurve(data)"
						  params="'experiment_id='+EXPERIMENT_ID + '&compound_name='+COMPOUND"/>
	}

    function updateDoseResponseCurve2(min_param, max_param, ec50, slope) {
		<g:remoteFunction controller="doseResponse" action="getfittedData2"
						  onSuccess="renderDoseResponseCurve(data)"
						  params="'experiment_id='+EXPERIMENT_ID + '&compound_name=' + COMPOUND + '&min_param=' + min_param + '&max_param=' + max_param + '&ec50=' + ec50 + '&slope=' + slope"/>
	}

</g:javascript>

<asset:javascript src="result/ExperimentModel.js" />
</body>
</html>
