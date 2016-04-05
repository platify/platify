<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="edu.harvard.capstone.editor.PlateSet; edu.harvard.capstone.editor.ExperimentalPlateSet" %>
<html>
<head>
    <meta name="layout" content="main">
    <title>Standard Curve Normalization</title>

    <asset:stylesheet href="jquery-ui.css"/>
    <asset:stylesheet href="grid/style.css"/>
    <asset:stylesheet href="grid/slick.grid.css"/>
    <asset:stylesheet href="grid/slick-default-theme.css"/>
    <asset:stylesheet href="grid/Grid.css"/>
</head>

<body>
<div class="container">
    <div class="row">
        <h3 style="margin-left: 15px">Standard Curve Normalization</h3>
    </div>
    <div class="panel panel-default">
        <div class="panel-heading">
            <h4 class="panel-title">
                <span id="selectRefLabel">Reference Plate</span>
            </h4>
        </div>
        <div class="panel-body">
            <h5>UNKNOWN SAMPLE</h5>
            Experiment: <g:select id="unknownExperiment" name="refExperiment" from ="${experimentList}"
                  optionKey="id" optionValue="name" noSelection="[null:' ']" onchange="getUnknownResults(this.value)"/><br>
            Plate: <span id="unknownPlateSelect"></span><br><br>

            <h5>REFERENCE SAMPLE</h5>
            Experiment: <g:select id="refExperiment" name="refExperiment" from ="${experimentList}"
                optionKey="id" optionValue="name" noSelection="[null:' ']" onchange="refExperimentChanged(this.value);" /><br>
            Plate: <span id="refPlateSelect"></span><br><br>

            <h5>PROPERTIES</h5>
            Known Property: <span id="refXCategorySelect"></span><br>
            Unknown Property: <span id="refYCategorySelect"></span><br><br>

            <h5>REGRESSION MODEL</h5>
            <input type="radio" name="fitModel" value="linearThroughOrigin" checked="checked"> Linear<br>
            <input type="radio" name="fitModel" value="exponential"> Exponential<br>
            <input type="radio" name="fitModel" value="logarithmic"> Logarithmic<br>
            <input type="radio" name="fitModel" value="power"> Power<br>
            <input type="radio" name="fitModel" value="polynomial"> Polynomial
            <input type="text" id="degree" name="degree" placeholder="degree" maxlength="1" size="2"> <br>

            <button id="stdCurveButton">Generate</button>
        </div>
    </div>
    <div class="panel panel-default">
        <div class="panel-heading">
            <h4 class="panel-title">
                <span id="rawDataLabel">Standard Curve</span>
            </h4>
        </div>
        <div class="panel-body">
            <div id="stdCurveVis"></div>
        </div>
    </div>
    <div class="panel panel-default">
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

<!-- importData forked from the parser -->
<asset:javascript src="result/ImportData.js" />

<!-- results-specific js -->
<asset:javascript src="plate-statistics/statistics.js" />

<asset:javascript src="regression.js"/>
<asset:javascript src="analysis/StdCurve.js" />

<g:javascript>
    var UNKNOWN_EXPERIMENT_ID;
    var UNKNOWN_PLATE_ID;
    var REFERENCE_DATA_JSON;
    var REF_EXPERIMENT_ID;
    var REF_PLATE_ID;
    var X_CATEGORY;
    var Y_CATEGORY;

    function getUnknownResults(experimentId) {
        UNKNOWN_EXPERIMENT_ID = experimentId;

        <g:remoteFunction controller="stdCurve" action="getResultData"
                          onSuccess="updateUnknownPlates(data)"
                          params="'experiment_id='+experimentId"/>
    }

    function updateUnknownPlates(data) {
        IMPORT_DATA_JSON = data;
        <g:remoteFunction controller="stdCurve" action="getUnknownPlates"
                      update="unknownPlateSelect"
                      params="'experiment_id='+UNKNOWN_EXPERIMENT_ID"/>
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
        <g:remoteFunction controller="stdCurve" action="getReferenceXCategories"
                      update="refXCategorySelect"
                      params="'plate_id='+plateId"/>

        REF_PLATE_ID = document.getElementById("refPlate").value;
    }

    function xCategoryChanged(xCategory) {
        var plateId = document.getElementById("refPlate").value;
        <g:remoteFunction controller="stdCurve" action="getReferenceYCategories"
                      update="refYCategorySelect"
                      params="'plate_id='+plateId + '&x_category='+xCategory"/>

        X_CATEGORY = document.getElementById("refXCategory").value;
    }

    function yCategoryChanged() {
        <g:remoteFunction controller="stdCurve" action="getReferenceData"
            onSuccess="updateReferenceData(data)"
                          params="'plate_id='+REF_PLATE_ID"/>

        Y_CATEGORY = document.getElementById("refYCategory").value;
    }

    function updateReferenceData(data) {
        REFERENCE_DATA_JSON = data;
    }

</g:javascript>

<asset:javascript src="result/ExperimentModel.js" />
</body>
</html>