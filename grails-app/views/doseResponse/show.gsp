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
	<div class="panel panel-default">
		<div class="panel-heading">
			<h4 class="panel-title">
				<span id="selectRefLabel">Settings</span>
			</h4>
		</div>
		<div class="panel-body">
			<div class="col-md-3">
				Experiment: <g:select id="experiment" name="refExperiment" from ="${experimentList}"
									  optionKey="id" optionValue="name" noSelection="[null:' ']" onchange="getfittedData(this.value)"/><br>
				Compound: <span id="refCompoundSelect"></span>
			</div>
			<div class="centerWrapper" style="text-align: center">
				<button id="doseResponseButton">Generate</button>
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
	<div class="col-md-4">
		<div class="panel panel-default" style="height: 650px; overflow: auto;">
			<div class="panel-heading">
				<h4 class="panel-title">
					<span id="inferredLabel">Inferred Properties</span>
				</h4>
			</div>
			<div class="panel-body">
				<div id="inferredTable"></div>
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
    var COMPOUND
    var FITTED_DATA_JSON;

    function getUnknownResults(experimentId) {
        UNKNOWN_EXPERIMENT_ID = experimentId;

        <g:remoteFunction controller="stdCurve" action="getResultData"
						  onSuccess="updateUnknownPlates(data)"
						  params="'experiment_id='+experimentId"/>
	}

    function unknownPlateChanged() {
        var unknownPlateSelect = document.getElementById("unknownPlate");
        UNKNOWN_PLATE_ID = unknownPlateSelect.options[unknownPlateSelect.selectedIndex].text;
    }

    function refExperimentChanged(experimentId) {
	<g:remoteFunction controller="stdCurve" action="getReferencePlates"
					  update="refPlateSelect"
					  params="'experiment_id='+experimentId"/>
	REF_EXPERIMENT_ID = document.getElementById("refExperiment").value;
}

function refPlateChanged(plateId) {
    REF_PLATE_ID = document.getElementById("refPlate").value;

	<g:remoteFunction controller="stdCurve" action="getReferenceXCategories"
					  update="refXCategorySelect"
					  params="'plate_id='+plateId"/>

	<g:remoteFunction controller="stdCurve" action="getReferenceData"
					  onSuccess="updateReferenceData(data)"
					  params="'plate_id='+REF_PLATE_ID"/>

	}



</g:javascript>

<asset:javascript src="result/ExperimentModel.js" />
</body>
</html>