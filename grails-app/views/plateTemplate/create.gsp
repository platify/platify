<!DOCTYPE html>
<html>
	<head lang="en">
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'plateTemplate.label', default: 'PlateTemplate')}" />
		<title><g:message code="default.create.label" args="[entityName]" /></title>
		
		<g:javascript>
			window.expId = ${expId};
			window.tName = "${templateName}";
			window.tHeight = "${gridHeigth}";
			window.tWidth = "${gridWidth}";
		</g:javascript>
		
		<asset:stylesheet href="jquery-ui.css"/>
	    <asset:stylesheet href="grid/style.css"/>
	    <asset:stylesheet href="grid/slick.grid.css"/>
	    <asset:stylesheet href="grid/slick-default-theme.css"/>
	    <asset:stylesheet href="grid/Grid.css"/>
	</head>
	<body>
		<div class="content-fluid">
			<div class="row">
				<div class="col-sm-12 content-body">
					<h3 style="margin-left:15px">Create New Template <span class="pull-right"><button id="saveTemplate"  class="btn btn-info btn-sm" style="margin-right:15px">Save Template and Continue</button></span></h3>
					<ol class="breadcrumb">
						<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
						<li><g:link controller="experimentalPlateSet" action="index">Assays</g:link></li>
						<li><g:link controller="experimentalPlateSet" action="showactions" id="${expId}">Show Assay</g:link></li>
						<li><g:link controller="plateTemplate" action="create" id="${expId}">Create Template</g:link></li>
					</ol>
					<g:render template="assignTemplateValues"/>					
				</div>
			</div>
		</div>
	</body>
</html>
