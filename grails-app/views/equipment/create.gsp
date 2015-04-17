<!DOCTYPE html>
<html>
<head lang="en">
	<meta name="layout" content="main">
	<g:set var="entityName" value="${message(code: 'equipment.label', default: 'Equipment')}" />
	<title><g:message code="default.edit.label" args="[entityName]" /></title>

    <asset:stylesheet href="jquery-ui.css"/>
    <asset:stylesheet href="grid/style.css"/>
    <asset:stylesheet href="grid/slick.grid.css"/>
    <asset:stylesheet href="grid/slick-default-theme.css"/>
    <asset:stylesheet href="grid/Grid.css"/>
    <asset:stylesheet href="selectize.css"/>
</head>
<body class="container">
	<div class="">
		
	</div>

	<div class="content-fluid">
			<div class="row">
				<div class="col-sm-12 content-body">
				<h2>
					Output Parse Configuration <span class="pull-right"><button
							id="importResults" class="btn btn-info btn-sm">Import
							results</button>&nbsp;
						<button class="btn btn-info btn-sm" id="saveConfigToServer">Save</button>
						<button class="btn btn-info btn-sm" id="saveAsConfigToServer">Save As</button></span>
				</h2>
				<g:render template="parser"/>
				</div> 
			</div>
		</div>	
</body>
</html>