<%@ page contentType="text/html;charset=UTF-8" %>
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
<g:javascript>
    var RESULT_SAVE_REFACTORED_DATA_URL = "${createLink(controller: 'refactoredData', action: 'save', resultInstance: null)}";
        var IMPORT_DATA_JSON = '${importData.encodeAsJSON()}';
</g:javascript>
<asset:javascript src="result/ExperimentModel.js" />
<asset:javascript src="analysis/StdCurve.js" />

<asset:javascript src="regression.js"/>

</body>
</html>