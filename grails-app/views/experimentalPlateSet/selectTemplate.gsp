<!DOCTYPE html>
<html>
	<head lang="en">
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'experimentalPlateSet.label', default: 'ExperimentalPlateSet')}" />
		<title>Select Template</title>
		
		<g:javascript>
			window.expId = ${experimentalPlateSetInstance.id};
		</g:javascript>
		
		<asset:stylesheet href="jquery-ui.css"/>
		<asset:stylesheet href="selectize.css"/>
	    <asset:stylesheet href="grid/style.css"/>
	    <asset:stylesheet href="grid/slick.grid.css"/>
	    <asset:stylesheet href="grid/slick-default-theme.css"/>
	    <asset:stylesheet href="grid/Grid.css"/>
	    <asset:stylesheet href="selectize.css"/>
	    
	</head>
	<body>	
		<div class="content-fluid ">
			<div class="row">
				<div class="col-sm-12 content-body">
					<h3 style="margin-left:15px">Select Existing Template <span class="pull-right"><button class="btn btn-info btn-sm" id="saveTemplate" style="margin-right:15px">Save Choice and Continue</button></span></h3>
					<ol class="breadcrumb">
						<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
						<li><g:link controller="experimentalPlateSet" action="index">Assays</g:link></li>
						<li><g:link controller="experimentalPlateSet" action="showactions" id="${experimentalPlateSetInstance.id}">Show Assay</g:link></li>
						<li><g:link controller="experimentalPlateSet" action="selectTemplate" id="${experimentalPlateSetInstance.id}">Select Template</g:link></li>
					</ol>						
					<g:render template="previewTemplateGrid"/>
				</div>
			</div>
		</div>
	</body>
</html>
