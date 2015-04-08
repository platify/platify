<!DOCTYPE html>
<html>
	<head lang="en">
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'plateTemplate.label', default: 'PlateTemplate')}" />
		<title><g:message code="default.create.label" args="[entityName]" /></title>
		
		<g:javascript>
		  window.expId = ${expPlateSetInstance.id};
		</g:javascript>
		
		<asset:stylesheet href="jquery-ui.css"/>
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
				<div class="col-sm-12">
					<ol class="breadcrumb">
						<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
						<li><g:link controller="experimentalPlateSet" action="index">Experiments</g:link></li>
						<li><g:link controller="experimentalPlateSet" action="showactions" id="${expPlateSetInstance.id}">Show Experiment</g:link></li>
						<li><g:link controller="plateTemplate" action="create" id="${expPlateSetInstance.id}">Create Template</g:link></li>
					</ol>						
				</div>
				<!-- Right Column -->
				<div class="col-sm-12 content-body" style="padding-right: 30px">
					<g:render template="assignTemplateValues"/>
				</div> <!-- Right Column END -->	
			</div>
		</div>
	</body>
</html>
