
<%@ page import="edu.harvard.capstone.parser.Equipment" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'equipment.label', default: 'Equipment')}" />
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
									
									<g:sortableColumn property="machineName" title="${message(code: 'equipment.machine.label', default: 'Machine')}" />
								
									<g:sortableColumn property="description" title="${message(code: 'equipment.description.label', default: 'Description')}" />

									<g:sortableColumn property="dateCreated" title="${message(code: 'equipment.date.label', default: 'Date')}" />
																
									<th>Update</th>
									<th>Delete</th>
								
								</tr>
							</thead>
							<tbody>
							<g:each in="${equipmentInstanceList}" status="i" var="equipmentInstance">
								
								<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
								
									<td>${equipmentInstance.id}</td>

									<td>${fieldValue(bean: equipmentInstance, field: "name")}</td>

									<td>${fieldValue(bean: equipmentInstance, field: "machineName")}</td>
								
									<td>${fieldValue(bean: equipmentInstance, field: "description")}</td>

									<td>${fieldValue(bean: equipmentInstance, field: "dateCreated")}</td>
								
									<td>
										<g:link id="${equipmentInstance.id}" action="load"><button class="btn btn-info btn-xs">View</button></g:link>
									</td>	

									<td>
										<g:if test="${equipmentInstance?.canUpdate()}">
											<g:link id="${equipmentInstance.id}" action="erase"><button class="btn btn-danger btn-xs">Delete</button></g:link>
										</g:if>
										<g:if test="${!equipmentInstance?.canUpdate()}">
											<button class="btn btn-xs">--NA--</button>
										</g:if>	
									</td>	
								
								</tr>

							</g:each>
							</tbody>
						</table>
						<ul class="pagination">
							<li><g:paginate total="${equipmentInstanceCount ?: 0}" /></li>
						</ul>
					</div>	
				</div> <!-- Right Column END -->	
			</div>
		</div>
	</body>
</html>
