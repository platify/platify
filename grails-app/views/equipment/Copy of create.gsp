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

	<div class="content-fluid ">
			<div class="row">
				<!-- Left Column -->
				<div class="col-sm-2">
					<div class="nav" role="navigation">
						<ul class="nav nav-pills nav-stacked">
							<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
							<li><g:link class="create" action="index">List</g:link></li>
							<li class="active"><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
						</ul>			
					</div>					
				</div> <!-- Left Column END -->
				<!-- Right Column -->
				<div class="col-sm-10 content-body" style="padding-right: 30px">
					<g:render template="parser"/>
				</div> <!-- Right Column END -->	
			</div>
		</div>	
</body>
</html>

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
	<body>	
		<div class="content-fluid ">
			<div class="row">
				<div class="col-sm-12 content-body">
					<h2>Select Existing Template <span class="pull-right"><button class="btn btn-info btn-sm" id="saveTemplate">Save Choice and Continue</button></span></h2>
					<ol class="breadcrumb">
						<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
						<li><g:link controller="experimentalPlateSet" action="index">Experiments</g:link></li>
						<li><g:link controller="experimentalPlateSet" action="showactions" id="${experimentalPlateSetInstance.id}">Show Experiment</g:link></li>
						<li><g:link controller="experimentalPlateSet" action="selectTemplate" id="${experimentalPlateSetInstance.id}">Select Template</g:link></li>
					</ol>						
					<g:render template="previewTemplateGrid"/>
				</div>
			</div>
		</div>
	</body>
</html>