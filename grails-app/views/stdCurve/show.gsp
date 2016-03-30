<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="edu.harvard.capstone.editor.ExperimentalPlateSet" %>
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
                <span id="selectRefLabel">[ Testing Reference Selection ]</span>
            </h4>
        </div>
        <div class="panel-body">
            Experiment: <g:select id="refExperiment" name="refExperiment" from ="${ExperimentalPlateSet.listOrderByName()}"
            optionKey="id" optionValue="name" noSelection="[null:' ']" onchange="experimentChanged(this.value);" />
            <br>

            Plate: <span id="refPlateSelect"></span>
            <br>

            Plot on X-Axis: <span id="refXCategorySelect"></span><br>
            Plot on Y-Axis: <span id="refYCategorySelect"></span>

        </div>
    </div>
    <div class="panel panel-default">
        <div class="panel-heading">
            <h4 class="panel-title">
                <span id="rawDataLabel">[ Testing Standard Curve ]</span>
            </h4>
        </div>
        <div class="panel-body">
            <div id="stdCurveVis" style="width:100%;height:650px;"></div>
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

<asset:javascript src="analysis/StdCurve.js" />

<g:javascript>
    var RESULT_SAVE_REFACTORED_DATA_URL = "${createLink(controller: 'refactoredData', action: 'save', resultInstance: null)}";
    var IMPORT_DATA_JSON = '${importData.encodeAsJSON()}';

    var REFERENCE_DATA_JSON;
    var EXPERIMENT_ID;
    var PLATE_ID;
    var X_CATEGORY;
    var Y_CATGEORY;

    function experimentChanged(experimentId) {
        <g:remoteFunction controller="stdCurve" action="getReferencePlates"
                      update="refPlateSelect"
                      params="'experiment_id='+experimentId"/>
        EXPERIMENT_ID = document.getElementById("refExperiment").value;
    }

    function plateChanged(plateId) {
        <g:remoteFunction controller="stdCurve" action="getReferenceXCategories"
                      update="refXCategorySelect"
                      params="'plate_id='+plateId"/>

        PLATE_ID = document.getElementById("refPlate").value;
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
            onSuccess="getReferenceData(data)"
                          params="'plate_id='+PLATE_ID"/>

        Y_CATEGORY = document.getElementById("refYCategory").value;
    }


</g:javascript>

<asset:javascript src="result/ExperimentModel.js" />

<asset:javascript src="regression.js"/>

</body>
</html>