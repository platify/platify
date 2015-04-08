<%@ page import="edu.harvard.capstone.result.Result" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'result.label', default: 'Result')}" />
		<title><g:message code="default.show.label" args="[entityName]" /></title>
		<asset:stylesheet href="jquery-ui.css"/>
		<asset:stylesheet href="grid/style.css"/>
		<asset:stylesheet href="grid/slick.grid.css"/>
		<asset:stylesheet href="grid/slick-default-theme.css"/>
		<asset:stylesheet href="grid/Grid.css"/>
		<asset:stylesheet href="colorbrewer.css"/>
	</head>
	<body class="container">

	<div class="content-fluid ">
		<div class="row">
			<!-- Left Column -->
			<div class="col-sm-2 content-body" style="padding-left: 20px">
				<h4>QA/QC</h4>
				<p>Z-factor:</p>
				<p>Z'-factor:</p>
			</div> <!-- Left Column END -->
			<!-- Right Column -->
			<div class="col-sm-10 content-body" style="padding-right: 30px">
				<div style="height: 50px;">
					<div class="pull-left">
						<h4>
							Experiment: <span>${experimentInstance?.name}</span>	
						</h4>
					</div>
					<div class="pull-right">
						<h4>
							Result: <span>${resultInstance?.name}</span>
						</h4>
					</div>
				</div>
				<div id="gridPanel">
					<div id="grid" style="height: 600px"></div>
				</div>
			</div> <!-- Right Column END -->	
		</div>
	</div>	
	<asset:javascript src="d3.v3.min.js"/>
	<asset:javascript src="colorbrewer.v1.min.js"/>

	<!-- TODO - pull these in from within Grid.js -->
	<asset:javascript src="jquery-ui.js"/>
	<asset:javascript src="jquery.event.drag-2.2.js"/>
	<asset:javascript src="selectize.js"/>
	<asset:javascript src="grid/slick.autotooltips.js"/>
	<asset:javascript src="grid/slick.cellcopymanager.js"/>
	<asset:javascript src="grid/slick.cellrangedecorator.js"/>
	<asset:javascript src="grid/slick.cellrangeselector.js"/>
	<asset:javascript src="grid/slick.cellselectionmodel.js"/>
	<asset:javascript src="grid/slick.core.js"/>
	<asset:javascript src="grid/slick.editors.js"/>
	<asset:javascript src="grid/slick.grid.js"/>
	<asset:javascript src="grid/Grid.js"/>
	<asset:javascript src="grid/Grid2Merge.js"/>
	<!-- END TODO -->

	<asset:javascript src="result/create.js"/>
	<g:javascript>
	console.log("yup");
	</g:javascript>
</body>
</html>
