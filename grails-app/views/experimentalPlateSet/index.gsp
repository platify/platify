
<%@ page import="edu.harvard.capstone.editor.ExperimentalPlateSet" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'experimentalPlateSet.label', default: 'Experiment')}" />
		<title><g:message code="default.list.label" args="[entityName]" /></title>
	</head>
	<body>
		<div class="content-fluid">
			<div class="row">
				<!-- Left Column -->
				<div class="col-sm-2">
					<div class="nav" role="navigation">
						<ul class="nav nav-pills nav-stacked">
							<li><a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a></li>
							<li class="active"><g:link class="create" action="index">List</g:link></li>
							<li><g:link class="create" action="create"><g:message code="default.new.label" args="[entityName]" /></g:link></li>
						</ul>			
					</div>					
				</div> <!-- Left Column END -->
				<!-- Right Column -->
				<div class="col-sm-9">
					<div id="list-scientist" class="content scaffold-list" role="main">
						<h1><g:message code="default.list.label" args="[entityName]" /></h1>
						<g:if test="${flash.message}">
							<div class="message" role="status">${flash.message}</div>
						</g:if>
						<table class="table table-striped table-hover">
						<thead>
								<tr>
									<g:sortableColumn property="id" title="#" />

									<g:sortableColumn property="name" title="${message(code: 'equipment.name.label', default: 'Name')}" />
									
									<g:sortableColumn property="description" title="${message(code: 'equipment.description.label', default: 'Description')}" />

									<g:sortableColumn property="owner" title="${message(code: 'equipment.machine.label', default: 'Owner')}" />	

									<g:sortableColumn property="dateCreated" title="${message(code: 'equipment.date.label', default: 'Date')}" />																
									<th>Action</th>
								
								</tr>
							</thead>
							<tbody>
							<g:each in="${experimentalPlateSetInstanceList}" status="i" var="experimentInstance">
								
								<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
								
									<td>${experimentInstance.id}</td>

									<td>${fieldValue(bean: experimentInstance, field: "name")}</td>

									<td>${fieldValue(bean: experimentInstance, field: "description")}</td>
								
									<td>${experimentInstance.owner.firstName + ' ' + experimentInstance.owner.lastName}</td>

									<td>${fieldValue(bean: experimentInstance, field: "dateCreated")}</td>
								
									<td>
										<g:link id="${experimentInstance.id}" action="selectexperiment"><i class="fa fa-check parse-btn"></i></g:link>
									</td>
								
								</tr>

							</g:each>
							</tbody>
						</table>
						<ul class="pagination">
							<li><g:paginate total="${experimentalPlateSetInstanceCount ?: 0}" /></li>
						</ul>
					</div>	
				</div> <!-- Right Column END -->	
			</div>
		</div>
	</body>
</html>
