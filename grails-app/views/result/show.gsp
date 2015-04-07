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
	</head>
	<body class="container">

	<div class="content-fluid ">
		<div class="row">
			<!-- Left Column -->
			<div class="col-sm-2">
				<div class="nav" role="navigation">
					<ul class="nav nav-pills nav-stacked">
						<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
						<li><g:link class="create" action="index">List</g:link></li>
						<li class="active"><a href="#">Parse</a></li>
					</ul>			
				</div>					
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
			</div> <!-- Right Column END -->	
		</div>
	</div>	
	<g:javascript>
	</g:javascript>
</body>
</html>
