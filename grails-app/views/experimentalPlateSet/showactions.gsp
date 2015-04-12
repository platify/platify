<!DOCTYPE html>
<html>
	<head lang="en">
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'experimentalPlateSet.label', default: 'ExperimentalPlateSet')}" />
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
				<div class="col-sm-12 content-body">
					<h1>Selected Experiment:</h1>
					<ol class="breadcrumb">
						<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
						<li><g:link controller="experimentalPlateSet" action="index">Experiments</g:link></li>
						<li><g:link controller="experimentalPlateSet" action="showactions" id="${experimentalPlateSetInstance.id}">Show Experiment</g:link></li>
					</ol>
					<div class="col-sm-6">
						<div id="expDetailsPanel" class="panel panel-info">
							<div class="panel-heading">
								<h4 class="panel-title">Experiment Details</h4>
							</div>
							<div class="panel-body ">
								<label>Experiment ID:</label> ${experimentalPlateSetInstance.id}<br/>
								<label>Experiment Name:</label> ${experimentalPlateSetInstance.name}<br/>
								<label>Experiment Description:</label> ${experimentalPlateSetInstance.description}<br/>
								<label>Experiment Owner:</label> ${experimentalPlateSetInstance.owner}<br/>
							</div>
						</div>
					</div>
					<div class="col-sm-6">
						<div id="expActionPanel" class="panel panel-info">
							<div class="panel-heading">
								<h4 class="panel-title">Add New Plate to Experiment:</h4>
							</div>
							<div class="panel-body">
								<g:link id="${experimentalPlateSetInstance.id}" action="selectTemplate" class="btn btn-info btn-sm">Select Existing Template</g:link>
								<g:link id="${experimentalPlateSetInstance.id}" controller="plateTemplate" action="create" class="btn btn-info btn-sm">Create New Template</g:link>
							</div>
						</div>
					</div>
				
					<!--  Existing Plates -->
					<div class="col-sm-12">
						<div id="platePanel" class="panel panel-info">
							<div class="panel-heading">
								<h4 class="panel-title">Experiment Plate List:</h4>
							</div>
							<div class="panel-body ">
								<g:if test="${flash.message}">
									<div class="message" role="status">${flash.message}</div>
								</g:if>
								<table class="table table-striped table-hover">
								<thead>
										<tr>
											<g:sortableColumn property="id" title="#" />
											<g:sortableColumn property="name" title="${message(code: 'plateTemplate.name.label', default: 'Name')}" />
											<g:sortableColumn property="owner" title="${message(code: 'plateTemplate.owner.label', default: 'Owner')}" />	
											<g:sortableColumn property="dateCreated" title="${message(code: 'plateTemplate.date.label', default: 'Date')}" />																
										</tr>
									</thead>
									<tbody>
									<g:each in="${plateTemplatelist}" status="i" var="plateTemplateInstance">
										<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
											<td>${plateTemplateInstance.id}</td>
											<td>${fieldValue(bean: plateTemplateInstance, field: "name")}</td>
											<td>${plateTemplateInstance.owner.firstName + ' ' + plateTemplateInstance.owner.lastName}</td>
											<td>${fieldValue(bean: plateTemplateInstance, field: "dateCreated")}</td>
										</tr>
									</g:each>
									</tbody>
								</table>
								<div class="pagination">
									<g:paginate total="${plateTemplateInstanceCount ?: 0}" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>
