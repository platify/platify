<!DOCTYPE html>
<html>
	<head lang="en">
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'experimentalPlateSet.label', default: 'ExperimentalPlateSet')}" />
		<title>Selected Assay</title>
	</head>
	<body>
		<div class="content-fluid ">
			<div class="row">
				<div class="col-sm-12 content-body">
					<h3 style="margin-left:15px">${experimentalPlateSetInstance.name}</h3>
					<ol class="breadcrumb">
						<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
						<li><g:link controller="experimentalPlateSet" action="index">Assays</g:link></li>
						<li>Show Assay</li>
					</ol>
					<div class="col-sm-6">
						<div id="expDetailsPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Assay Details</h4>
							</div>
							<div class="panel-body ">
								<h4>Assay ID: ${experimentalPlateSetInstance.id}</h4>
								<h4>Assay Description: ${experimentalPlateSetInstance.description}</h4>
								<h4>Assay Owner: ${experimentalPlateSetInstance.owner}</h4>
							</div>
						</div>
					</div>
					<div class="col-sm-6">
						<div id="expActionPanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Add New Plate to Assay:</h4>
							</div>
							<div class="panel-body">
								<g:link id="${experimentalPlateSetInstance.id}" action="selectTemplate" class="btn btn-info btn-sm">Select Existing Template</g:link>
								<button type="button" class="btn btn-info btn-sm" data-toggle="modal" data-target="#createTemplateModal">Create New Template</button>
							</div>
						</div>
					</div>
				
					<!--  Existing Plates -->
					<div class="col-sm-12">
						<div id="platePanel" class="panel panel-default">
							<div class="panel-heading">
								<h4 class="panel-title">Assay Plate List:</h4>
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

		<g:render template="/plateTemplate/createTemplateDialog"/>
	</body>
</html>
