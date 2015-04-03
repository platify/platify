<!DOCTYPE html>
<html>
	<head lang="en">
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'plateTemplate.label', default: 'PlateTemplate')}" />
		<title><g:message code="default.create.label" args="[entityName]" /></title>
		
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
					<g:render template="assignTemplateValues"/>
				</div> <!-- Right Column END -->	
			</div>
		</div>
	</body>
</html>
