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
					Params: <span id="curveParameters"></span>
				</div>
				<div class="centerWrapper" style="text-align: center">
					<button id="doseResponseButton">Generate</button>
					<button id="setParameterButton">Parameters</button>
				</div>
			</div>
		</div>
	</div>
	<div class="col-md-8">
		<div class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title">
					<span id="rawDataLabel">Dose Response Curve</span>
				</h4>
			</div>
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

<asset:javascript src="analysis/DoseResponseCurve.js" />

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

		<g:remoteFunction controller="doseResponse" action="getfittedData"
						  onSuccess="updateDoseCurveData(data)"
						  params="'experiment_id='+EXPERIMENT_ID + '&compound_name='+compound"/>

	}

	function updateDoseCurveData(data) {
		DR_CURVE_DATA_JSON = data;
	}

</g:javascript>

<asset:javascript src="result/ExperimentModel.js" />
</body>
</html>