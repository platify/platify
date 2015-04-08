<!DOCTYPE html>
<html>
	<head lang="en">
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'experimentalPlateSet.label', default: 'ExperimentalPlateSet')}" />
		<title><g:message code="default.create.label" args="[entityName]" /></title>
		
		<asset:stylesheet href="jquery-ui.css"/>
		<asset:stylesheet href="selectize.css"/>
	    <asset:stylesheet href="grid/style.css"/>
	    <asset:stylesheet href="grid/slick.grid.css"/>
	    <asset:stylesheet href="grid/slick-default-theme.css"/>
	    <asset:stylesheet href="grid/Grid.css"/>
	    
	</head>
	<body>
		<div class="">
			
		</div>
	
		<div class="content-fluid ">
			<div class="row">
				<!-- Left Column -->
				<div class="col-sm-12">
					<ol class="breadcrumb">
						<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
						<li><g:link controller="experimentalPlateSet" action="index">Experiments</g:link></li>
						<li><g:link controller="experimentalPlateSet" action="showactions" id="${experimentalPlateSetInstance.id}">Show Experiment</g:link></li>
						<li><g:link controller="experimentalPlateSet" action="selectTemplate" id="${experimentalPlateSetInstance.id}">Select Template</g:link></li>
					</ol>						
				</div>
				<!-- right Column -->
				<div class="col-sm-12 content-body" style="padding-left: 30px">
					<g:render template="previewTemplateGrid"/>
				</div> <!-- right Column END -->
			</div>
		</div>
	</body>
</html>
