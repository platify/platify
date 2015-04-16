
<%@ page import="edu.harvard.capstone.result.Result" %>
<%@ page import="edu.harvard.capstone.editor.ExperimentalPlateSet" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'result.label', default: 'Result')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>

		<asset:stylesheet href="jquery-ui.css"/>
		<asset:stylesheet href="grid/style.css"/>
		<asset:stylesheet href="grid/slick.grid.css"/>
		<asset:stylesheet href="grid/slick-default-theme.css"/>
		<asset:stylesheet href="grid/Grid.css"/>
	</head>
	<body>
		<div class="content-fluid">
			<div class="row">
				<!-- Left Column -->
				<div class="col-sm-2">
					<div>
					<g:select
						id="experimentSelect"
						name="name"
						from="${edu.harvard.capstone.editor.ExperimentalPlateSet.list()}"
						optionKey="id"
						optionValue="${{it.name + " - " + it.id}}"
						onChange="updatePlateList(this.value)"
					/>
					</div>
					<div>
					<select id="plateSelect" onChange="updateResults(this.value)"></select>
					</div>
					<div><h2>Z-Factor</h2><div id="zFactor"></div></div>
					<div><h2>Z'-Factor</h2><div id="zPrimeFactor"></div></div>
				</div> <!-- Left Column END -->
				<!-- Right Column -->
				<div class="col-sm-10">
				<div id="resultGrid" style="width:100%;height:650px;"></div>
				<pre id="dump"></pre>
				</div> <!-- Right Column END -->	
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
	<asset:javascript src="grid/Grid2Merge.js" />

	<!-- d3 -->
	<asset:javascript src="d3.v3.min.js" />

	<!-- results-specific js -->
	<g:javascript>
	var READ_EXPERIMENT_URL = "${createLink(action: 'readExperiment', experimentInstance: null)}";
	</g:javascript>
	<asset:javascript src="plate-statistics/statistics.js" />
	<asset:javascript src="result/index.js" />
	</body>
</html>
